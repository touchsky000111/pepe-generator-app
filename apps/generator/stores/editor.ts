import axios from 'axios';
import { StateCreator, create } from 'zustand';
import { Trait } from './pepe';
import { dataURLtoBlob } from '@/utils/dataUrlToBlob';
import { convertImageToDataURL } from '@/utils/imageToDataUrl';

interface Step {
  traits: PepeTrait[];
}

type AppState = EditorState;

interface Pepe {
  id: number;
  imageUrl?: string;
  labels: string[];
  isApproved: boolean;
  metadata?: string;
  originalPepeId?: number;
  status: string;
  traits: PepeTrait[];
}

interface Customization {
  traitId: number;
  x: number;
  y: number;
  opacity: number;
}

type Tab = 'details' | 'metadata';

export interface PepeTrait {
  id: number;
  optionId: number;
  folder: string;
  file: string;
  name: string;
  value: string;
  imageData?: string;
}

interface TraitOption {
  id: number;
  createdAt: string;
  file: string;
  name: string;
}

type Tool = 'move' | 'draw' | 'erase' | 'colorize';

export interface EditorState {
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;

  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;

  pepeId: number;
  setPepeId: (pepeId: number) => void;

  currentStep: number;
  setCurrentStep: (currentStep: number) => void;

  steps: Step[];
  setSteps: (actions: Step[]) => void;

  customizations: {
    [traitId: number]: Customization;
  };
  setCustomizations: (customizations: { [traitId: number]: Customization }) => void;

  editTraitIndex: number;
  setEditTraitIndex: (editTraitIndex: number) => void;

  editTraitOptionId: number;
  setEditTraitOptionId: (editTraitOptionId: number) => void;

  editTraitOptions: TraitOption[];
  setEditTraitOptions: (editTraitOptions: TraitOption[]) => void;

  showNew: boolean;
  setShowNew: (showNew: boolean) => void;

  newTraitId: number;
  setNewTraitId: (newTraitId: number) => void;

  newTraitOptionId: number;
  setNewTraitOptionId: (newTraitOptionId: number) => void;

  newTraitOptions: TraitOption[];
  setNewTraitOptions: (newTraitOptions: TraitOption[]) => void;

  selectedTraitIndex: number;
  setSelectedTraitIndex: (selectedTraitIndex: number) => void;

  selectedTool: Tool;
  setSelectedTool: (selectedTool: Tool) => void;

  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;

  ctx: CanvasRenderingContext2D | undefined;
  setCtx: (ctx: CanvasRenderingContext2D) => void;

  brushSize: number;
  setBrushSize: (brushSize: number) => void;

  strokeStyle: string;
  setStrokeStyle: (strokeStyle: string) => void;

  showNewLabel: boolean;
  setShowNewLabel: (showNewLabel: boolean) => void;

  newLabel: string;
  setNewLabel: (newLabel: string) => void;

  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;

  selectedPepe: Pepe | undefined;
  setSelectedPepe: (selectedPepe: Pepe | undefined) => void;

  selectedTab: Tab;
  setSelectedTab: (selectedTab: Tab) => void;

  traits: PepeTrait[];
  setTraits: (traits: PepeTrait[]) => void;

  isCustom: boolean;
  setIsCustom: (isCustom: boolean) => void;

  isCustomMetadata: boolean;
  setIsCustomMetadata: (isCustomMetadata: boolean) => void;

  isUploadingImage: boolean;
  setIsUploadingImage: (isUploadingImage: boolean) => void;

  isUploadingMetadata: boolean;
  setIsUploadingMetadata: (isUploadingMetadata: boolean) => void;

  scale: number;
  setScale: (scale: number) => void;

  customize: (traitId: number, key: 'x' | 'y' | 'opacity', value: any) => void;
  duplicate: () => Promise<void>;
  fetchPepe: (pepeId: number) => Promise<void>;
  redo: () => void;
  reset: () => void;
  save: () => Promise<void>;
  update: (step: Step) => void;
  undo: () => void;
}

