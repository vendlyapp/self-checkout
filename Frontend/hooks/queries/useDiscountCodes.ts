'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountCodeService, type CreateDiscountCodeRequest, type UpdateDiscountCodeRequest } from '@/lib/services/discountCodeService';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export const useDiscountCodes = () => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.discountCodes.all(),
    enabled: !authLoading && !!session?.access_token,
    queryFn: async ({ signal }) => discountCodeService.getAll({ signal }),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export const useDiscountCode = (id: string | null) => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.discountCodes.detail(id ?? ''),
    enabled: !authLoading && !!session?.access_token && !!id,
    queryFn: async ({ signal }) => {
      if (!id) return null;
      return await discountCodeService.getById(id, { signal });
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useDiscountCodeStats = () => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.discountCodes.stats(),
    enabled: !authLoading && !!session?.access_token,
    queryFn: async ({ signal }) => discountCodeService.getStats({ signal }),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeRequest) => discountCodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.stats() });
      toast.success('Rabattcode erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen des Rabattcodes');
    },
  });
};

export const useUpdateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountCodeRequest }) =>
      discountCodeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.stats() });
      toast.success('Rabattcode erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren des Rabattcodes');
    },
  });
};

export const useArchiveDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodeService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.archived() });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.stats() });
      toast.success('Rabattcode erfolgreich archiviert');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Archivieren des Rabattcodes');
    },
  });
};

export const useDeleteDiscountCode = useArchiveDiscountCode;

export const useArchivedDiscountCodes = () => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.discountCodes.archived(),
    enabled: !authLoading && !!session?.access_token,
    queryFn: async ({ signal }) => discountCodeService.getArchived({ signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export const useValidateDiscountCode = () => {
  return useMutation({
    mutationFn: (code: string) => discountCodeService.validateCode(code),
    onError: (error: Error) => {
      toast.error(error.message || 'Ungültiger Rabattcode');
    },
  });
};
