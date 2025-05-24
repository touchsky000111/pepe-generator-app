import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';

interface Props {
  onClose: () => void;
}

export default function CloneSimilarDialog({ onClose }: Props) {
  const selectedPepe = useEditorStore((state) => state.selectedPepe);
  const traits = usePepeStore((state) => state.traits);

  const [error, setError] = useState('');
  const [newPepes, setNewPepes] = useState<
    {
      id: number;
      traits: {
        id: number;
        file: string;
        folder: string;
        imageUrl?: string;
        optionId: number;
      }[];
    }[]
  >([]);
  const [isDone, setIsDone] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [selectedTraitId, setSelectedTraitId] = useState(0);
  const [selectedTraitOptionId, setSelectedTraitOptionId] = useState(0);

  const handleDuplicate = async (e: FormEvent) => {
    e.preventDefault();

    setIsDuplicating(true);

    try {
      const { pepes } = (
        await axios({
          method: 'POST',
          url: '/api/duplicateSimilarPepes',
          data: {
            id: selectedPepe!.id,
            traitId: selectedTraitId,
            traitOptionId: selectedTraitOptionId || undefined,
          },
        })
      ).data as {
        pepes: {
          id: number;
          traits: {
            id: number;
            file: string;
            folder: string;
            imageUrl?: string;
            optionId: number;
          }[];
        }[];
      };

      setIsDone(true);
      setNewPepes(pepes);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError('Unknown error');
      }
    }

    setIsDuplicating(false);
  };

  const selectedTrait = traits.find((t) => selectedTraitId === t.id);

  const selectedPepeTraitOptions =
    selectedPepe?.traits.filter((t) => t.id === selectedTraitId) || [];

  const possibleQuantity = selectedTrait
    ? selectedTrait.options.length - selectedPepeTraitOptions.length
    : 0;

  if (isDone) {
    return (
      <Dialog open>
        <DialogTitle>
          Duplicated {newPepes.length} Similar Pepe{newPepes.length === 1 ? '' : 's'}!
        </DialogTitle>
        <DialogContent>
          {newPepes.length === 0 && <div>There were no unique Pepes to generate.</div>}
          <Grid container>
            {newPepes.map((newPepe) => (
              <Grid item key={newPepe.id} position="relative" xs={3}>
                <Link
                  href={`/pepes/${newPepe.id}?page=${Math.ceil(newPepe.id / 100)}`}
                  target="_blank"
                >
                  <img
                    src={`/images/blank.png`}
                    style={{
                      display: 'block',
                    }}
                    width="100%"
                  />
                  {newPepe.traits.map((trait) => (
                    <img
                      key={`pepe-${newPepe.id}-trait-${trait.folder}-${trait.file}`}
                      src={
                        trait.imageUrl
                          ? trait.imageUrl
                          : `/images/traits/${trait.folder}/${trait.file}`
                      }
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                      width="100%"
                    />
                  ))}
                </Link>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Okay</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isDuplicating) {
    return (
      <Dialog open>
        <DialogTitle>
          Duplicating {possibleQuantity} (or less) Similar Pepe{possibleQuantity === 1 ? '' : 's'}
          ...
        </DialogTitle>
        <DialogContent>
          <Stack alignItems="center" justifyContent="center">
            <CircularProgress />
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose}>
      <form onSubmit={handleDuplicate}>
        <DialogTitle>Clone This Pepe</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item sx={{ flexGrow: 1 }}>
                <Select
                  fullWidth
                  onChange={(e) => {
                    setSelectedTraitId(Number(e.target.value));
                    setSelectedTraitOptionId(0);
                  }}
                  value={selectedTraitId}
                >
                  <MenuItem value={0}>(Please Select)</MenuItem>
                  {traits
                    .filter((trait) => trait.folder !== 'bg')
                    .map((trait) => (
                      <MenuItem key={trait.id} value={trait.id}>
                        {trait.name}
                      </MenuItem>
                    ))}
                </Select>
              </Grid>
            </Grid>
            {selectedPepeTraitOptions.length > 1 && (
              <Grid container alignItems="center" spacing={1}>
                <Grid item sx={{ flexGrow: 1 }}>
                  <Select
                    fullWidth
                    onChange={(e) => setSelectedTraitOptionId(Number(e.target.value))}
                    value={selectedTraitOptionId}
                  >
                    <MenuItem value={0}>(Please Select)</MenuItem>
                    {selectedTrait?.options
                      .filter((option) =>
                        selectedPepeTraitOptions.find(
                          (pepeTraitOption) => pepeTraitOption.optionId === option.id,
                        ),
                      )
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Grid>
              </Grid>
            )}
            {possibleQuantity > 0 && (
              <Typography>{possibleQuantity} (or less) similar Pepes will be created.</Typography>
            )}
            {error && <Typography color="red">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button
            disabled={
              !selectedTraitId || (selectedPepeTraitOptions.length > 1 && !selectedTraitOptionId)
            }
            type="submit"
          >
            Clone
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