export const createEditorSlice: StateCreator<EditorState> = (set, get) => ({
  isInitialized: false,
  setIsInitialized: (isInitialized) => set(() => ({ isInitialized })),

  isSaving: false,
  setIsSaving: (isSaving) => set(() => ({ isSaving })),

  pepeId: 0,
  setPepeId: (pepeId) => set(() => ({ pepeId })),

  currentStep: -1,
  setCurrentStep: (currentStep) => set(() => ({ currentStep })),

  steps: [],
  setSteps: (steps) => set(() => ({ steps })),

  customizations: [],
  setCustomizations: (customizations) => set(() => ({ customizations })),

  editTraitIndex: -1,
  setEditTraitIndex: (editTraitIndex) => set(() => ({ editTraitIndex })),

  editTraitOptionId: 0,
  setEditTraitOptionId: (editTraitOptionId) => set(() => ({ editTraitOptionId })),

  editTraitOptions: [],
  setEditTraitOptions: (editTraitOptions) => set(() => ({ editTraitOptions })),

  showNew: false,
  setShowNew: (showNew) => set(() => ({ showNew })),

  newTraitId: 0,
  setNewTraitId: (newTraitId) => set(() => ({ newTraitId })),

  newTraitOptionId: 0,
  setNewTraitOptionId: (newTraitOptionId) => set(() => ({ newTraitOptionId })),

  newTraitOptions: [],
  setNewTraitOptions: (newTraitOptions) => set(() => ({ newTraitOptions })),

  selectedTraitIndex: 0,
  setSelectedTraitIndex: (selectedTraitIndex) => set(() => ({ selectedTraitIndex })),

  selectedTool: 'move',
  setSelectedTool: (selectedTool) => set(() => ({ selectedTool })),

  isDrawing: false,
  setIsDrawing: (isDrawing) => set(() => ({ isDrawing })),

  ctx: undefined,
  setCtx: (ctx) => set(() => ({ ctx })),

  brushSize: 3,
  setBrushSize: (brushSize) => set(() => ({ brushSize })),

  strokeStyle: 'black',
  setStrokeStyle: (strokeStyle) => set(() => ({ strokeStyle })),

  showNewLabel: false,
  setShowNewLabel: (showNewLabel) => set(() => ({ showNewLabel })),

  newLabel: '',
  setNewLabel: (newLabel) => set(() => ({ newLabel })),

  isUpdating: false,
  setIsUpdating: (isUpdating) => set(() => ({ isUpdating })),

  selectedPepe: undefined,
  setSelectedPepe: (selectedPepe) => set(() => ({ selectedPepe })),

  selectedTab: 'details',
  setSelectedTab: (selectedTab) => set(() => ({ selectedTab })),

  traits: [],
  setTraits: (traits) => set(() => ({ traits })),

  isCustom: false,
  setIsCustom: (isCustom) => set(() => ({ isCustom })),

  isCustomMetadata: false,
  setIsCustomMetadata: (isCustomMetadata) => set(() => ({ isCustomMetadata })),

  isUploadingImage: false,
  setIsUploadingImage: (isUploadingImage) => set(() => ({ isUploadingImage })),

  isUploadingMetadata: false,
  setIsUploadingMetadata: (isUploadingMetadata) => set(() => ({ isUploadingMetadata })),

  scale: 1,
  setScale: (scale) => set(() => ({ scale })),

  customize: (traitIndex, key, value) => {
    const customizations = get().customizations;

    set({
      customizations: {
        [traitIndex]: {
          ...customizations[traitIndex],
          [key]: value,
        },
      },
    });
  },
  duplicate: async () => {
    const { selectedPepe, traits } = get();

    if (!selectedPepe) {
      return;
    }

    set({ isSaving: true });

    const { id } = (
      await axios({
        method: 'POST',
        url: '/api/duplicateExactPepe',
        data: {
          id: selectedPepe.id,
        },
      })
    ).data as {
      id: number;
    };

    set({ isSaving: false });

    window.location.href = `/pepes/${id}?page=${Math.ceil(id/100)}`;
  },
  fetchPepe: async (pepeId) => {
    const { pepe } = (
      await axios({
        method: 'POST',
        url: '/api/getPepe',
        data: {
          id: pepeId,
        },
      })
    ).data as {
      pepe: Pepe;
    };

    const traits = await Promise.all(
      pepe.traits.map(async (trait) => {
        if ((trait as any).imageUrl) {
          trait.imageData = await convertImageToDataURL((trait as any).imageUrl);
        }
        return trait;
      }),
    );

    set({
      selectedPepe: pepe,
      currentStep: 0,
      steps: [
        {
          traits: pepe.traits,
        },
      ],
      traits,
    });
  },
  redo: () => {
    const { currentStep, steps } = get();

    if (currentStep >= steps.length) {
      return;
    }

    const updatedCurrentStep = currentStep + 1;

    set({
      currentStep: updatedCurrentStep,
      traits: steps[updatedCurrentStep].traits,
    });
  },
  reset: () => {
    set({ isInitialized: false });
  },
  undo: () => {
    const { currentStep, steps } = get();

    if (currentStep <= 0) {
      return;
    }

    const updatedCurrentStep = currentStep - 1;

    set({
      currentStep: updatedCurrentStep,
      traits: steps[updatedCurrentStep].traits,
    });
  },
  update: (step: Step) => {
    const { currentStep, steps } = get();

    set({
      currentStep: currentStep + 1,
      steps: steps.concat(step),
      traits: step.traits,
    });
  },
  save: async () => {
    const { selectedPepe, traits } = get();

    if (!selectedPepe) {
      return;
    }

    set({ isSaving: true });

    try {
      const formData = new FormData();
      formData.append('id', selectedPepe.id.toString());
      formData.append(
        'traits',
        JSON.stringify(
          traits.map((trait, traitIndex) => ({
            id: trait.id,
            index: traitIndex,
            optionId: trait.optionId,
          })),
        ),
      );
      traits.forEach((trait, traitIndex) => {
        if (typeof trait.imageData !== 'string') {
          return;
        }
        formData.append(`trait-${traitIndex}`, dataURLtoBlob(trait.imageData));
      });

      await axios.postForm('/api/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isSaving: false });
    }
  },
});

export const useEditorStore = create<AppState>()((...args) => ({
  ...createEditorSlice(...args),
}));
