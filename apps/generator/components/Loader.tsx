import { CircularProgress, Stack } from '@mui/material';
import { FC } from 'react';

export const Loader: FC = () => (
  <Stack alignItems="center" height="100vh" justifyContent="center">
    <CircularProgress />
  </Stack>
);
