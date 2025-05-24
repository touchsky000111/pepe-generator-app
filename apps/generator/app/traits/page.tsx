'use client';

import { FilterAlt as FilterAltIcon } from '@mui/icons-material';
import {
  IconButton,
  List,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { Loader } from '@/components/Loader';
import { usePepeStore } from '@/stores/pepe';
import listTraitsAction from '@/actions/listTraitsAction';
import getQueryString from '@/utils/getQueryString';
import axios from 'axios';

interface Trait {
  id: number;
  folder: string;
  name: string;
  options: TraitOption[];
}

interface TraitOption {
  id: number;
  file: string;
  name: string;
  count: number;
}

export default function TraitsPage() {
  const limit = usePepeStore((state) => state.limit);

  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [selectedTrait, setSelectedTrait] = useState<Trait>();
  const [selectedTraitId, setSelectedTraitId] = useState(0);
  const [options, setOptions] = useState<TraitOption[]>([]);
  const [total, setTotal] = useState(0);
  const [traits, setTraits] = useState<Trait[]>([]);

  const init = async () => {
    const res = await listTraitsAction();

    if ('error' in res) {
      setError(res.error);
      return;
    }

    const sortedTraits = res.traits.sort((a, b) => a.name.localeCompare(b.name));

    const { count } = (
      await axios({
        method: 'POST',
        url: '/api/getCount',
        data: {},
      })
    ).data as {
      count: number;
    };
    console.log("COUTN PRINT");
    console.log(count);
    setTotal(count);
    setTraits(sortedTraits);
    setSelectedTraitId(sortedTraits[0]?.id);
    setIsInitialized(true);
  };

  useEffect(() => {
    if (!selectedTraitId) {
      return;
    }

    const newSelectedTrait = traits.find((trait) => trait.id === selectedTraitId)!;

    setOptions(newSelectedTrait.options);
    setSelectedTrait(newSelectedTrait);
  }, [selectedTraitId, traits]);

  useEffect(() => {
    init();
  }, []);

  if (!isInitialized) {
    return <Loader />;
  }

  if (error) {
    return <main style={{ margin: '64px 0' }}>{error}</main>;
  }

  return (
    <main style={{ margin: '64px 0' }}>
      <Stack direction="row">
        <List sx={{ minWidth: '200px' }}>
          {traits.map((trait) => (
            <MenuItem
              key={`trait-${trait.id}`}
              onClick={() => setSelectedTraitId(trait.id)}
              selected={selectedTraitId === trait.id}
            >
              <Typography fontSize="1.5rem">
                {trait.name} ({trait.options.length})
              </Typography>
            </MenuItem>
          ))}
        </List>
        {selectedTrait && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={1} />
                <TableCell>
                  <Typography fontSize="1.5rem">Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize="1.5rem"># of Pepes</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize="1.5rem">Rarity</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {options.map((option) => (
                <TableRow key={`option-${option.id}`}>
                  <TableCell>
                    <img
                      height={50}
                      src={`/images/traits/${selectedTrait.folder}/${option.file}`}
                      style={{
                        backgroundColor: '#FFF',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="1.5rem">{option.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="1.5rem">{option.count}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="1.5rem">
                      {option.count ? Math.ceil((option.count / total) * 100) : '0'}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Filter by this trait">
                      <IconButton
                        href={`/${getQueryString({
                          filters: [
                            {
                              traitId: selectedTraitId,
                              traitOptionId: option.id,
                            },
                          ],
                          page: 1,
                          limit,
                        })}`}
                      >
                        <FilterAltIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Stack>
    </main>
  );
}
