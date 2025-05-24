import { Check as CheckIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';

import { usePepeStore } from '@/stores/pepe';
import { useRouter } from 'next/router';
import getQueryString from '@/utils/getQueryString';

export const FilterDialog: FC<{
  onClose?: () => void;
}> = ({ onClose }) => {
  const { push } = useRouter();

  const currentHash = usePepeStore((state) => state.currentHash);
  const setCurrentHash = usePepeStore((state) => state.setCurrentHash);

  const fetchHashes = usePepeStore((state) => state.fetchHashes);
  const hashes = usePepeStore((state) => state.hashes);

  const fetchLabels = usePepeStore((state) => state.fetchLabels);
  const labels = usePepeStore((state) => state.labels);

  const limit = usePepeStore((state) => state.limit);

  const filters = usePepeStore((state) => state.filters);
  const setFilters = usePepeStore((state) => state.setFilters);

  const traits = usePepeStore((state) => state.traits);

  const [showNewFilter, setShowNewFilter] = useState(false);
  const [newHash, setNewHash] = useState('');
  const [newFilterTraitId, setNewFilterTraitId] = useState(0);
  const [newFilterTraitOptionId, setNewFilterTraitOptionId] = useState(0);
  const [newFilterTraitOptions, setNewFilterTraitOptions] = useState(
    Array<{
      id: number;
      file: string;
      name: string;
    }>,
  );

  const handleClearFilters = () => {
    setFilters([]);
    setCurrentHash('');

    push('');
  };

  const handleClearHash = () => {
    setFilters([]);
    setCurrentHash('');

    push('');
  };

  const handleNewHash = () => {
    push(
      getQueryString({
        filters,
        page: 1,
        limit,
        hash: newHash,
      }),
    );

    setNewFilterTraitId(0);
    setNewHash('');
    setShowNewFilter(false);
  };

  const handleNewFilter = () => {
    const updatedFilters = filters.concat({
      traitId: newFilterTraitId,
      traitOptionId: newFilterTraitOptionId,
    });

    setFilters(updatedFilters);

    push(
      getQueryString({
        filters: updatedFilters,
        page: 1,
        limit,
        hash: currentHash
      }),
    );

    setNewFilterTraitId(0);
    setNewFilterTraitOptionId(0);
    setShowNewFilter(false);
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = filters.slice();
    updatedFilters.splice(0, 1);

    setFilters(updatedFilters);

    setNewFilterTraitId(0);
    setNewFilterTraitOptionId(0);
    setShowNewFilter(false);

    push(
      getQueryString({
        filters: updatedFilters,
        page: 1,
        limit,
        hash: currentHash
      }),
    );
  };

  useEffect(() => {
    if (!newFilterTraitId) {
      setNewFilterTraitOptions([]);
      return;
    }

    setNewFilterTraitOptions(
      newFilterTraitId === -3
        ? []
        : newFilterTraitId === -2
          ? ['Yes', 'No'].map((approval, index) => ({
              id: index + 1,
              file: approval,
              name: approval,
            }))
          : newFilterTraitId === -1
            ? labels.map((label, index) => ({
                id: index + 1,
                file: label,
                name: label,
              }))
            : traits.find((t) => t.id === newFilterTraitId)!.options,
    );
  }, [newFilterTraitId]);

  useEffect(() => {
    fetchHashes();
    fetchLabels();
  }, []);

  return (
    <Dialog onClose={onClose} open maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography>Filter</Typography>
          {filters.length > 0 && (
            <div>
              <Button onClick={() => handleClearFilters()}>Clear Filters</Button>
              <Button onClick={() => setShowNewFilter(true)}>New Filter</Button>
            </div>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Grid alignItems="center" container spacing={2}>
          {currentHash && (
            <>
              <Grid item sm={6}>
                Hash
              </Grid>
              <Grid item sm={4}>
                {currentHash.slice(0, 12)}...
              </Grid>
              <Grid item sm={2}>
                <IconButton onClick={() => handleClearHash()}>
                  <DeleteIcon sx={{ color: 'white' }} />
                </IconButton>
              </Grid>
            </>
          )}
          {filters.map((filter, index) => (
            <Fragment key={`filter-${index}`}>
              <Grid item sm={6}>
                {filter.traitId === -3
                  ? 'Duplicates'
                  : filter.traitId === -2
                    ? 'Approved'
                    : filter.traitId === -1
                      ? 'Labels'
                      : traits.find((t) => t.id === filter.traitId)?.name}
              </Grid>
              <Grid item sm={4}>
                {filter.traitId === -3
                  ? hashes[filter.traitOptionId - 1]
                  : filter.traitId === -2
                    ? filter.traitOptionId === 1
                      ? 'Yes'
                      : 'No'
                    : filter.traitId === -1
                      ? labels[filter.traitOptionId - 1]
                      : traits
                          .find((t) => t.id === filter.traitId)!
                          .options.find((o) => o.id === filter.traitOptionId)?.name}
              </Grid>
              <Grid item sm={2}>
                <IconButton onClick={() => handleRemoveFilter(index)}>
                  <DeleteIcon sx={{ color: 'white' }} />
                </IconButton>
              </Grid>
            </Fragment>
          ))}
          {(showNewFilter || !filters.length) && (
            <>
              <Grid item sm={6}>
                <Select
                  fullWidth
                  onChange={(e) => setNewFilterTraitId(Number(e.target.value))}
                  value={newFilterTraitId}
                >
                  {!currentHash && [<MenuItem value={-3}>Duplicates</MenuItem>, <Divider />]}
                  {filters.findIndex((f) => f.traitId === -2) === -1 && [
                    <MenuItem value={-2}>Approved</MenuItem>,
                    <Divider />,
                  ]}
                  <MenuItem value={-1}>Labels</MenuItem>
                  <Divider />
                  {traits.map((trait) => (
                    <MenuItem key={trait.id} value={trait.id}>
                      {trait.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item sm={4}>
                {newFilterTraitId === -3 ? (
                  <Select fullWidth onChange={(e) => setNewHash(e.target.value)} value={newHash}>
                    {hashes.map((hash) => (
                      <MenuItem key={hash} value={hash}>
                        {hash}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Select
                    fullWidth
                    onChange={(e) => setNewFilterTraitOptionId(Number(e.target.value))}
                    value={newFilterTraitOptionId}
                  >
                    {newFilterTraitOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Grid>
              <Grid item sm={2}>
                <IconButton
                  onClick={() => (newFilterTraitId === -3 ? handleNewHash() : handleNewFilter())}
                >
                  <CheckIcon sx={{ color: 'white' }} />
                </IconButton>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};
