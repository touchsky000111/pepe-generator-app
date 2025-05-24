import { PepeTrait, useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';
import { arrayMove } from '@/utils/arrayMove';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  DoubleArrow as DoubleArrowIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { sentenceCase } from 'change-case';
import { FC, FormEvent, Fragment, MouseEvent, useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { FileDropzone } from '../FileDropzone';
import traitOptionIsNewest from '@/utils/traitOptionIsNewest';
import traitOptionIsNew from '@/utils/traitOptionIsNew';
import traitOptionIsOld from '@/utils/traitOptionIsOld';
import traitOptionIsLast from '@/utils/traitOptionIsLast';

export const EditorLayers: FC = () => {
  const fetchPepes = usePepeStore((state) => state.fetchPepes);

  const traits = usePepeStore((state) => state.traits);

  const customize = useEditorStore((state) => state.customize);

  const customizations = useEditorStore((state) => state.customizations);

  const editTraitIndex = useEditorStore((state) => state.editTraitIndex);
  const setEditTraitIndex = useEditorStore((state) => state.setEditTraitIndex);

  const editTraitOptionId = useEditorStore((state) => state.editTraitOptionId);
  const setEditTraitOptionId = useEditorStore((state) => state.setEditTraitOptionId);

  const editTraitOptions = useEditorStore((state) => state.editTraitOptions);
  const setEditTraitOptions = useEditorStore((state) => state.setEditTraitOptions);

  const isCustomMetadata = useEditorStore((state) => state.isCustomMetadata);
  const setIsCustomMetadata = useEditorStore((state) => state.setIsCustomMetadata);

  const isUpdating = useEditorStore((state) => state.isUpdating);
  const setIsUpdating = useEditorStore((state) => state.setIsUpdating);

  const isUploadingMetadata = useEditorStore((state) => state.isUploadingMetadata);
  const setIsUploadingMetadata = useEditorStore((state) => state.setIsUploadingMetadata);

  const newTraitId = useEditorStore((state) => state.newTraitId);
  const setNewTraitId = useEditorStore((state) => state.setNewTraitId);

  const newTraitOptionId = useEditorStore((state) => state.newTraitOptionId);
  const setNewTraitOptionId = useEditorStore((state) => state.setNewTraitOptionId);

  const newTraitOptions = useEditorStore((state) => state.newTraitOptions);
  const setNewTraitOptions = useEditorStore((state) => state.setNewTraitOptions);

  const selectedPepe = useEditorStore((state) => state.selectedPepe);

  const selectedTab = useEditorStore((state) => state.selectedTab);
  const setSelectedTab = useEditorStore((state) => state.setSelectedTab);

  const selectedTraitIndex = useEditorStore((state) => state.selectedTraitIndex);
  const setSelectedTraitIndex = useEditorStore((state) => state.setSelectedTraitIndex);

  const showNew = useEditorStore((state) => state.showNew);
  const setShowNew = useEditorStore((state) => state.setShowNew);

  const pepeTraits = useEditorStore((state) => state.traits);

  const updatePepe = useEditorStore((state) => state.update);

  const [opacityValue, setOpacityValue] = useState('100%');

  const [hoverImageTraitIndex, setHoverImageTraitIndex] = useState(-1);

  const handleClearModifications = (index: number) => {
    const updatedTraits = JSON.parse(JSON.stringify(pepeTraits)) as PepeTrait[];

    delete updatedTraits[index].imageData;

    updatePepe({
      traits: updatedTraits,
    });
  };

  const handleLayerImage = async (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const dataUrl = e.target!.result as string;

      const updatedTraits = JSON.parse(JSON.stringify(pepeTraits)) as PepeTrait[];

      updatedTraits[selectedTraitIndex].imageData = dataUrl;

      updatePepe({
        traits: updatedTraits,
      });
      setEditTraitIndex(-1);
      setEditTraitOptionId(0);
    };

    reader.readAsDataURL(file);
  };

  const handleMove = async (e: MouseEvent, traitIndex: number, direction: 'up' | 'down') => {
    if (!selectedPepe) {
      return;
    }

    const frogTraitId = traits.find((trait) => trait.folder === 'skin')!.id;
    const frogTraitIndex = pepeTraits.findIndex((pepeTrait) => pepeTrait.id === frogTraitId) + 1;

    const updatedTraits = e.metaKey
      ? arrayMove(
        pepeTraits,
        traitIndex,
        direction === 'up' ? pepeTraits.length - 1 : frogTraitIndex,
      )
      : arrayMove(pepeTraits, traitIndex, direction === 'up' ? traitIndex + 1 : traitIndex - 1);

    setEditTraitIndex(-1);
    setEditTraitOptionId(0);

    updatePepe({
      traits: updatedTraits,
    });
  };

  const handleNewTrait = async () => {
    const newTrait = traits.find((trait) => trait.id === newTraitId)!;
    const newTraitOption = newTrait.options.find((option) => option.id === newTraitOptionId)!;

    updatePepe({
      traits: pepeTraits.concat({
        id: newTraitId,
        optionId: newTraitOptionId,
        folder: newTrait.folder,
        file: newTraitOption.file,
        name: newTrait.name,
        value: newTraitOption.name,
      }),
    });

    setNewTraitId(0);
    setNewTraitOptionId(0);
    setShowNew(false);
  };

  const handleOpacity = (e: FormEvent) => {
    e.preventDefault();

    let value = Number(opacityValue.replace(/%$/, ''));

    if (isNaN(value)) {
      if (customizations[selectedTraitIndex]?.opacity === undefined) {
        setOpacityValue('100%');
        return;
      }

      setOpacityValue(`${customizations[selectedTraitIndex].opacity}%`);

      return;
    }

    if (value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }

    customize(selectedTraitIndex, 'opacity', value);
  };

  const handleUpdateTrait = async () => {
    const updatedTraits = JSON.parse(JSON.stringify(pepeTraits)) as PepeTrait[];
    const updatedTraitOption = traits
      .find((t) => t.id === pepeTraits[editTraitIndex].id)!
      .options.find((o) => o.id === editTraitOptionId);

    if (!updatedTraitOption) {
      updatedTraits.splice(editTraitIndex, 1);
    } else {
      // trait has not changed
      if (updatedTraits[editTraitIndex].optionId === updatedTraitOption.id) {
        setEditTraitIndex(-1);
        setEditTraitOptionId(0);
        return;
      }

      delete updatedTraits[editTraitIndex].imageData;
      updatedTraits[editTraitIndex].file = updatedTraitOption.file;
      updatedTraits[editTraitIndex].optionId = updatedTraitOption.id;
      updatedTraits[editTraitIndex].value = updatedTraitOption.name;
    }

    updatePepe({
      traits: updatedTraits,
    });
    setEditTraitIndex(-1);
    setEditTraitOptionId(0);
  };

  const handleUploadMetadata = async (files: File[]) => {
    if (!selectedPepe) {
      return;
    }

    setIsUpdating(true);
    setIsUploadingMetadata(true);

    const formData = new FormData();
    formData.append('id', selectedPepe.id.toString());
    formData.append('file', files[0]);

    await axios.postForm('/api/uploadMetadata', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setIsUpdating(false);
    setIsUploadingMetadata(false);
    fetchPepes();
  };

  const handleUploadMetadataRemove = async () => {
    if (!selectedPepe) {
      return;
    }

    setIsUpdating(true);
    setIsUploadingMetadata(true);

    await axios({
      method: 'POST',
      url: '/api/removeMetadata',
      data: {
        id: selectedPepe.id,
      },
    });

    setIsUpdating(false);
    setIsUploadingMetadata(false);
    fetchPepes();
  };

  useEffect(() => {
    const pepeTrait = pepeTraits[editTraitIndex];
    const trait = traits.find((trait) => trait.id === pepeTrait?.id);

    if (!trait) {
      setEditTraitOptions([]);
      return;
    }

    setEditTraitOptions(trait.options);
  }, [editTraitIndex, pepeTraits, traits]);

  useEffect(() => {
    const trait = traits.find((trait) => trait.id === newTraitId);

    if (!trait) {
      setNewTraitOptions([]);
      return;
    }

    setNewTraitOptions(trait.options);
    setNewTraitOptionId(0);
  }, [newTraitId, traits]);

  useEffect(() => {
    if (customizations[selectedTraitIndex]?.opacity === undefined) {
      setOpacityValue('100%');
      return;
    }

    setOpacityValue(`${customizations[selectedTraitIndex].opacity}%`);
  }, [customizations, selectedTraitIndex]);

  if (!selectedPepe) {
    return null;
  }

  return (
    <>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Tabs onChange={(_, value) => setSelectedTab(value)} value={selectedTab}>
          <Tab label="Traits" value="details" />
          <Tab label="Metadata" value="metadata" />
        </Tabs>
        <Stack alignItems="center" direction="row" gap={1}>
          <Typography>Opacity</Typography>
          <form onSubmit={handleOpacity}>
            <TextField
              onChange={(e) => setOpacityValue(e.target.value)}
              value={opacityValue}
              sx={{ fontSize: '1rem', width: '40px' }}
              inputProps={{ maxLength: 4, style: { textAlign: 'center' } }}
            />
          </form>
          <Button disabled={selectedPepe.isApproved} onClick={() => setShowNew(true)}>
            New Trait
          </Button>
        </Stack>
      </Stack>
      {selectedTab === 'details' && (
        <Stack direction="column-reverse" gap={1}>
          {selectedPepe.metadata && (
            <Stack
              alignItems="center"
              justifyContent="center"
              height="200px"
              maxWidth="100%"
              width="557px"
            >
              Custom metadata is set for this Pepe
            </Stack>
          )}
          {selectedPepe.imageUrl && (
            <Stack
              alignItems="center"
              justifyContent="center"
              height="200px"
              maxWidth="100%"
              width="557px"
            >
              Custom image is set for this Pepe
            </Stack>
          )}
          {
            !selectedPepe.imageUrl &&
            pepeTraits.map((trait, traitIndex, pepeTraits) => (
              <Stack
                alignItems="center"
                direction="row"
                gap={1}
                key={traitIndex}
                onClick={() => setSelectedTraitIndex(traitIndex)}
                sx={{
                  backgroundColor: selectedTraitIndex === traitIndex ? '#333' : undefined,
                  cursor: 'pointer',
                  width: '100%',
                  ':hover': {
                    backgroundColor: '#222',
                  },
                }}
              >
                <Stack
                  position="relative"
                  onMouseEnter={() => setHoverImageTraitIndex(traitIndex)}
                  onMouseLeave={() => setHoverImageTraitIndex(-1)}
                >
                  <img
                    height="100"
                    width="100"
                    src={
                      trait.imageData
                        ? trait.imageData
                        : `/images/traits/${trait.folder}/${trait.file}`
                    }
                    style={{
                      backgroundColor: '#FFF',
                      objectFit: 'contain',
                      objectPosition: 'left top',
                    }}
                  />
                  {!selectedPepe.isApproved && hoverImageTraitIndex === traitIndex && (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                    >
                      <FileDropzone
                        onDrop={(files) => handleLayerImage(files)}
                        type="button"
                        accept={{ ['image/png']: ['.png'] }}
                        showPreview={false}
                        text="Upload"
                      />
                    </Stack>
                  )}
                </Stack>
                <Stack
                  sx={{
                    width: 100,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    height="56px"
                    lineHeight="56px"
                    onClick={() => setSelectedTraitIndex(traitIndex)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {trait.name === 'bg' ? 'Background' : sentenceCase(trait.name)}
                  </Typography>
                </Stack>
                <Stack flexGrow={1}>
                  <Stack alignItems="center" direction="row" gap={1}>
                    {editTraitIndex === traitIndex ? (
                      <>
                        <Select
                          fullWidth
                          onChange={(e) => setEditTraitOptionId(Number(e.target.value))}
                          value={editTraitOptionId}
                        >
                          <MenuItem value={0}>(None)</MenuItem>
                          <Divider />
                          {editTraitOptions
                            .filter((option) => traitOptionIsLast(option.createdAt))
                            .map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                <Stack
                                  alignItems="center"
                                  direction="row"
                                  justifyContent="space-between"
                                  width="100%"
                                >
                                  {option.name}
                                  <Chip color="success" label="LAST" />
                                </Stack>
                              </MenuItem>
                            ))}
                          {editTraitOptions
                            .filter((option) => traitOptionIsNewest(option.createdAt))
                            .map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                <Stack
                                  alignItems="center"
                                  direction="row"
                                  justifyContent="space-between"
                                  width="100%"
                                >
                                  {option.name}
                                  <Chip color="primary" label="NEWEST" />
                                </Stack>
                              </MenuItem>
                            ))}
                          {editTraitOptions
                            .filter((option) => traitOptionIsNew(option.createdAt))
                            .map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                <Stack
                                  alignItems="center"
                                  direction="row"
                                  justifyContent="space-between"
                                  width="100%"
                                >
                                  {option.name}
                                  <Chip color="secondary" label="NEW" />
                                </Stack>
                              </MenuItem>
                            ))}
                          {editTraitOptions
                            .filter((option) => traitOptionIsOld(option.createdAt))
                            .map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                        </Select>
                        <IconButton
                          disabled={isUpdating || !!selectedPepe.metadata}
                          onClick={() => handleUpdateTrait()}
                        >
                          {isUpdating ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                          ) : (
                            <CheckIcon sx={{ color: 'white' }} />
                          )}
                        </IconButton>
                        <IconButton
                          disabled={isUpdating || !!selectedPepe.metadata}
                          onClick={() => {
                            setEditTraitIndex(-1);
                            setEditTraitOptionId(0);
                          }}
                        >
                          <CancelIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Box
                          display="flex"
                          flexDirection="column"
                          flexGrow="1"
                          justifyContent="center"
                          height="100%"
                        >
                          <Typography>{trait.value}</Typography>
                          {trait.imageData && (
                            <Typography
                              color="secondary"
                              textTransform="uppercase"
                              variant="body2"
                              style={{ display: 'block' }}
                            >
                              Modified{' '}
                              <Button
                                disabled={selectedPepe.isApproved}
                                onClick={() => handleClearModifications(traitIndex)}
                              >
                                Reset
                              </Button>
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          disabled={
                            selectedPepe.isApproved ||
                            isUpdating ||
                            traitIndex === pepeTraits.length - 1 ||
                            !!selectedPepe.metadata
                          }
                          onClick={(e) => handleMove(e, traitIndex, 'up')}
                        >
                          <ArrowUpwardIcon sx={{ color: 'white' }} />
                        </IconButton>
                        <IconButton
                          disabled={
                            selectedPepe.isApproved ||
                            isUpdating ||
                            traitIndex === 0 ||
                            !!selectedPepe.metadata
                          }
                          onClick={(e) => handleMove(e, traitIndex, 'down')}
                        >
                          <ArrowDownwardIcon sx={{ color: 'white' }} />
                        </IconButton>
                        <IconButton
                          disabled={
                            selectedPepe.isApproved || isUpdating || !!selectedPepe.metadata
                          }
                          onClick={() => {
                            setEditTraitIndex(traitIndex);
                            setEditTraitOptionId(trait.optionId);
                          }}
                        >
                          <EditIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          {showNew && (
            <Stack>
              <Stack>
                <Select
                  fullWidth
                  onChange={(e) => setNewTraitId(Number(e.target.value))}
                  placeholder="Trait"
                  value={newTraitId}
                >
                  {traits.map((trait) => (
                    <MenuItem key={trait.id} value={trait.id}>
                      {trait.name === 'bg' ? 'Background' : sentenceCase(trait.name)}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
              <Stack>
                <Stack alignItems="center" direction="row" gap={1}>
                  <Select
                    fullWidth
                    onChange={(e) => setNewTraitOptionId(Number(e.target.value))}
                    placeholder="Option"
                    value={newTraitOptionId}
                  >
                    {newTraitOptions
                      .filter((option) => traitOptionIsLast(option.createdAt))
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                            width="100%"
                          >
                            {option.name}
                            <Chip color="success" label="LAST" />
                          </Stack>
                        </MenuItem>
                      ))}
                    {newTraitOptions
                      .filter((option) => traitOptionIsNewest(option.createdAt))
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                            width="100%"
                          >
                            {option.name}
                            <Chip color="primary" label="NEWEST" />
                          </Stack>
                        </MenuItem>
                      ))}
                    {newTraitOptions
                      .filter((option) => traitOptionIsNew(option.createdAt))
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                            width="100%"
                          >
                            {option.name}
                            <Chip color="secondary" label="NEW" />
                          </Stack>
                        </MenuItem>
                      ))}
                    {newTraitOptions
                      .filter((option) => traitOptionIsOld(option.createdAt))
                      .map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                  </Select>
                  <IconButton
                    disabled={isUpdating || !!selectedPepe.metadata}
                    onClick={() => handleNewTrait()}
                  >
                    {isUpdating ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      <CheckIcon sx={{ color: 'white' }} />
                    )}
                  </IconButton>
                  <IconButton
                    disabled={isUpdating || !!selectedPepe.metadata}
                    onClick={() => {
                      setNewTraitId(0);
                      setNewTraitOptionId(0);
                      setShowNew(false);
                    }}
                  >
                    <CancelIcon sx={{ color: 'white' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Stack>
      )}
      {selectedTab === 'metadata' && (
        <>
          {(!selectedPepe || !selectedPepe.metadata) && !isCustomMetadata && (
            <Button disabled={selectedPepe.isApproved} onClick={() => setIsCustomMetadata(true)}>
              Use Custom Metadata
            </Button>
          )}
          {(selectedPepe.metadata || isCustomMetadata) && (
            <FileDropzone
              accept={{ ['application/json']: ['.json'] }}
              onDrop={(files) => handleUploadMetadata(files)}
              isLoading={isUploadingMetadata}
              showPreview={false}
              text="Drag and drop or click to upload metadata"
            />
          )}
          {selectedPepe.metadata && (
            <Button onClick={handleUploadMetadataRemove}>Remove Custom Metadata</Button>
          )}
          <Box flexGrow={1} maxWidth="100%" width="557px">
            <SyntaxHighlighter
              language="json"
              customStyle={{
                fontSize: '1rem',
              }}
            >
              {selectedPepe.metadata
                ? JSON.stringify(selectedPepe.metadata)
                : JSON.stringify(
                  {
                    name: `Pepe #${selectedPepe.id}`,
                    description: 'Pepe',
                    image: `https://pepe.fun/pepes/${selectedPepe.id}.png`,
                    attributes: selectedPepe
                      ? pepeTraits.map((trait) => ({
                        name: trait.name,
                        value: trait.value,
                      }))
                      : [],
                  },
                  null,
                  2,
                )}
            </SyntaxHighlighter>
          </Box>
        </>
      )}
    </>
  );
};
