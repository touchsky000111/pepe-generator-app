import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import axios from 'axios';
import { FC, useState } from 'react';

interface RegenerateAllDialogProps {
  onClose: () => void;
}

export const RegenerateAllDialog: FC<RegenerateAllDialogProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerateConfirm = async () => {
    setIsGenerating(true);

    await axios({
      method: 'POST',
      url: '/api/regenerateAllPepes',
      data: {
        max: 10000,
      },
    });

    setIsGenerating(false);
  };

  if (isGenerating) {
    return (
      <Dialog open>
        <DialogTitle>Generating 10,000 Pepes...</DialogTitle>
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
      <DialogContent>All existing Pepes will be blown to smithereens.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Never mind</Button>
        <Button onClick={handleRegenerateConfirm}>Do it</Button>
      </DialogActions>
    </Dialog>
  );
};
