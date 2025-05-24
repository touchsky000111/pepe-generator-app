import {
  Check,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { Box, Button, CircularProgress, Grid, IconButton, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';

import { usePepeStore } from '@/stores/pepe';
import { RegenerateOneDialog } from '@/dialogs/RegenerateOneDialog';

export default function Home() {
  const { query, push } = useRouter();

  const approvingIds = usePepeStore((state) => state.approvingIds);

  const currentHash = usePepeStore((state) => state.currentHash);
  const setCurrentHash = usePepeStore((state) => state.setCurrentHash);

  const isFetching = usePepeStore((state) => state.isFetching);
  const isInitialized = usePepeStore((state) => state.isInitialized);

  const fetchPepes = usePepeStore((state) => state.fetchPepes);
  const fetchTraits = usePepeStore((state) => state.fetchTraits);

  const filters = usePepeStore((state) => state.filters);
  const setFilters = usePepeStore((state) => state.setFilters);

  const page = usePepeStore((state) => state.page);
  const setPage = usePepeStore((state) => state.setPage);

  const pepes = usePepeStore((state) => state.pepes);

  const queryString = usePepeStore((state) => state.queryString);

  const selectedIds = usePepeStore((state) => state.selectedIds);
  const setSelectedIds = usePepeStore((state) => state.setSelectedIds);

  const traits = usePepeStore((state) => state.traits);

  const [approvingId, setApprovingId] = useState(0);
  const [dialogType, setDialogType] = useState<'' | 'delete' | 'regenerate'>('');
  const [hoverId, setHoverId] = useState(0);

  const [deletingId, setDeletingId] = useState(0);
  const [regeneratingId, setRegeneratingId] = useState(0);

  const handleApproval = async (id: number, isApproved: boolean) => {
    setApprovingId(id);

    await axios({
      method: 'POST',
      url: '/api/toggleApproval',
      data: {
        id,
        isApproved,
      },
    });

    await fetchPepes(false);

    setApprovingId(0);
  };

  const handleDeleteOne = async (id: number) => {
    setDeletingId(id);

    await axios({
      method: 'POST',
      url: '/api/deletePepe',
      data: {
        id,
      },
    });

    await fetchPepes(false);

    setDeletingId(0);
  };

  const handleScroll = (e: Event) => {
    sessionStorage.setItem('pepes.scrollPosition', window.scrollY.toString());
  };

  const handleSelected = (id: number) => {
    const index = selectedIds.findIndex((selectedId) => selectedId === id);

    const newSelectedIds = selectedIds.slice();

    if (index === -1) {
      newSelectedIds.push(id);
    } else {
      newSelectedIds.splice(index, 1);
    }

    setSelectedIds(newSelectedIds);
  };

  useEffect(() => {
    if (!traits.length) {
      return;
    }

    if (query.filter || query.hash || query.page || query.limit) {
      fetchPepes(
        true,
        (query.filter as string)?.split(',').map((filter) => {
          const f = filter.split(':');
          return {
            traitId: Number(f[0]),
            traitOptionId: Number(f[1]),
          };
        }),
        (query.hash as string) || '',
        query.page ? Number(query.page) : undefined,
        query.limit ? Number(query.limit) : undefined,
      );
    } else {
      fetchPepes(true);
    }
  }, [fetchPepes, setFilters, page, query, traits]);

  useEffect(() => {
    fetchTraits();
  }, [fetchTraits]);

  useEffect(() => {
    if (!pepes.length) {
      return;
    }

    setTimeout(() => {
      const scrollPosition = sessionStorage.getItem('pepes.scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, Number(scrollPosition));
      }

      window.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pepes]);

  if (!isInitialized || isFetching) {
    return (
      <Stack alignItems="center" height="100vh" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <main style={{ margin: '88px 0 88px 0' }}>
        {pepes.length === 0 && (
          <Stack alignItems="center" justifyContent="center" height="calc(100vh - 64px)">
            <Typography component="div" variant="h4">
              There are no {filters.length > 0 ? 'matching' : ''}
            </Typography>
          </Stack>
        )}
        <Grid container>
          {pepes.map((pepe) => (
            <Grid
              item
              key={`pepe-${pepe.id}`}
              onMouseEnter={() => setHoverId(pepe.id)}
              onMouseLeave={() => setHoverId(0)}
              position="relative"
              xl={1}
              lg={2}
              md={4}
              sm={3}
              xs={6}
            >
              <Box
                sx={{
                  opacity: !selectedIds.length || !selectedIds.includes(pepe.id) ? 1 : 0.5,
                }}
              >
                {pepe.imageUrl ? (
                  <img
                    src={pepe.imageUrl}
                    style={{
                      display: 'block',
                    }}
                    width="100%"
                  />
                ) : (
                  <>
                    <img
                      src={`/images/blank.png`}
                      style={{
                        display: 'block',
                      }}
                      width="100%"
                    />
                    {(approvingId === pepe.id || approvingIds.includes(pepe.id)) && (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        position="absolute"
                        left={0}
                        right={0}
                        top={0}
                        bottom={0}
                      >
                        <CircularProgress />
                      </Stack>
                    )}
                    {approvingId !== pepe.id &&
                      !approvingIds.includes(pepe.id) &&
                      pepe.traits.map((trait) => (
                        <img
                          key={`pepe-${pepe.id}-trait-${trait.folder}-${trait.file}`}
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
                  </>
                )}
                {pepe.isApproved && approvingId !== pepe.id && !approvingIds.includes(pepe.id) && (
                  <img
                    src={'/images/approved.png'}
                    style={{
                      opacity: 0.75,
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                    width="100%"
                  />
                )}
              </Box>

              {(isMobile ||
                isTablet ||
                (hoverId === pepe.id && deletingId !== pepe.id && regeneratingId !== pepe.id)) && (
                  <>
                    <Stack position="absolute" right={10} top={5}>
                      <Typography color="black" variant="h4">
                        #{pepe.id}
                      </Typography>
                    </Stack>
                    <Grid
                      container
                      position={isMobile || isTablet ? 'static' : 'absolute'}
                      borderRight={isMobile || isTablet ? '1px #333 solid' : undefined}
                      bottom={0}
                      left={0}
                      spacing={1}
                      p={1}
                      width={isMobile || isTablet ? '100%' : 32}
                      zIndex={10}
                    >
                      <Grid item textAlign="center" xs={isMobile || isTablet ? 2.4 : 12}>
                        <IconButton
                          disabled={approvingId === pepe.id || approvingIds.includes(pepe.id)}
                          onClick={() => handleApproval(pepe.id, !pepe.isApproved)}
                          size="small"
                        >
                          {pepe.isApproved ? (
                            <ThumbDownIcon sx={{ color: 'white' }} />
                          ) : (
                            <ThumbUpIcon sx={{ color: 'white' }} />
                          )}
                        </IconButton>
                      </Grid>
                      <Grid item textAlign="center" xs={isMobile || isTablet ? 2.4 : 12}>
                        <IconButton
                          onClick={() => {
                            setDialogType('regenerate');
                            setRegeneratingId(pepe.id);
                          }}
                          size="small"
                        >
                          <RefreshIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Grid>
                      <Grid item textAlign="center" xs={isMobile || isTablet ? 2.4 : 12}>
                        <IconButton onClick={() => handleDeleteOne(pepe.id)}>
                          <DeleteIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Grid>
                      <Grid item textAlign="center" xs={isMobile || isTablet ? 2.4 : 12}>
                        <IconButton href={`/pepes/${pepe.id}${queryString}`} size="small">
                          <InfoIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Grid>
                      {(isTablet || isMobile) && (
                        <Grid item textAlign="center" xs={isMobile || isTablet ? 2.4 : 12}>
                          <Box
                            component="button"
                            bgcolor={selectedIds.includes(pepe.id) ? '#333' : 'gray'}
                            border="2px black solid"
                            bottom={10}
                            disabled={approvingId === pepe.id || approvingIds.includes(pepe.id)}
                            height={36}
                            onClick={() => handleSelected(pepe.id)}
                            right={10}
                            width={36}
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            {selectedIds.includes(pepe.id) && <Check sx={{ color: 'white' }} />}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              {!currentHash && pepe.copies > 1 && (
                <Stack
                  alignItems="center"
                  bottom={10}
                  justifyContent="center"
                  left={0}
                  position="absolute"
                  right={0}
                >
                  <Button
                    onClick={() => {
                      setCurrentHash(pepe.hash);
                      setPage(1);
                      push(`?hash=${pepe.hash}`);
                    }}
                    sx={{ backgroundColor: 'red !important', border: '1px black solid', px: 2 }}
                  >
                    {pepe.copies} copies
                  </Button>
                </Stack>
              )}
              {!isMobile &&
                !isTablet &&
                (hoverId === pepe.id || selectedIds.length > 0) &&
                deletingId !== pepe.id &&
                regeneratingId !== pepe.id && (
                  <Box
                    component="button"
                    bgcolor={selectedIds.includes(pepe.id) ? 'black' : 'gray'}
                    border="2px black solid"
                    bottom={10}
                    height={32}
                    onClick={() => handleSelected(pepe.id)}
                    position="absolute"
                    right={10}
                    width={32}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {selectedIds.includes(pepe.id) && <Check sx={{ color: 'white' }} />}
                  </Box>
                )}
            </Grid>
          ))}
        </Grid>
      </main>
      {dialogType === 'regenerate' && (
        <RegenerateOneDialog
          id={regeneratingId}
          onClose={() => {
            setDialogType('');
            setRegeneratingId(0);
          }}
        />
      )}
    </>
  );
}
