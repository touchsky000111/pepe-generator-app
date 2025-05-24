import { Info as InfoIcon } from '@mui/icons-material';
import { Box, CircularProgress, Grid, IconButton, Stack, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';

import { Pepe, usePepeStore } from '@/stores/pepe';

function Home() {
  const pepes = useQuery({
    queryKey: ['pepes'],
    queryFn: async () => {
      const { pepes } = (
        await axios({
          method: 'POST',
          url: '/api/randomPepes',
          data: {},
        })
      ).data as {
        pepes: Pepe[];
      };

      return pepes;
    },
  });

  const queryString = usePepeStore((state) => state.queryString);

  const [hoverId, setHoverId] = useState(0);

  if (!pepes.data) {
    return (
      <Stack alignItems="center" height="100vh" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <main style={{ margin: '64px 0 0 0' }}>
        <Grid container>
          {pepes.data.map((pepe) => (
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
              <Box>
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
                    {pepe.traits.map((trait) => (
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
              </Box>
              {(isMobile || isTablet || hoverId === pepe.id) && (
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
                      <IconButton href={`/pepes/${pepe.id}${queryString}`} size="small">
                        <InfoIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          ))}
        </Grid>
      </main>
    </>
  );
}

const queryClient = new QueryClient();

export default function HomeWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}
