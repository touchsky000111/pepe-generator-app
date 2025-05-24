import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { FormEvent, useEffect, useState } from 'react';

import { useEditorStore } from '@/stores/editor';

interface Props {
  onClose: () => void;
}

export default function CloneExactDialog({ onClose }: Props) {
  const duplicate = useEditorStore((state) => state.duplicate);

  const [error, setError] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async (e?: FormEvent) => {
    e?.preventDefault();

    setIsDuplicating(true);

    try {
      await duplicate();
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError('Unknown error');
      }

      setIsDuplicating(false);
    }
  };

  useEffect(() => {
    handleDuplicate();
  }, []);

  if (isDuplicating) {
    return (
      <Dialog open>
        <DialogTitle>Cloning 1 Pepe...</DialogTitle>
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
          <Typography>Click "Clone" to continue.</Typography>
          {error && <Typography color="red">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button type="submit">Clone</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
