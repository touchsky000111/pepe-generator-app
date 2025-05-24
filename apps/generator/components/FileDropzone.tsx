import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Accept, DropEvent, FileRejection, useDropzone } from 'react-dropzone';

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

export const FileDropzone: FC<{
  accept?: Accept;
  isLoading?: boolean;
  onDrop?: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
  showPreview?: boolean;
  text?: string;
  thumbnailUrl?: string;
  type?: 'drop' | 'button';
}> = ({
  accept = { '*/*': [] },
  isLoading = false,
  onDrop,
  showPreview = true,
  text,
  thumbnailUrl,
  type = 'drop',
}) => {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept,
    onDrop: (acceptedFiles, fileRejections, event) => {
      const reader = new FileReader();
      reader.readAsDataURL(acceptedFiles[0]);
      reader.onload = function (evt) {
        setPreviewFileUrl((evt.target as any).result);
      };
      reader.onerror = function (evt) {
        console.log('error reading file');
      };

      onDrop?.(acceptedFiles, fileRejections, event);
    },
  });

  const style = useMemo(
    () => (isFocused ? focusedStyle : isDragAccept ? acceptStyle : isDragReject ? rejectStyle : {}),
    [isFocused, isDragAccept, isDragReject],
  );

  const [previewFileUrl, setPreviewFileUrl] = useState('');

  return (
    <Stack
      alignItems="center"
      bgcolor={type === 'drop' ? 'transparent' : 'black'}
      border={type === 'drop' ? '2px white dashed' : 'none'}
      borderRadius={2}
      flexDirection="row"
      justifyContent="center"
      gap={type === 'drop' ? 2 : 0}
      p={type === 'drop' ? 2 : 1}
      sx={{
        cursor: 'pointer',
      }}
      {...getRootProps({ style })}
    >
      <input {...getInputProps()} />
      {showPreview && (
        <Box
          bgcolor="black"
          component={previewFileUrl || thumbnailUrl ? 'img' : 'div'}
          minHeight={50}
          maxHeight={50}
          src={previewFileUrl || thumbnailUrl || undefined}
          minWidth={50}
          maxWidth={50}
        />
      )}
      {isLoading ? (
        <Stack alignItems="center" direction="row" gap={2} justifyContent="space-between">
          <Typography>Uploading...</Typography>
          <CircularProgress size={16} />
        </Stack>
      ) : (
        <Typography>{text ? text : 'Drag and drop or click to upload image'}</Typography>
      )}
    </Stack>
  );
};
