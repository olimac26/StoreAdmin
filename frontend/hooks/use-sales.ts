'use client';

import { useCallback, useEffect, useState } from 'react';
import { API, apiFetch } from '@/lib/api';
import {
  Sale,
  CreateSalePayload,
  UpdateSalePayload,
  ReturnSalePayload,
} from '@/types/sale';

interface UseSalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

export function useSales() {
  const [state, setState] = useState<UseSalesState>({
    sales: [],
    loading: true,
    error: null,
  });

  const fetchSales = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await apiFetch<{ success: boolean; data: Sale[] }>(
        API.ENDPOINTS.SALES,
      );
      setState((prev) => ({
        ...prev,
        sales: response.data || [],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error fetching sales',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    void fetchSales();
  }, [fetchSales]);

  const createSale = useCallback(
    async (payload: CreateSalePayload) => {
      const response = await apiFetch<{ success: boolean; data: Sale }>(
        API.ENDPOINTS.SALES,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (response.success) {
        await fetchSales();
        return response.data;
      }

      return null;
    },
    [fetchSales],
  );

  const updateSale = useCallback(
    async (id: string, payload: UpdateSalePayload) => {
      const response = await apiFetch<{ success: boolean; data: Sale }>(
        API.ENDPOINTS.ORDER(id),
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
      );

      if (response.success) {
        await fetchSales();
        return response.data;
      }

      return null;
    },
    [fetchSales],
  );

  const cancelSale = useCallback(
    async (id: string, reason?: string) => {
      const response = await apiFetch<{ success: boolean; data: Sale }>(
        `${API.ENDPOINTS.ORDER(id)}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        },
      );

      if (response.success) {
        await fetchSales();
        return response.data;
      }

      return null;
    },
    [fetchSales],
  );

  const returnSale = useCallback(
    async (id: string, payload: ReturnSalePayload) => {
      const response = await apiFetch<{ success: boolean; data: Sale }>(
        `${API.ENDPOINTS.ORDER(id)}/return`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (response.success) {
        await fetchSales();
        return response.data;
      }

      return null;
    },
    [fetchSales],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      const response = await apiFetch<{ success: boolean }>(
        API.ENDPOINTS.ORDER(id),
        {
          method: 'DELETE',
        },
      );

      if (response.success) {
        await fetchSales();
        return true;
      }

      return false;
    },
    [fetchSales],
  );

  return {
    sales: state.sales,
    loading: state.loading,
    error: state.error,
    createSale,
    updateSale,
    cancelSale,
    returnSale,
    deleteSale,
    refetch: fetchSales,
  };
}
