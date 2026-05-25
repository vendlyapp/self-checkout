'use client';

import { useMutation } from '@tanstack/react-query';
import {
  createStorefrontOrder,
  confirmStorefrontPayment,
  createStorefrontInvoice,
  getStorefrontOrderQR,
  type CreateStorefrontOrderInput,
  type StorefrontOrderReceipt,
  type StorefrontInvoiceCustomer,
} from '@/lib/services/storefrontApi';

/**
 * Creates an order via the buyer-safe storefront API.
 *
 * Key differences from the admin useCreateOrder:
 * - No `price` is sent per item — prices are always computed server-side.
 * - No `total` is sent — the server re-computes it from DB prices.
 * - No `storeId` is sent — the store is resolved from the URL slug.
 * - Returns `publicOrderToken` (not the internal order UUID).
 */
export function useStorefrontCreateOrder() {
  return useMutation<StorefrontOrderReceipt, Error, CreateStorefrontOrderInput>({
    mutationFn: createStorefrontOrder,
  });
}

/**
 * Confirms a QR-Rechnung payment from the buyer side using the one-time token.
 */
export function useStorefrontConfirmPayment() {
  return useMutation<
    { publicOrderToken: string; status: string; confirmedAt: string },
    Error,
    { publicOrderToken: string; confirmToken: string }
  >({
    mutationFn: ({ publicOrderToken, confirmToken }) =>
      confirmStorefrontPayment(publicOrderToken, confirmToken),
  });
}

/**
 * Creates a buyer invoice linked to a storefront order via its publicOrderToken.
 */
export function useStorefrontCreateInvoice() {
  return useMutation<
    { shareToken: string; invoiceNumber: string },
    Error,
    { publicOrderToken: string; customer?: StorefrontInvoiceCustomer }
  >({
    mutationFn: ({ publicOrderToken, customer }) =>
      createStorefrontInvoice(publicOrderToken, customer),
  });
}

/**
 * Fetches the QR code SVG for a QR-Rechnung order using publicOrderToken.
 */
export function useStorefrontOrderQR() {
  return useMutation({
    mutationFn: (publicOrderToken: string) => getStorefrontOrderQR(publicOrderToken),
  });
}
