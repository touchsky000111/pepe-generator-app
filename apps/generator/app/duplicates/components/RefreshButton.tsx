'use client';

import { Button } from '@mui/material';

export default function RefreshButton() {
  return <Button onClick={() => window.location.reload()}>Refresh</Button>;
}
