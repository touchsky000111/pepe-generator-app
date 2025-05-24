import { usePepeStore } from '@/stores/pepe';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { FC, FormEvent, useState } from 'react';

interface GenerateDialogProps {
  onClose: () => void;
}

export const GenerateDialog: FC<GenerateDialogProps> = ({ onClose }) => {
  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const [isGenerating, setIsGenerating] = useState(false);
  const [quantity, setQuantity] = useState(100);

  const handleGenerateConfirm = async (e: FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);

    await axios({
      method: 'POST',
      url: '/api/generateMore',
      data: {
        max: quantity,
      },
    });

    await fetchPepes();

    setIsGenerating(false);

    onClose();
  };

  const handleQuantity = (value: string) => {
    const newQuantity = Number(value);

    setQuantity(
      isNaN(newQuantity) || newQuantity < 1 ? 1 : newQuantity > 10000 ? 10000 : newQuantity,
    );
  };

  if (isGenerating) {
    return (
      <Dialog open>
        <DialogTitle>Generating {quantity} Pepes...</DialogTitle>
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
      <form onSubmit={handleGenerateConfirm}>
        <DialogTitle>How many more do you want to generate?</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => handleQuantity(e.target.value)}
            helperText="Max is 100"
            type="number"
            value={quantity}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Never mind</Button>
          <Button disabled={quantity > 100} type="submit">
            Let&apos;s Go
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
