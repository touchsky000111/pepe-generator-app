import { Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <Stack alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
      <Typography variant="h2">Are you lost?</Typography>
      <Typography component="p" variant="h5">
        Go back <Link href="/">home</Link>.
      </Typography>
    </Stack>
  );
}
