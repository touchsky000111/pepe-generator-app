import { Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import { Button, IconButton, Stack } from '@mui/material';
import axios from 'axios';
import { FC } from 'react';

import { FileDropzone } from '@/components/FileDropzone';
import { useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';

export const EditorCustomImage: FC = () => {
  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const isCustom = useEditorStore((state) => state.isCustom);
  const setIsCustom = useEditorStore((state) => state.setIsCustom);

  const pepeId = useEditorStore((state) => state.pepeId);

  const selectedPepe = useEditorStore((state) => state.selectedPepe);

  const setIsUpdating = useEditorStore((state) => state.setIsUpdating);

  const isUploadingImage = useEditorStore((state) => state.isUploadingImage);
  const setIsUploadingImage = useEditorStore((state) => state.setIsUploadingImage);

  const handleDownload = async () => {
    if (!selectedPepe) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d')!;

    const images = await Promise.all(
      selectedPepe.traits.map(
        (trait) =>
          new Promise<HTMLImageElement>((res) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous';
            image.src = trait.imageData
              ? trait.imageData
              : `/images/traits/${trait.folder}/${trait.file}`;
            image.onload = function () {
              res(image);
            };
          }),
      ),
    );

    images.forEach((image) => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });

    const dataURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = `Pepe ${selectedPepe.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleUpload = async (files: File[]) => {
    setIsUpdating(true);
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append('id', pepeId.toString());
    formData.append('image', files[0]);

    await axios.postForm('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setIsUpdating(false);
    setIsUploadingImage(false);
    fetchPepes();
  };

  const handleUploadRemove = async () => {
    setIsUpdating(true);
    setIsUploadingImage(true);

    await axios({
      method: 'POST',
      url: '/api/removeUpload',
      data: {
        id: pepeId,
      },
    });

    setIsUpdating(false);
    setIsUploadingImage(false);
    fetchPepes();
  };

  if (!selectedPepe) {
    return null;
  }

  return (
    <Stack bottom={10} gap={1} position="absolute" right={10}>
      {(selectedPepe.imageUrl || isCustom) && (
        <FileDropzone
          accept={{ ['image/png']: ['.png'] }}
          onDrop={(files) => handleUpload(files)}
          isLoading={isUploadingImage}
        />
      )}
      {selectedPepe.imageUrl && <Button onClick={handleUploadRemove}>Remove Custom Image</Button>}
      {!selectedPepe.imageUrl && !isCustom && (
        <IconButton disabled={selectedPepe.isApproved} onClick={() => setIsCustom(true)}>
          <UploadIcon />
        </IconButton>
      )}
      <IconButton onClick={() => handleDownload()}>
        <DownloadIcon />
      </IconButton>
    </Stack>
  );
};
