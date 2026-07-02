'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { API, apiFetch } from '@/lib/api';

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await apiFetch<{ success: boolean; data: Product[] }>(
          API.ENDPOINTS.PRODUCTS,
        );
        setState((prev) => ({
          ...prev,
          products: response.data || [],
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Error fetching products',
          loading: false,
        }));
      }
    };

    fetchProducts();
  }, []);

  const create = useCallback(async (data: Omit<Product, 'id'>) => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: { id: number };
      }>(API.ENDPOINTS.PRODUCTS, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        // Refetch products to get the new one with all data
        const productsResponse = await apiFetch<{
          success: boolean;
          data: Product[];
        }>(API.ENDPOINTS.PRODUCTS);
        setState((prev) => ({
          ...prev,
          products: productsResponse.data || [],
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error creating product',
      }));
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Product>) => {
    try {
      const response = await apiFetch<{ success: boolean }>(
        API.ENDPOINTS.PRODUCT(id),
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );

      if (response.success) {
        // Refetch to ensure data is consistent
        const productsResponse = await apiFetch<{
          success: boolean;
          data: Product[];
        }>(API.ENDPOINTS.PRODUCTS);
        setState((prev) => ({
          ...prev,
          products: productsResponse.data || [],
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error updating product',
      }));
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      const response = await apiFetch<{ success: boolean }>(
        API.ENDPOINTS.PRODUCT(id),
        {
          method: 'DELETE',
        },
      );

      if (response.success) {
        setState((prev) => ({
          ...prev,
          products: prev.products.filter((p) => p.id !== id),
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error deleting product',
      }));
    }
  }, []);

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    create,
    update,
    remove,
  };
}
