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
import { FC, FormEvent, useState } from 'react';

interface BackupDialogProps {
  onClose: () => void;
}

export const BackupDialog: FC<BackupDialogProps> = ({ onClose }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupUrl, setBackupUrl] = useState('');

  const handleBackupConfirm = async (e: FormEvent) => {
    e.preventDefault();

    setIsBackingUp(true);

    const result = await axios({
      method: 'POST',
      url: '/api/backup',
    });

    setBackupUrl(result.data.url);

    setIsBackingUp(false);
  };

  if (backupUrl.length) {
    return (
      <Dialog open onClose={onClose}>
        <DialogTitle>Completed Backup</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <p>This backup has been stored in the cloud.</p>
            <p>You can download a copy here:</p>
            <p>
              <a href={backupUrl}>{backupUrl}</a>
            </p>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cool</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isBackingUp) {
    return (
      <Dialog open>
        <DialogTitle>Backing Up Database...</DialogTitle>
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
      <form onSubmit={handleBackupConfirm}>
        <DialogTitle>Create a DB Backup</DialogTitle>
        <DialogContent>Do you want to create a manual backup of the database?</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button type="submit">Let&apos;s Go</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
