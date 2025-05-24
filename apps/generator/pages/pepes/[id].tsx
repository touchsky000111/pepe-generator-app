import { PepeDialog } from '@/dialogs/PepeDialog';
import { useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';

const PepePage: FC = () => {
  const { query } = useRouter();

  const page = usePepeStore((state) => state.page);

  const setFilters = usePepeStore((state) => state.setFilters);

  const traits = usePepeStore((state) => state.traits);

  const fetchPepe = useEditorStore((state) => state.fetchPepe);
  const fetchPepes = usePepeStore((state) => state.fetchPepes);
  const fetchTraits = usePepeStore((state) => state.fetchTraits);

  const setPepeId = useEditorStore((state) => state.setPepeId);

  const [title, setTitle] = useState('Pepe Generator');

  useEffect(() => {
    setPepeId(query.id ? Number(query.id) : 0);
    setTitle(query.id ? `Pepe #${query.id} | Pepe Generator` : 'Pepe Generator');
  }, [query]);

  useEffect(() => {
    if (!query.id) {
      return;
    }
    fetchPepe(Number(query.id));
  }, [fetchPepe, query]);

  useEffect(() => {
    if (!traits.length) {
      return;
    }

    if (query.filter || query.hash || query.page || query.limit) {
      fetchPepes(
        true,
        (query.filter as string)?.split(',').map((filter) => {
          const f = filter.split(':');
          return {
            traitId: Number(f[0]),
            traitOptionId: Number(f[1]),
          };
        }),
        (query.hash as string) || '',
        query.page ? Number(query.page) : undefined,
        query.limit ? Number(query.limit) : undefined,
      );
    } else {
      fetchPepes(true);
    }
  }, [fetchPepes, setFilters, page, query, traits]);

  useEffect(() => {
    fetchTraits();
  }, [fetchTraits]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <PepeDialog pepeId={Number(query.id as string)} />
    </>
  );
};

export default PepePage;
