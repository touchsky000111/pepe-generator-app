import { Stack, useMediaQuery } from '@mui/material';
import { FC, useEffect } from 'react';

import { EditorCustomImage } from '@/components/Editor/EditorCustomImage';
import { EditorLabels } from '@/components/Editor/EditorLabels';
import { EditorLayers } from '@/components/Editor/EditorLayers';
import { EditorPreview } from '@/components/Editor/EditorPreview';
import { EditorTools } from '@/components/Editor/EditorTools';
import { EditorZoom } from '@/components/Editor/EditorZoom';
import { useEditorStore } from '@/stores/editor';

export const PepeDialog: FC<{
  pepeId: number;
}> = () => {
  const onlySmallScreen = useMediaQuery('(max-width: 600px)');

  const selectedPepe = useEditorStore((state) => state.selectedPepe);

  if (!selectedPepe) {
    return null;
  }

  return (
    <>
      <Stack
        alignItems={onlySmallScreen ? 'center' : 'flex-start'}
        direction={onlySmallScreen ? 'column' : 'row'}
        gap={2}
        height="calc(100vh - 64px)"
        mt="64px"
      >
        <Stack
          alignItems="center"
          height="100%"
          justifyContent="center"
          overflow="hidden"
          position="relative"
          sx={{ backgroundColor: 'gray' }}
          width="60vw"
        >
          <EditorPreview />
          <EditorTools />
          <EditorZoom />
          <EditorLabels />
          <EditorCustomImage />
        </Stack>
        <Stack gap={2} height="100%" overflow="auto" width="40vw">
          <EditorLayers />
        </Stack>
      </Stack>
    </>
  );
};
