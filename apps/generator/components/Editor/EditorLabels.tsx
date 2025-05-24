import { useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Button, Chip, IconButton, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { FC, FormEvent } from 'react';

export const EditorLabels: FC = () => {
  const fetchPepe = useEditorStore((state) => state.fetchPepe);

  const pepeId = useEditorStore((state) => state.pepeId);

  const newLabel = useEditorStore((state) => state.newLabel);
  const setNewLabel = useEditorStore((state) => state.setNewLabel);

  const showNewLabel = useEditorStore((state) => state.showNewLabel);
  const setShowNewLabel = useEditorStore((state) => state.setShowNewLabel);

  const selectedPepe = useEditorStore((state) => state.selectedPepe);

  const isUpdating = useEditorStore((state) => state.isUpdating);
  const setIsUpdating = useEditorStore((state) => state.setIsUpdating);

  const handleNewLabel = async (e: FormEvent) => {
    e.preventDefault();

    setIsUpdating(true);

    await axios({
      method: 'POST',
      url: '/api/addLabel',
      data: {
        pepeId,
        label: newLabel,
      },
    });

    await fetchPepe(pepeId);

    setNewLabel('');
    setIsUpdating(false);
    setShowNewLabel(false);
  };

  const handleQuickLabel = async (value: string) => {
    setIsUpdating(true);

    await axios({
      method: 'POST',
      url: '/api/addLabel',
      data: {
        pepeId,
        label: value,
      },
    });

    await fetchPepe(pepeId);

    setNewLabel('');
    setIsUpdating(false);
    setShowNewLabel(false);
  };

  const handleRemoveLabel = async (label: string) => {
    setIsUpdating(true);

    await axios({
      method: 'POST',
      url: '/api/removeLabel',
      data: {
        pepeId,
        label,
      },
    });

    await fetchPepe(pepeId);

    setIsUpdating(false);
  };

  if (!selectedPepe) {
    return null;
  }

  return (
    <Stack
      alignItems="center"
      direction="row"
      justifyContent="space-between"
      position="absolute"
      right={10}
      top={10}
    >
      <Stack alignItems="flex-end">
        <Stack alignItems="center" direction="row" gap={2}>
          {!showNewLabel && !selectedPepe.labels.length && (
            <Typography color="black">Labels</Typography>
          )}
          {selectedPepe.labels.map((label) => (
            <Chip
              key={label}
              disabled={selectedPepe.isApproved || isUpdating}
              color="primary"
              label={label}
              onDelete={() => handleRemoveLabel(label)}
            />
          ))}
          {showNewLabel && (
            <form onSubmit={handleNewLabel}>
              <TextField
                autoFocus
                disabled={isUpdating}
                onChange={(e) => setNewLabel(e.target.value)}
                value={newLabel}
              />
            </form>
          )}
          {!showNewLabel && (
            <IconButton
              disabled={selectedPepe.isApproved}
              size="small"
              onClick={() => setShowNewLabel(true)}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          {showNewLabel && (
            <IconButton size="small" onClick={() => setShowNewLabel(false)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
        {selectedPepe.labels.findIndex((l) => l === 'Needs Work') === -1 && (
          <Stack alignItems="center" direction="row">
            <Typography variant="body2" sx={{ color: '#CCC' }}>
              Quick Labels:
            </Typography>
            <Button
              disabled={selectedPepe.isApproved || isUpdating}
              onClick={() => handleQuickLabel('Needs Work')}
              sx={{
                color: isUpdating ? 'gray' : 'black',
                textTransform: 'none',
                '&:hover': {
                  color: '#333',
                },
              }}
            >
              Needs Work
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
