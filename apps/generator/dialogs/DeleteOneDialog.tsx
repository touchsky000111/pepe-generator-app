import { usePepeStore } from '@/stores/pepe';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import axios from 'axios';
import { FC, useState } from 'react';

interface DeleteOneDialogProps {
  id: number;
  onClose: () => void;
}

export const DeleteOneDialog: FC<DeleteOneDialogProps> = ({ id, onClose }) => {
  const fetchPepes = usePepeStore(state => state.fetchPepes);

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDeleteOne = async () => {
    setIsRegenerating(true);

    await axios({
      method: 'POST',
      url: '/api/deletePepe',
      data: {
        id,
      },
    });

    await fetchPepes();

    onClose();

    setIsRegenerating(false);
  };

  if (isRegenerating) {
    return (
      <Dialog open>
        <DialogTitle>Deleting This Pepe...</DialogTitle>
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
      <DialogContent>This Pepe will be deleted.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleDeleteOne}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
