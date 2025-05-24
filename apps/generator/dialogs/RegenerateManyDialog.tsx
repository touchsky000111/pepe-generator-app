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

interface RegenerateOneDialogProps {
  onClose: () => void;
}

export const RegenerateManyDialog: FC<RegenerateOneDialogProps> = ({ onClose }) => {
  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const selectedIds = usePepeStore((state) => state.selectedIds);
  const setSelectedIds = usePepeStore((state) => state.setSelectedIds);

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateOne = async () => {
    setIsRegenerating(true);

    await axios({
      method: 'POST',
      url: '/api/regenerateManyPepes',
      data: {
        ids: selectedIds,
      },
    });

    await fetchPepes(false);

    setSelectedIds([]);

    onClose();

    setIsRegenerating(false);
  };

  if (isRegenerating) {
    return (
      <Dialog open>
        <DialogTitle>
          Regenerating {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'}...
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
        {selectedIds.length} Pepe{selectedIds.length === 1 ? '' : 's'} will be regenerated.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleRegenerateOne}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
