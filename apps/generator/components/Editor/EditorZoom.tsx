import { useEditorStore } from '@/stores/editor';
import { FindReplace, ZoomIn, ZoomOut } from '@mui/icons-material';
import { Divider, IconButton, Stack, TextField } from '@mui/material';
import { FC, FormEvent, useEffect, useState } from 'react';

export const EditorZoom: FC = () => {
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);

  const [scaleValue, setScaleValue] = useState('0%');

  const handleKey = (event: KeyboardEvent) => {
    if (event.metaKey && ['0', '-', '='].includes(event.key)) {
      event.preventDefault();
    }

    const keys: {
      [key: string]: () => void;
    } = {
      '0': () => handleScale(1),
      '-': () => handleScale(scale - 0.1),
      '=': () => handleScale(scale + 0.1),
    };

    event.metaKey && keys[event.key]?.();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [scale]);

  const handleScale = (scale: number) => {
    if (scale < 0.1) {
      return;
    }
    setScale(scale);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    let value = Number(scaleValue.replace(/%$/, ''));

    if (isNaN(value)) {
      setScaleValue(`${(scale * 100).toFixed(0)}%`);
      return;
    }

    if (value < 10) {
      value = 10;
    } else if (value > 999) {
      value = 999;
    }

    setScale(value * 0.01);
  };

  useEffect(() => {
    setScaleValue(`${(scale * 100).toFixed(0)}%`);
  }, [scale]);

  return (
    <Stack
      bgcolor="black"
      border="1px #999 solid"
      bottom={10}
      justifyContent="center"
      left={10}
      position="absolute"
      zIndex={99999}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          onChange={(e) => setScaleValue(e.target.value)}
          value={scaleValue}
          sx={{ fontSize: '1rem', width: '40px' }}
          inputProps={{ maxLength: 4, style: { textAlign: 'center' } }}
        />
      </form>
      <IconButton onClick={() => handleScale(scale + 0.1)}>
        <ZoomIn />
      </IconButton>
      <Divider />
      <IconButton onClick={() => handleScale(1)}>
        <FindReplace />
      </IconButton>
      <Divider />
      <IconButton onClick={() => handleScale(scale - 0.1)}>
        <ZoomOut />
      </IconButton>
    </Stack>
  );
};
