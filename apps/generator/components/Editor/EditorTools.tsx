import { AutoFixNormal, Colorize, Gesture, OpenWith } from '@mui/icons-material';
import { Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { FC, useEffect } from 'react';

import { useEditorStore } from '@/stores/editor';

export const EditorTools: FC = () => {
  const brushSize = useEditorStore((state) => state.brushSize);
  const setBrushSize = useEditorStore((state) => state.setBrushSize);

  const selectedTool = useEditorStore((state) => state.selectedTool);
  const setSelectedTool = useEditorStore((state) => state.setSelectedTool);

  const strokeStyle = useEditorStore((state) => state.strokeStyle);
  const setStrokeStyle = useEditorStore((state) => state.setStrokeStyle);

  const handleKey = (event: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT') {
      return;
    }

    const key = event.key.toLowerCase();

    const keys: {
      [key: string]: () => void;
    } = {
      '[': () => setBrushSize(brushSize - 1),
      ']': () => setBrushSize(brushSize + 1),
      b: () => setSelectedTool('draw'),
      e: () => setSelectedTool('erase'),
      i: () => setSelectedTool('colorize'),
      v: () => setSelectedTool('move'),
    };

    keys[key]?.();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [brushSize]);

  return (
    <>
      <Stack
        bgcolor="black"
        border="1px #999 solid"
        justifyContent="center"
        left={10}
        position="absolute"
        top={10}
        zIndex={99999}
      >
        <IconButton
          color={selectedTool === 'move' ? 'secondary' : undefined}
          onClick={() => setSelectedTool('move')}
        >
          <OpenWith />
        </IconButton>
        <Divider />
        <IconButton
          color={selectedTool === 'draw' ? 'secondary' : undefined}
          onClick={() => setSelectedTool('draw')}
        >
          <Gesture />
        </IconButton>
        <Divider />
        <IconButton
          color={selectedTool === 'erase' ? 'secondary' : undefined}
          onClick={() => setSelectedTool('erase')}
        >
          <AutoFixNormal />
        </IconButton>
        <Divider />
        <IconButton
          color={selectedTool === 'colorize' ? 'secondary' : undefined}
          onClick={() => setSelectedTool('colorize')}
        >
          <Colorize />
        </IconButton>
      </Stack>
      {(selectedTool === 'draw' || selectedTool === 'erase') && (
        <Stack
          alignItems="center"
          bgcolor="black"
          direction="row"
          gap={1}
          left={60}
          p={1}
          position="absolute"
          top={10}
        >
          <Typography>Size</Typography>
          <TextField onChange={(e) => setBrushSize(Number(e.target.value))} value={brushSize} />
          {selectedTool === 'draw' && (
            <>
              <Typography>Color</Typography>
              <TextField onChange={(e) => setStrokeStyle(e.target.value)} value={strokeStyle} />
            </>
          )}
        </Stack>
      )}
    </>
  );
};
