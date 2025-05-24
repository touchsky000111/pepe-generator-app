'use client';

import { DeleteManyDialog } from '@/dialogs/DeleteManyDialog';
import { FilterDialog } from '@/dialogs/FilterDialog';
import { HappyDialog } from '@/dialogs/HappyDialog';
import { RegenerateManyDialog } from '@/dialogs/RegenerateManyDialog';
import { SadDialog } from '@/dialogs/SadDialog';
import { usePepeStore } from '@/stores/pepe';
import { calculateNewPage } from '@/utils/calculateNewPage';
import getQueryString from '@/utils/getQueryString';
import {
  Delete as DeleteIcon,
  Deselect,
  FilterAlt,
  OpenInBrowser,
  Refresh as RefreshIcon,
  SelectAll,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

export const Footer: FC = () => {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const approvingIds = usePepeStore((state) => state.approvingIds);
  const setApprovingIds = usePepeStore((state) => state.setApprovingIds);

  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const filters = usePepeStore((state) => state.filters);

  const hash = usePepeStore((state) => state.currentHash);

  const isInitialized = usePepeStore((state) => state.isInitialized);

  const limit = usePepeStore((state) => state.limit);

  const page = usePepeStore((state) => state.page);

  const pepes = usePepeStore((state) => state.pepes);

  const selectedIds = usePepeStore((state) => state.selectedIds);

  const setSelectedIds = usePepeStore((state) => state.setSelectedIds);

  const total = usePepeStore((state) => state.total);

  const [currentPage, setCurrentPage] = useState('1');
  const [dialogType, setDialogType] = useState<
    '' | 'delete' | 'filter' | 'regenerate' | 'happy' | 'sad'
  >('');
  const [numberOfPages, setNumberOfPages] = useState(1);


  const handleApprovalMany = async (isApproved: boolean) => {
    setApprovingIds(selectedIds);
    setSelectedIds([]);

    await axios({
      method: 'POST',
      url: '/api/toggleApprovalMany',
      data: {
        ids: selectedIds,
        isApproved,
      },
    });

    await fetchPepes(false);

    setApprovingIds([]);
  };


  const handleOpen = () => {
    selectedIds.forEach((selectedId, index) => {
      window.open(`/pepes/${selectedId}`);
    });
  };

  const handleLimit = (newLimit: number) => {
    window.scrollTo(0, 0);

    push(
      getQueryString({
        filters,
        limit: newLimit,
        page: calculateNewPage(page, limit, newLimit),
        hash,
      }),
    );
  };

  const handlePage = (page: number) => {
    window.scrollTo(0, 0);

    push(
      getQueryString({
        filters,
        limit,
        page,
        hash,
      }),
    );
  };

  useEffect(() => {
    setNumberOfPages(Math.ceil(total / limit));
  }, [limit, total]);

  useEffect(() => {
    setCurrentPage(page.toString());
  }, [page]);

  if (!isInitialized || pathname !== '/') {
    return null;
  }

  return (
    <>
      <Box
        alignItems="center"
        bottom={0}
        component="footer"
        display="flex"
        left={0}
        justifyContent="space-between"
        p={2}
        position="fixed"
        right={0}
        zIndex={10}
        sx={{
          background: 'black',
          minHeight: '88px',
        }}
      >
        <Stack alignItems="center" direction="row" gap={1}>
          <Button
            disabled={selectedIds.length === pepes.length}
            onClick={() => setSelectedIds(pepes.map((pepe) => pepe.id))}
          >
            <SelectAll />
          </Button>
          <Button disabled={!selectedIds.length} onClick={() => setSelectedIds([])}>
            <Deselect />
          </Button>
          {selectedIds.length > 0 ? (
            <>
              <Typography variant="body2" textTransform="uppercase">
                With {selectedIds.length} Selected:
              </Typography>
              <IconButton onClick={() => setDialogType('delete')}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => setDialogType('regenerate')}>
                <RefreshIcon />
              </IconButton>
              <IconButton onClick={() => setDialogType('sad')}>
                <SentimentVeryDissatisfied />
              </IconButton>
              <IconButton onClick={() => setDialogType('happy')}>
                <SentimentVerySatisfied />
              </IconButton>
              <IconButton onClick={() => handleApprovalMany(true)}>
                <ThumbUpIcon />
              </IconButton>
              <IconButton onClick={() => handleApprovalMany(false)}>
                <ThumbDownIcon />
              </IconButton>
              <IconButton onClick={handleOpen}>
                <OpenInBrowser />
              </IconButton>
            </>
          ) : (
            <>
              <Button onClick={() => setDialogType('filter')}>
                <Stack alignItems="center" direction="row" gap={1}>
                  <FilterAlt />
                  {filters.length > 0 && <Chip color="info" label={filters.length} />}
                </Stack>
              </Button>
              <Typography variant="body2" textTransform="uppercase">
                Jump to:
              </Typography>
              <TextField
                onBlur={(e) =>
                  Number(e.target.value) !== page && handlePage(Number(e.target.value))
                }
                onChange={(e) => setCurrentPage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  Number(currentPage) !== page &&
                  handlePage(Number(currentPage))
                }
                type="number"
                value={currentPage}
                sx={{
                  width: 70,
                }}
              />
              <Typography variant="body2" textTransform="uppercase">
                Limit:
              </Typography>
              <Select onChange={(e) => handleLimit(Number(e.target.value))} value={limit}>
                {[
                  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
                ].map((number) => (
                  <MenuItem key={number} value={number}>
                    {number}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </Stack>
        {!selectedIds.length && (
          <Pagination
            count={numberOfPages}
            onChange={(_, value) => handlePage(value)}
            page={page}
          />
        )}
        <div>
          {(page - 1) * limit + 1} -{' '}
          {page === numberOfPages ? (page - 1) * limit + (total % limit) : page * limit} of {total}
        </div>
      </Box>
      {dialogType === 'filter' && <FilterDialog onClose={() => setDialogType('')} />}
      {dialogType === 'delete' && <DeleteManyDialog onClose={() => setDialogType('')} />}
      {dialogType === 'regenerate' && <RegenerateManyDialog onClose={() => setDialogType('')} />}
      {dialogType === 'happy' && <HappyDialog onClose={() => setDialogType('')} />}
      {dialogType === 'sad' && <SadDialog onClose={() => setDialogType('')} />}
    </>
  );
};
