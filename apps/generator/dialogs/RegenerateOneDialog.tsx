import { usePepeStore } from '@/stores/pepe';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import axios from 'axios';
import { FC, useState } from 'react';

interface RegenerateOneDialogProps {
  id: number;
  onClose: () => void;
}

export const RegenerateOneDialog: FC<RegenerateOneDialogProps> = ({ id, onClose }) => {
  const fetchPepes = usePepeStore(state => state.fetchPepes);

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateOne = async () => {
    setIsRegenerating(true);

    await axios({
      method: 'POST',
      url: '/api/regenerate',
      data: {
        id,
      },
    });

    await fetchPepes(false);

    onClose();

    setIsRegenerating(false);
  };

  if (isRegenerating) {
    return (
      <Dialog open>
        <DialogTitle>Regenerating This Pepe...</DialogTitle>
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
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>This one Pepe will be replaced with another. This is irreversible.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleRegenerateOne}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
