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
  TextField,
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

export default function CloneSimilarManyTraitsDialog({ onClose }: Props) {
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
  const [selectedTraitIds, setSelectedTraitIds] = useState([0]);
  const [max, setMax] = useState('0');

  const handleDuplicate = async (e: FormEvent) => {
    e.preventDefault();

    setIsDuplicating(true);

    try {
      const { pepes } = (
        await axios({
          method: 'POST',
          url: '/api/duplicateSimilarManyTraitsPepes',
          data: {
            id: selectedPepe!.id,
            traitIds: selectedTraitIds,
            max: Number(max),
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

  const selectedTraits = traits.filter((t) => selectedTraitIds.includes(t.id));

  const selectedPepeTraitOptions =
    selectedPepe?.traits.filter((t) => selectedTraitIds.includes(t.id)) || [];

  const possibleQuantity = selectedTraits.length
    ? selectedTraits.reduce((accum, t) => t.options.length * accum, 1)
    : 0;

  const hasMany = selectedTraits.some(
    (trait) =>
      (selectedPepe?.traits.filter((pepeTrait) => pepeTrait.id === trait.id) || []).length > 1,
  );

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
          Duplicating {Number(max) > 0 ? max : possibleQuantity} (or less) Similar Pepe
          {(Number(max) > 0 ? max : possibleQuantity) === 1 ? '' : 's'}
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
              {selectedTraitIds.map((selectedTraitId, index) => (
                <Grid item key={`trait-${index}`} xs={12}>
                  <Select
                    fullWidth
                    onChange={(e) => {
                      const updatedSelectedTraitIds = selectedTraitIds.slice();
                      updatedSelectedTraitIds.splice(index, 1, Number(e.target.value));
                      setSelectedTraitIds(updatedSelectedTraitIds);
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
              ))}
              <Grid item sx={{ flexGrow: 1 }}>
                <Button
                  onClick={() => {
                    const updatedSelectedTraitIds = selectedTraitIds.slice();
                    updatedSelectedTraitIds.push(0);
                    setSelectedTraitIds(updatedSelectedTraitIds);
                  }}
                >
                  Add New
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  helperText="Use '0' if no max is desired"
                  label="Max"
                  onChange={(e) => setMax(e.target.value)}
                  type="number"
                  value={max}
                />
              </Grid>
            </Grid>
            {possibleQuantity > 0 && !hasMany && (
              <Typography>
                {Number(max) > 0 ? max : possibleQuantity} (or less) similar Pepe
                {(Number(max) > 0 ? max : possibleQuantity) === 1 ? '' : 's'} will be created.
              </Typography>
            )}
            {hasMany ? (
              <Typography color="red">
                Not available to Pepes with multiple options of the same trait.
              </Typography>
            ) : error ? (
              <Typography color="red">{error}</Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button
            disabled={
              !selectedTraitIds.length ||
              selectedTraitIds.some((t) => !t) ||
              hasMany ||
              Number(max) < 0
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
