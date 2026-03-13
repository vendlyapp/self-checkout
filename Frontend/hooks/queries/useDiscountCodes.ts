import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountCodeService, type DiscountCode, type CreateDiscountCodeRequest, type UpdateDiscountCodeRequest } from '@/lib/services/discountCodeService';
import { toast } from 'sonner';

export const useDiscountCodes = () => {
  return useQuery({
    queryKey: ['discountCodes'],
    queryFn: async () => {
      const codes = await discountCodeService.getAll();
      return codes;
    },
    staleTime: 2 * 60 * 1000, // 2 min — mutations (create/update/archive) invalidate the cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useDiscountCode = (id: string | null) => {
  return useQuery({
    queryKey: ['discountCode', id],
    queryFn: async () => {
      if (!id) return null;
      return await discountCodeService.getById(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDiscountCodeStats = () => {
  return useQuery({
    queryKey: ['discountCodeStats'],
    queryFn: async () => {
      return await discountCodeService.getStats();
    },
    staleTime: 2 * 60 * 1000, // 2 min — invalidated by mutations
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeRequest) => discountCodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
      queryClient.invalidateQueries({ queryKey: ['discountCodeStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
      queryClient.invalidateQueries({ queryKey: ['discountCode', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['discountCodeStats'] });
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
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
      queryClient.invalidateQueries({ queryKey: ['archivedDiscountCodes'] });
      queryClient.invalidateQueries({ queryKey: ['discountCodeStats'] });
      toast.success('Rabattcode erfolgreich archiviert');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Archivieren des Rabattcodes');
    },
  });
};

// Mantener useDeleteDiscountCode para compatibilidad (pero ahora archiva)
export const useDeleteDiscountCode = useArchiveDiscountCode;

export const useArchivedDiscountCodes = () => {
  return useQuery({
    queryKey: ['archivedDiscountCodes'],
    queryFn: async () => {
      const codes = await discountCodeService.getArchived();
      return codes;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

