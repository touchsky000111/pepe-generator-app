import { PepeTrait, useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';
import { Stack } from '@mui/material';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';

// In your environment config
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

// Then in the component
const getImageUrl = (url: string) => {
  if (url.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY}${url.replace('ipfs://', '')}`;
  }
  return url;
};

export const EditorPreview: FC = () => {
  const traits = usePepeStore((state) => state.traits);

  const ctx = useEditorStore((state) => state.ctx);
  const setCtx = useEditorStore((state) => state.setCtx);

  const brushSize = useEditorStore((state) => state.brushSize);

  const customize = useEditorStore((state) => state.customize);
  const customizations = useEditorStore((state) => state.customizations);

  const editTraitIndex = useEditorStore((state) => state.editTraitIndex);

  const editTraitOptionId = useEditorStore((state) => state.editTraitOptionId);

  const isDrawing = useEditorStore((state) => state.isDrawing);
  const setIsDrawing = useEditorStore((state) => state.setIsDrawing);

  const newTraitId = useEditorStore((state) => state.newTraitId);

  const newTraitOptionId = useEditorStore((state) => state.newTraitOptionId);

  const newTraitOptions = useEditorStore((state) => state.newTraitOptions);

  const selectedPepe = useEditorStore((state) => state.selectedPepe);

  const scale = useEditorStore((state) => state.scale);

  const strokeStyle = useEditorStore((state) => state.strokeStyle);
  const setStrokeStyle = useEditorStore((state) => state.setStrokeStyle);

  const selectedTool = useEditorStore((state) => state.selectedTool);
  const setSelectedTool = useEditorStore((state) => state.setSelectedTool);

  const selectedTraitIndex = useEditorStore((state) => state.selectedTraitIndex);
  const setSelectedTraitIndex = useEditorStore((state) => state.setSelectedTraitIndex);

  const pepeTraits = useEditorStore((state) => state.traits);

  const updatePepe = useEditorStore((state) => state.update);

  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  const [isMoving, setIsMoving] = useState(false);
  const [startPosition, setStartPosition] = useState<[number, number]>([0, 0]);

  const handleDrawStart = (e: MouseEvent) => {
    e.preventDefault();

    if (selectedPepe?.isApproved) {
      return;
    }

    if (selectedTool === 'move') {
      setIsMoving(true);
      setStartPosition([
        e.clientX - (customizations[selectedTraitIndex]?.x || 0),
        e.clientY - (customizations[selectedTraitIndex]?.y || 0),
      ]);
      return;
    }

    const canvas = e.target as HTMLCanvasElement;

    const ctx = (e.target as HTMLCanvasElement).getContext('2d')!;
    setCtx(ctx);

    if (selectedTool === 'colorize') {
      const box = canvas.getBoundingClientRect();

      const x = e.clientX - box.left;
      const y = e.clientY - box.top;

      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;
      const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
      setStrokeStyle(rgba);
      setSelectedTool('draw');

      return;
    }

    ctx.globalCompositeOperation = selectedTool === 'erase' ? 'destination-out' : 'source-over';

    setIsDrawing(true);

    // Get the mouse position
    const box = canvas.getBoundingClientRect();
    const x = (e.clientX - box.left) / scale;
    const y = (e.clientY - box.top) / scale;

    // Begin a new path and set the starting point
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Draw a dot
    ctx.lineTo(x + 0.1, y + 0.1); // A small offset to create a dot
    ctx.stroke();
  };

  function handleDraw(event: MouseEvent) {
    event.preventDefault();

    if (selectedTool === 'move') {
      if (!isMoving) {
        return;
      }

      const dx = event.clientX - startPosition[0];
      const dy = event.clientY - startPosition[1];

      customize(selectedTraitIndex, 'x', dx);
      customize(selectedTraitIndex, 'y', dy);

      return;
    }

    if (!ctx || !isDrawing) return;

    const canvas = event.target as HTMLCanvasElement;
    const box = canvas.getBoundingClientRect();

    ctx.lineWidth = brushSize;

    if (selectedTool === 'draw') {
      ctx.strokeStyle = strokeStyle;
    } else if (selectedTool === 'erase') {
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }

    ctx.lineCap = 'round';

    const x = (event.clientX - box.left) / scale;
    const y = (event.clientY - box.top) / scale;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  const handleDrawEnd = (e: MouseEvent) => {
    e.preventDefault();

    if (selectedTool === 'move') {
      setIsMoving(false);

      const canvas = e.target as HTMLCanvasElement;

      const newTraits = JSON.parse(JSON.stringify(pepeTraits.slice())) as PepeTrait[];

      if (selectedTraitIndex === -1) {
        return;
      }

      newTraits.splice(selectedTraitIndex, 1, {
        ...newTraits[selectedTraitIndex],
        imageData: canvas.toDataURL('image/png'),
      });

      customize(selectedTraitIndex, 'x', 0);
      customize(selectedTraitIndex, 'y', 0);
      updatePepe({
        traits: newTraits,
      });

      return;
    }

    if (!ctx) return;
    setIsDrawing(false);
    ctx.globalCompositeOperation = 'source-over';

    const canvas = e.target as HTMLCanvasElement;

    const newTraits = JSON.parse(JSON.stringify(pepeTraits.slice())) as PepeTrait[];

    if (selectedTraitIndex === -1) {
      return;
    }

    newTraits.splice(selectedTraitIndex, 1, {
      ...newTraits[selectedTraitIndex],
      imageData: canvas.toDataURL('image/png'),
    });

    updatePepe({
      traits: newTraits,
    });
  };

  const handleNudge = (event: KeyboardEvent) => {
    if (selectedPepe?.isApproved) {
      return;
    }

    const keys: {
      [key: string]: () => [number, number];
    } = {
      ArrowRight: () => [1, 0],
      ArrowLeft: () => [-1, 0],
      ArrowUp: () => [0, -1],
      ArrowDown: () => [0, 1],
    };

    if (!keys[event.key] || !selectedPepe || document.activeElement?.tagName === 'INPUT') {
      return;
    }

    event.preventDefault();

    const [x, y] = keys[event.key]();
    const multiplier = event.shiftKey ? 10 : 1;

    if (selectedTraitIndex === -1) {
      return;
    }

    const trait = pepeTraits[selectedTraitIndex];

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d')!;

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src =
      editTraitIndex === selectedTraitIndex
        ? `/images/traits/${trait.folder}/${traits
          .find((t) => t.id === trait.id)!
          .options.find((o) => o.id === editTraitOptionId)?.file}`
        : trait.imageData
          ? trait.imageData
          : `/images/traits/${trait.folder}/${trait.file}`;
    image.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const newX = x * multiplier;
      const newY = y * multiplier;

      ctx.drawImage(image, newX, newY, 400, 400);

      const newTraits = JSON.parse(JSON.stringify(pepeTraits.slice())) as PepeTrait[];

      if (selectedTraitIndex === -1) {
        return;
      }

      newTraits.splice(selectedTraitIndex, 1, {
        ...newTraits[selectedTraitIndex],
        imageData: canvas.toDataURL('image/png'),
      });

      updatePepe({
        traits: newTraits,
      });
    };
  };

  useEffect(() => {
    if (!selectedPepe) {
      return;
    }

    pepeTraits.forEach((trait, traitIndex) => {
      if (!canvasRefs.current[traitIndex]) {
        return;
      }
      const canvas = canvasRefs.current[traitIndex];

      const ctx = canvas.getContext('2d')!;

      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src =
        editTraitIndex === traitIndex
          ? `/images/traits/${trait.folder}/${traits
            .find((t) => t.id === trait.id)!
            .options.find((o) => o.id === editTraitOptionId)?.file}`
          : trait.imageData
            ? trait.imageData
            : `/images/traits/${trait.folder}/${trait.file}`;
      image.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = customizations[traitIndex]?.x === undefined ? 0 : customizations[traitIndex].x;
        const y = customizations[traitIndex]?.y === undefined ? 0 : customizations[traitIndex].y;

        ctx.drawImage(image, x, y, image.width, image.height);
      };
    });

    if (selectedTool === 'move') {
      window.addEventListener('keydown', handleNudge);
    }

    return () => {
      window.removeEventListener('keydown', handleNudge);
    };
  }, [
    canvasRefs.current,
    customizations,
    editTraitIndex,
    editTraitOptionId,
    pepeTraits,
    selectedTool,
    selectedTraitIndex,
    traits,
  ]);

  useEffect(() => {
    if (!selectedTraitIndex) {
      setSelectedTraitIndex(pepeTraits.length - 1);
    }
  }, [pepeTraits, selectedTraitIndex]);

  if (!selectedPepe) {
    return null;
  }

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      position="relative"
      sx={{
        filter: selectedPepe.isApproved ? 'grayscale(100%)' : undefined,
        transition: '.25s transform',
        transform: `scale(${scale})`,
      }}
    >
      {selectedPepe.imageUrl ? (
        <img
          src={getImageUrl(selectedPepe.imageUrl)}
          height="400px"
          width="400px"
          style={{ display: 'block' }}
        />
      ) : (
        <>
          <img
            src={`/images/blank.png`}
            height="400px"
            width="400px"
            style={{ display: 'block' }}
          />
          {pepeTraits.map((trait, traitIndex) => {
            const file =
              editTraitIndex === traitIndex
                ? traits
                  .find((t) => t.id === trait.id)
                  ?.options.find((o) => o.id === editTraitOptionId)?.file
                : trait.file;

            if (!file) {
              return null;
            }

            return (
              <canvas
                ref={(ref) => {
                  (canvasRefs as any).current[traitIndex] = ref;
                }}
                onPointerDown={handleDrawStart}
                onPointerMove={handleDraw}
                onPointerUp={handleDrawEnd}
                key={traitIndex}
                style={{
                  cursor: selectedPepe.isApproved
                    ? 'not-allowed'
                    : ['colorize', 'draw', 'erase'].includes(selectedTool) &&
                      selectedTraitIndex === traitIndex
                      ? `url('/api/cursor?size=${brushSize}&zoom=${scale}') ${(brushSize * scale) / 2 + 1
                      } ${(brushSize * scale) / 2 + 1}, auto`
                      : 'move',
                  pointerEvents: selectedTraitIndex === traitIndex ? 'auto' : 'none',
                  position: 'absolute',
                  opacity:
                    customizations[traitIndex]?.opacity === undefined
                      ? 1
                      : customizations[traitIndex].opacity * 0.01,
                  touchAction: 'none',
                }}
                height="400px"
                width="400px"
              />
            );
          })}
          {newTraitOptionId > 0 && (
            <img
              src={`/images/traits/${traits.find((t) => t.id === newTraitId)!.folder}/${newTraitOptions.find((o) => o.id === newTraitOptionId)!.file
                }`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              width="100%"
            />
          )}
        </>
      )}
    </Stack>
  );
};
