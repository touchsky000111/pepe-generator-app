import { Filter } from '@/stores/pepe';

export default function getQueryString(query: {
  filters: Filter[];
  page: string | number | null;
  limit: string | number | null;
  hash?: string | null;
}) {
  const parts = [];

  if (query.filters.length) {
    const filtersQuery = query.filters
      .map((filter) => `${filter.traitId}:${filter.traitOptionId}`)
      .join(',');
    parts.push(`filter=${filtersQuery}`);
  }
  if (query.page) {
    parts.push(`page=${query.page}`);
  }
  if (query.limit) {
    parts.push(`limit=${query.limit}`);
  }
  if (query.hash) {
    parts.push(`limit=${query.hash}`);
  }

  return `?${parts.join('&')}`;
}
