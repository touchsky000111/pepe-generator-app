import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { FC, FormEvent, useState } from 'react';

import { usePepeStore } from '@/stores/pepe';

interface CheckDuplicatesDialogProps {
  onClose: () => void;
}

export const CheckDuplicatesDialog: FC<CheckDuplicatesDialogProps> = ({ onClose }) => {
  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const [confirmation, setConfirmation] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [type, setType] = useState<'check' | 'fix'>('check');

  const handleCheck = async (e: FormEvent) => {
    e.preventDefault();

    setIsChecking(true);

    if (type === 'fix') {
      await axios({
        method: 'POST',
        url: '/api/fixDuplicates',
      });
    } else {
      await axios({
        method: 'POST',
        url: '/api/checkDuplicates',
      });
    }

    setIsChecking(false);
    setIsDone(true);
  };

  if (isDone) {
    return (
      <Dialog open>
        <DialogTitle>{type === 'fix' ? 'Fix' : 'Check for'} Duplicates</DialogTitle>
        <DialogContent>
          <p>All done!</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              fetchPepes();
              onClose();
            }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isChecking) {
    return (
      <Dialog open>
        <DialogTitle>{type === 'fix' ? 'Fixing' : 'Checking for'} duplicates...</DialogTitle>
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
      <form onSubmit={handleCheck}>
        <DialogTitle>Handle Duplicates</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Select onChange={(e) => setType(e.target.value as 'check' | 'fix')} value={type}>
              <MenuItem value="check">Check for Duplicates</MenuItem>
              <MenuItem value="fix">Fix All Duplicates</MenuItem>
            </Select>
            {type === 'fix' && (
              <>
                <TextField
                  label="Type 'fix' to continue"
                  onChange={(e) => setConfirmation(e.target.value)}
                  value={confirmation}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button disabled={type === 'fix' && confirmation !== 'fix'} type="submit">
            {type === 'fix' ? 'Fix' : 'Check'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
