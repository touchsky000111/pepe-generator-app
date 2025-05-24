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

interface DeleteOneDialogProps {
  onClose: () => void;
}

export const DeleteManyDialog: FC<DeleteOneDialogProps> = ({ onClose }) => {
  const selectedIds = usePepeStore((state) => state.selectedIds);
  const setSelectedIds = usePepeStore((state) => state.setSelectedIds);

  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOne = async () => {
    setIsDeleting(true);

    await axios({
      method: 'POST',
      url: '/api/deleteManyPepes',
      data: {
        ids: selectedIds,
      },
    });

    await fetchPepes(false);

    setSelectedIds([]);

    onClose();

    setIsDeleting(false);
  };

  if (isDeleting) {
    return (
      <Dialog open>
        <DialogTitle>
          Deleting {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'}...
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
        {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'} will be deleted.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleDeleteOne}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
