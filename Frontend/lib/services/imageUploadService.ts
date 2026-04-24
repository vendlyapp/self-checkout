import { supabase } from '@/lib/supabase/client';

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_PRODUCTS ?? 'product';
const MAX_SIZE_MB = 5;

/**
 * Sube un archivo de imagen a Supabase Storage.
 * Retorna la URL pública del archivo subido.
 * El path es: {userId}/{timestamp}-{random}.{ext}
 */
export async function uploadProductImage(file: File, userId: string): Promise<string> {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`${file.name} ist zu gross. Maximum ${MAX_SIZE_MB}MB`);
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Fehler beim Hochladen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
