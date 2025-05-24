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

interface FinalizeDialogProps {
  onClose: () => void;
}

export const FinalizeDialog: FC<FinalizeDialogProps> = ({ onClose }) => {
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalize = async () => {
    if (process.env.NEXT_APP_ENABLE_FINAL !== 'true') {
      onClose();
      return;
    }

    setIsFinalizing(true);

    await axios({
      method: 'POST',
      url: '/api/finalize',
    });

    setIsFinalizing(false);
  };

  if (isFinalizing) {
    return (
      <Dialog open>
        <DialogTitle>Finalizing 10,000 Pepes...</DialogTitle>
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
      <DialogTitle>No Dice</DialogTitle>
      <DialogContent>Finalization only works on `localhost`</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cool</Button>
      </DialogActions>
    </Dialog>
  );
};
