import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { usePepeStore } from '@/stores/pepe';
import traitOptionIsNew from '@/utils/traitOptionIsNew';
import traitOptionIsOld from '@/utils/traitOptionIsOld';
import traitOptionIsNewest from '@/utils/traitOptionIsNewest';
import { Delete } from '@mui/icons-material';
import traitOptionIsLast from '@/utils/traitOptionIsLast';

interface Props {
  onClose: () => void;
}

export default function CloneSimilarApprovedDialog({ onClose }: Props) {
  const traits = usePepeStore((state) => state.traits);

  const [error, setError] = useState('');
  const [newPepes, setNewPepes] = useState<
    {
      id: number;
      originalPepeId: number;
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

  const [filters, setFilters] = useState<
    Array<{
      traitId: number;
      traitOptionId: number;
    }>
  >([
    {
      traitId: 0,
      traitOptionId: 0,
    },
  ]);
  const [hasSingleTraits, setHasSingleTraits] = useState(true);
  const [isBasic, setIsBasic] = useState(true);
  const [max, setMax] = useState('100');
  const [selectedTraitId1, setSelectedTraitId1] = useState(0);
  const [selectedTraitOptionId1, setSelectedTraitOptionId1] = useState(0);
  const [selectedTraitId2, setSelectedTraitId2] = useState(0);
  const [selectedTraitOptionId2, setSelectedTraitOptionId2] = useState(0);

  const handleDuplicate = async (e: FormEvent) => {
    e.preventDefault();

    setIsDuplicating(true);

    try {
      const { pepes } = (
        await axios({
          method: 'POST',
          url: '/api/duplicateSimilarApprovedPepes',
          data: {
            filters,
            hasSingleTraits,
            isBasic,
            max: Number(max),
            traitId1: selectedTraitId1,
            traitOptionId1: selectedTraitOptionId1 || undefined,
            traitId2: selectedTraitId2 || undefined,
            traitOptionId2: selectedTraitOptionId2 || undefined,
          },
        })
      ).data as {
        pepes: {
          id: number;
          originalPepeId: number;
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

  const selectedTrait1 = traits.find((t) => selectedTraitId1 === t.id);
  const selectedTrait2 = traits.find((t) => selectedTraitId2 === t.id);

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
                <Link
                  href={`/pepes/${newPepe.originalPepeId}?page=${Math.ceil(
                    newPepe.originalPepeId / 100,
                  )}`}
                  target="_blank"
                  style={{
                    display: 'flex',
                    fontSize: '.7em',
                    justifyContent: 'center',
                    padding: '5px 0',
                  }}
                >
                  Cloned from #{newPepe.originalPepeId}
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
          Duplicating {max} (or less) Similar Pepe{Number(max) === 1 ? '' : 's'}
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
    <Dialog open onClose={onClose} maxWidth="xl">
      <form onSubmit={handleDuplicate}>
        <DialogTitle>Clone Similar Approved Pepes</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Stack flexDirection="row" gap={2}>
              <Stack gap={2}>
                <Typography>Filters</Typography>
                {filters.map((filter, filterIndex) => (
                  <div>
                    <Stack
                      alignItems="center"
                      direction="row"
                      gap={1}
                      key={`filter-${filterIndex}`}
                    >
                      <Select
                        fullWidth
                        onChange={(e) => {
                          const updatedFilters = filters.slice();
                          updatedFilters[filterIndex].traitId = Number(e.target.value);
                          setFilters(updatedFilters);
                        }}
                        required
                        value={filter.traitId}
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
                      <Select
                        fullWidth
                        onChange={(e) => {
                          const updatedFilters = filters.slice();
                          updatedFilters[filterIndex].traitOptionId = Number(e.target.value);
                          setFilters(updatedFilters);
                        }}
                        required
                        value={filter.traitOptionId}
                      >
                        <MenuItem value={0}>(Please Select)</MenuItem>
                        {(traits.find((t) => t.id === filter.traitId)?.options || [])
                          .filter((option) => traitOptionIsLast(option.createdAt))
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              <Stack
                                alignItems="center"
                                direction="row"
                                gap={2}
                                justifyContent="space-between"
                                width="100%"
                              >
                                {option.name} <Chip color="success" label="LAST" />
                              </Stack>
                            </MenuItem>
                          ))}
                        {(traits.find((t) => t.id === filter.traitId)?.options || [])
                          .filter((option) => traitOptionIsNewest(option.createdAt))
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              <Stack
                                alignItems="center"
                                direction="row"
                                gap={2}
                                justifyContent="space-between"
                                width="100%"
                              >
                                {option.name} <Chip color="primary" label="NEWEST" />
                              </Stack>
                            </MenuItem>
                          ))}
                        {(traits.find((t) => t.id === filter.traitId)?.options || [])
                          .filter((option) => traitOptionIsNew(option.createdAt))
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              <Stack
                                alignItems="center"
                                direction="row"
                                gap={2}
                                justifyContent="space-between"
                                width="100%"
                              >
                                {option.name} <Chip color="secondary" label="NEW" />
                              </Stack>
                            </MenuItem>
                          ))}
                        {(traits.find((t) => t.id === filter.traitId)?.options || [])
                          .filter((option) => traitOptionIsOld(option.createdAt))
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))}
                      </Select>
                      <IconButton
                        key={`option-${filterIndex}-delete`}
                        onClick={() => {
                          const updatedFilters = filters.slice();
                          updatedFilters.splice(filterIndex, 1);
                          setFilters(updatedFilters);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </div>
                ))}

                <Button
                  color="primary"
                  onClick={() => {
                    const updatedFilters = filters.slice();
                    updatedFilters.push({
                      traitId: 0,
                      traitOptionId: 0,
                    });
                    setFilters(updatedFilters);
                  }}
                  sx={{ backgroundColor: 'black !important' }}
                >
                  Add Filter
                </Button>
              </Stack>
              <Stack gap={2}>
                <Typography>Trait 1 (Required)</Typography>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item sx={{ flexGrow: 1 }}>
                    <Select
                      fullWidth
                      onChange={(e) => {
                        setSelectedTraitId1(Number(e.target.value));
                        setSelectedTraitOptionId1(0);
                      }}
                      required
                      value={selectedTraitId1}
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
                <Grid container alignItems="center" spacing={1}>
                  <Grid item sx={{ flexGrow: 1 }}>
                    <Select
                      fullWidth
                      onChange={(e) => setSelectedTraitOptionId1(Number(e.target.value))}
                      required
                      value={selectedTraitOptionId1}
                    >
                      <MenuItem value={0}>(Please Select)</MenuItem>
                      {selectedTraitOptionId2 && <Divider />}
                      {selectedTrait1?.options.some((option) =>
                        traitOptionIsLast(option.createdAt),
                      ) && (
                        <MenuItem value={-4}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="success" label="LAST" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait1?.options.some((option) =>
                        traitOptionIsNewest(option.createdAt),
                      ) && (
                        <MenuItem value={-3}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="primary" label="NEWEST" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait1?.options.some((option) =>
                        traitOptionIsNew(option.createdAt),
                      ) && (
                        <MenuItem value={-2}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="secondary" label="NEW" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait1?.options.some((option) =>
                        traitOptionIsOld(option.createdAt),
                      ) && (
                        <MenuItem value={-1}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="default" label="OLD" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTraitOptionId2 && <Divider />}
                      {selectedTrait1?.options
                        .filter((option) => traitOptionIsLast(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="success" label="LAST" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait1?.options
                        .filter((option) => traitOptionIsNewest(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="primary" label="NEWEST" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait1?.options
                        .filter((option) => traitOptionIsNew(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="secondary" label="NEW" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait1?.options
                        .filter((option) => traitOptionIsOld(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                </Grid>
              </Stack>
              <Stack gap={2}>
                <Typography>Trait 2 (Optional)</Typography>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item sx={{ flexGrow: 1 }}>
                    <Select
                      fullWidth
                      onChange={(e) => {
                        setSelectedTraitId2(Number(e.target.value));
                        setSelectedTraitOptionId2(0);
                      }}
                      value={selectedTraitId2}
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
                <Grid container alignItems="center" spacing={1}>
                  <Grid item sx={{ flexGrow: 1 }}>
                    <Select
                      fullWidth
                      onChange={(e) => setSelectedTraitOptionId2(Number(e.target.value))}
                      value={selectedTraitOptionId2}
                    >
                      <MenuItem value={0}>(Please Select)</MenuItem>
                      {selectedTraitOptionId2 && <Divider />}
                      {selectedTrait2?.options.some((option) =>
                        traitOptionIsLast(option.createdAt),
                      ) && (
                        <MenuItem value={-4}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="success" label="LAST" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait2?.options.some((option) =>
                        traitOptionIsNewest(option.createdAt),
                      ) && (
                        <MenuItem value={-3}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="primary" label="NEWEST" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait2?.options.some((option) =>
                        traitOptionIsNew(option.createdAt),
                      ) && (
                        <MenuItem value={-2}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="secondary" label="NEW" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTrait2?.options.some((option) =>
                        traitOptionIsOld(option.createdAt),
                      ) && (
                        <MenuItem value={-1}>
                          <Stack alignItems="center" direction="row" gap={1} width="100%">
                            <Chip color="default" label="OLD" />
                            <span>Group</span>
                          </Stack>
                        </MenuItem>
                      )}
                      {selectedTraitOptionId2 && <Divider />}
                      {selectedTrait2?.options
                        .filter((option) => traitOptionIsLast(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="success" label="LAST" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait2?.options
                        .filter((option) => traitOptionIsNewest(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="primary" label="NEWEST" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait2?.options
                        .filter((option) => traitOptionIsNew(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Stack
                              alignItems="center"
                              direction="row"
                              gap={2}
                              justifyContent="space-between"
                              width="100%"
                            >
                              {option.name} <Chip color="secondary" label="NEW" />
                            </Stack>
                          </MenuItem>
                        ))}
                      {selectedTrait2?.options
                        .filter((option) => traitOptionIsOld(option.createdAt))
                        .map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                </Grid>
              </Stack>
            </Stack>
            <TextField
              label="Max"
              fullWidth
              required
              onChange={(e) => setMax(e.target.value)}
              type="number"
              value={max}
            />
            <Stack direction="row">
              <FormControlLabel
                control={<Checkbox checked={isBasic} onChange={() => setIsBasic(!isBasic)} />}
                label="Only use Pepes with bg/eyes/mouth/frog traits"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasSingleTraits}
                    onChange={() => setHasSingleTraits(!hasSingleTraits)}
                  />
                }
                label="Only use Pepes with single traits"
              />
            </Stack>
            {error && <Typography color="red">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button disabled={!selectedTraitId1 || !Number(max)} type="submit">
            Clone
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
