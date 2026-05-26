import { useState, useEffect, useCallback } from 'react';
import { PaginatedResponse } from '@/lib/types';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface UseTableOptions {
  endpoint: string;
  defaultParams?: Record<string, string | number>;
}

export function useTable<T>({ endpoint, defaultParams = {} }: UseTableOptions) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 20, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, string | number>>({ page: 1, per_page: 20, ...defaultParams });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<T>>(endpoint, { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke data ini');
      } else if (e?.response?.status !== 401) {
        toast.error('Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => { fetch(); }, [fetch]);

  const setParam = (key: string, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const setPage = (page: number) => setParam('page', page);
  const setPerPage = (perPage: number) => setParam('per_page', perPage);
  const setSearch = (search: string) => setParam('search', search);

  return { data, meta, loading, params, setParam, setPage, setPerPage, setSearch, refresh: fetch };
}
