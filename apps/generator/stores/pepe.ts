import getQueryString from '@/utils/getQueryString';
import axios from 'axios';
import { StateCreator, create } from 'zustand';

type AppState = PepeState;

export interface Filter {
  traitId: number;
  traitOptionId: number;
}

export interface Pepe {
  id: number;
  copies: number;
  hash: string;
  imageUrl?: string;
  isApproved: boolean;
  labels: string[];
  metadata?: string;
  traits: Array<{
    id: number;
    index: number;
    optionId: number;
    folder: string;
    file: string;
    imageUrl?: string;
    name: string;
    value: string;
  }>;
}

export interface Trait {
  id: number;
  folder: string;
  name: string;
  options: Array<{
    id: number;
    createdAt: string;
    file: string;
    name: string;
  }>;
}

export interface PepeState {
  approvingIds: number[];
  setApprovingIds: (approvingIds: number[]) => void;

  currentHash: string;
  setCurrentHash: (currentHash: string) => void;

  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;

  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;

  filters: Filter[];
  setFilters: (filters: Filter[]) => void;

  hashes: string[];
  setHashes: (hashes: string[]) => void;

  labels: string[];
  setLabels: (labels: string[]) => void;

  limit: number;
  setLimit: (limit: number) => void;

  page: number;
  setPage: (page: number) => void;

  pepes: Pepe[];
  setPepes: (pepes: Pepe[]) => void;

  queryString: string;
  setQueryString: (queryString: string) => void;

  selectedIds: number[];
  setSelectedIds: (selectedIds: number[]) => void;

  traits: Trait[];
  setTraits: (traits: Trait[]) => void;

  total: number;
  setTotal: (total: number) => void;

  fetchPepes: (
    showLoader?: boolean,
    forceFilters?: Filter[],
    forceHash?: string,
    forcePage?: number,
    forceLimit?: number,
  ) => Promise<void>;
  fetchHashes: () => Promise<void>;
  fetchLabels: () => Promise<void>;
  fetchTraits: () => Promise<void>;
  reset: () => void;
}

export const createPepeSlice: StateCreator<PepeState> = (set, get) => ({
  approvingIds: [],
  setApprovingIds: (approvingIds) => set(() => ({ approvingIds })),

  currentHash: '',
  setCurrentHash: (currentHash) => set(() => ({ currentHash })),

  isFetching: false,
  setIsFetching: (isFetching) => set(() => ({ isFetching })),

  isInitialized: false,
  setIsInitialized: (isInitialized) => set(() => ({ isInitialized })),

  filters: [],
  setFilters: (filters) => set(() => ({ filters })),

  hashes: [],
  setHashes: (hashes) => set(() => ({ hashes })),

  labels: [],
  setLabels: (labels) => set(() => ({ labels })),

  limit: 100,
  setLimit: (limit) => set(() => ({ limit })),

  page: 0,
  setPage: (page) => set(() => ({ page })),

  pepes: [],
  setPepes: (pepes) => set(() => ({ pepes })),

  queryString: '',
  setQueryString: (queryString) => set(() => ({ queryString })),

  selectedIds: [],
  setSelectedIds: (selectedIds) => set(() => ({ selectedIds })),

  total: -1,
  setTotal: (total) => set(() => ({ total })),

  traits: [],
  setTraits: (traits) => set(() => ({ traits })),

  fetchPepes: async (showLoader = true, forceFilters, forceHash, forcePage, forceLimit) => {
    if (showLoader) {
      set({ isFetching: true });
    }

    const current = get();

    const currentHash = (() => {
      if (forceHash !== null) {
        set({ currentHash: forceHash });

        return forceHash;
      }

      if (current.currentHash) {
        return current.currentHash;
      }

      return '';
    })();

    const filters = (() => {
      if (forceFilters) {
        set({ filters: forceFilters });

        return forceFilters;
      }

      if (current.filters) {
        return current.filters;
      }

      return [];
    })();

    const limit = (() => {
      if (forceLimit) {
        set({ limit: forceLimit });

        return forceLimit;
      }

      if (current.limit) {
        return current.limit;
      }

      set({ limit: 100 });

      return 100;
    })();

    const page = (() => {
      if (forcePage) {
        set({ page: forcePage });

        return forcePage;
      }

      if (current.page) {
        return current.page;
      }

      set({ page: 1 });

      return 1;
    })();

    const queryString = getQueryString({
      filters,
      page,
      limit,
      hash: currentHash,
    });

    set({ queryString });

    const { pepes } = (
      await axios({
        method: 'POST',
        url: '/api/pepes',
        data: {
          hash: currentHash,
          limit,
          page,
          filters: filters.map((filter) => {
            if (filter.traitId === -1) {
              return {
                traitId: -1,
                traitOptionId: get().labels[filter.traitOptionId - 1],
              };
            }
            return filter;
          }),
        },
      })
    ).data as {
      pepes: Pepe[];
    };

    const { count } = (
      await axios({
        method: 'POST',
        url: '/api/getCount',
        data: {
          hash: currentHash,
          filters: get().filters.map((filter) => {
            if (filter.traitId === -1) {
              return {
                traitId: -1,
                traitOptionId: get().labels[filter.traitOptionId - 1],
              };
            }
            return filter;
          }),
        },
      })
    ).data as {
      count: number;
    };

    set({ pepes, isFetching: false, isInitialized: true, total: count });
  },

  fetchHashes: async () => {
    const { hashes } = (
      await axios({
        method: 'POST',
        url: '/api/hashes',
      })
    ).data as {
      hashes: string[];
    };

    set({ hashes });
  },

  fetchLabels: async () => {
    const { labels } = (
      await axios({
        method: 'POST',
        url: '/api/labels',
      })
    ).data as {
      labels: string[];
    };

    set({ labels });
  },

  fetchTraits: async () => {
    const { traits } = (
      await axios({
        method: 'POST',
        url: '/api/traits',
      })
    ).data as {
      traits: Trait[];
    };

    set({ traits });
  },

  reset: () => {
    set({ page: 0 });
  },
});

export const usePepeStore = create<AppState>()((...args) => ({
  ...createPepeSlice(...args),
}));
