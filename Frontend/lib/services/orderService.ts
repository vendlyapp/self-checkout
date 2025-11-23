/**
 * Servicio de Órdenes
 * Encargado de crear órdenes en el backend utilizando la sesión de Supabase.
 */

import { API_CONFIG } from '@/lib/config/api';

export type OrderItemPayload = {
  productId: string;
  quantity: number;
  price?: number;
};

export type OrderMetadata = Record<string, unknown>;

export interface GuestCustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateOrderInput {
  items: OrderItemPayload[];
  paymentMethod?: string;
  total?: number;
  metadata?: OrderMetadata;
  storeId?: string;
  storeSlug?: string;
  customer?: GuestCustomerInfo;
}

interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  id: string;
  userId: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const getAuthContext = async (): Promise<{
  token: string | null;
  userId: string | null;
}> => {
  const { supabase } = await import('@/lib/supabase/client');
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    token: session?.access_token ?? null,
    userId: session?.user?.id ?? null,
  };
};

export const OrderService = {
  createOrder: async (input: CreateOrderInput): Promise<OrderResponse> => {
    if (!input.items || input.items.length === 0) {
      throw new Error('Tu carrito está vacío.');
    }

    const normalizedItems = input.items
      .map((item) => ({
        productId: item.productId.trim(),
        quantity: Math.max(0, Math.floor(item.quantity)),
        price: typeof item.price === 'number' ? Number(item.price) : undefined,
      }))
      .filter((item) => item.productId.length > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      throw new Error('Agrega productos válidos antes de pagar.');
    }

    const { token, userId } = await getAuthContext();

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: userId ?? undefined,
        items: normalizedItems,
        paymentMethod: input.paymentMethod,
        total: input.total,
        metadata: input.metadata,
        storeId: input.storeId,
        storeSlug: input.storeSlug,
        customer: input.customer,
      }),
    });

    const payload = (await response.json()) as ApiResponse<OrderResponse>;

    if (!response.ok || !payload.success || !payload.data) {
      const apiMessage = payload.error || payload.message;
      throw new Error(apiMessage || `Error ${response.status} al crear la orden.`);
    }

    return payload.data;
  },
};


