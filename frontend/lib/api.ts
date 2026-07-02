// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Categories
    CATEGORIES: '/api/categories',
    CATEGORY: (id: number) => `/api/categories/${id}`,

    // Products
    PRODUCTS: '/api/products',
    PRODUCT: (id: number) => `/api/products/${id}`,

    // Health
    HEALTH: '/api/health',
  },
};

// Fetch wrapper with error handling
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API.BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
