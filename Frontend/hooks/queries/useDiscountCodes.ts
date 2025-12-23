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
  });
};

export const useDiscountCodeStats = () => {
  return useQuery({
    queryKey: ['discountCodeStats'],
    queryFn: async () => {
      return await discountCodeService.getStats();
    },
  });
};

export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeRequest) => discountCodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
      queryClient.invalidateQueries({ queryKey: ['discountCodeStats'] });
      toast.success('Código de descuento creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el código de descuento');
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
      toast.success('Código de descuento actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el código de descuento');
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
      toast.success('Código de descuento archivado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al archivar el código de descuento');
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
  });
};

export const useValidateDiscountCode = () => {
  return useMutation({
    mutationFn: (code: string) => discountCodeService.validateCode(code),
    onError: (error: Error) => {
      toast.error(error.message || 'Código de descuento inválido');
    },
  });
};

