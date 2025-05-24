import { usePepeStore } from '@/stores/pepe';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import axios from 'axios';
import { FC, useState } from 'react';

interface Props {
  onClose: () => void;
}

export const SadDialog: FC<Props> = ({ onClose }) => {
  const selectedIds = usePepeStore((state) => state.selectedIds);
  const setSelectedIds = usePepeStore((state) => state.setSelectedIds);

  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmation = async () => {
    setIsUpdating(true);

    await axios({
      method: 'POST',
      url: '/api/updateFrog',
      data: {
        ids: selectedIds,
        type: 'sad',
      },
    });

    await fetchPepes(false);

    setSelectedIds([]);

    onClose();

    setIsUpdating(false);
  };

  if (isUpdating) {
    return (
      <Dialog open>
        <DialogTitle>
          Making {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'} sad...
        </DialogTitle>
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
      <DialogContent>
        {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'} will be sad.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleConfirmation}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
