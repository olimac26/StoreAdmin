'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/product';
import { API, apiFetch } from '@/lib/api';

interface UseCategariesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export function useCategories() {
  const [state, setState] = useState<UseCategariesState>({
    categories: [],
    loading: true,
    error: null,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await apiFetch<{ success: boolean; data: Category[] }>(
          API.ENDPOINTS.CATEGORIES,
        );
        setState((prev) => ({
          ...prev,
          categories: response.data || [],
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Error fetching categories',
          loading: false,
        }));
      }
    };

    fetchCategories();
  }, []);

  const create = useCallback(async (name: string, description?: string) => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: { id: number };
      }>(API.ENDPOINTS.CATEGORIES, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });

      if (response.success) {
        // Refetch categories to get the new one with all data
        const categoriesResponse = await apiFetch<{
          success: boolean;
          data: Category[];
        }>(API.ENDPOINTS.CATEGORIES);
        setState((prev) => ({
          ...prev,
          categories: categoriesResponse.data || [],
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error creating category',
      }));
    }
  }, []);

  const update = useCallback(
    async (id: number, name: string, description?: string) => {
      try {
        const response = await apiFetch<{ success: boolean }>(
          API.ENDPOINTS.CATEGORY(id),
          {
            method: 'PUT',
            body: JSON.stringify({ name, description }),
          },
        );

        if (response.success) {
          // Refetch to ensure data is consistent
          const categoriesResponse = await apiFetch<{
            success: boolean;
            data: Category[];
          }>(API.ENDPOINTS.CATEGORIES);
          setState((prev) => ({
            ...prev,
            categories: categoriesResponse.data || [],
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Error updating category',
        }));
      }
    },
    [],
  );

  const remove = useCallback(async (id: number) => {
    try {
      const response = await apiFetch<{ success: boolean }>(
        API.ENDPOINTS.CATEGORY(id),
        {
          method: 'DELETE',
        },
      );

      if (response.success) {
        setState((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== id),
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error deleting category',
      }));
    }
  }, []);

  return {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    create,
    update,
    remove,
  };
}
