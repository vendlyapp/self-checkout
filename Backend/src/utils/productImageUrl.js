/**
 * Product images: only Supabase Storage (or any HTTPS) URLs in PostgreSQL.
 * Base64 / data-URLs must never be stored or returned in list APIs.
 */

const STORAGE_URL_ERROR =
  'Bilder müssen über Supabase Storage hochgeladen werden (HTTPS-URL). Base64 ist nicht erlaubt.';

function isStorageOrHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const t = value.trim();
  return t.startsWith('https://') || t.startsWith('http://');
}

function isEmbeddedImage(value) {
  if (!value || typeof value !== 'string') return false;
  const t = value.trim();
  if (t.startsWith('data:image/')) return true;
  if (t.length > 500 && !isStorageOrHttpUrl(t)) return true;
  return false;
}

/** SQL expression: only read short URL strings from heap (NULL for legacy base64 until migrated). */
const IMAGE_URL_SQL_EXPR = `CASE WHEN image ~ '^https?://' THEN image ELSE NULL END AS image`;

/**
 * @param {{ image?: string | null, images?: string[] | null }} input
 * @returns {{ image: string | null, images: string[] }}
 */
function sanitizeProductImagesForDb(input = {}) {
  const cleanOne = (v) => {
    if (v == null || v === '') return null;
    if (typeof v !== 'string') {
      const err = new Error(STORAGE_URL_ERROR);
      err.statusCode = 400;
      throw err;
    }
    const t = v.trim();
    if (!t) return null;
    if (isEmbeddedImage(t)) {
      const err = new Error(STORAGE_URL_ERROR);
      err.statusCode = 400;
      throw err;
    }
    if (!isStorageOrHttpUrl(t)) {
      const err = new Error(STORAGE_URL_ERROR);
      err.statusCode = 400;
      throw err;
    }
    return t;
  };

  const rawImages = Array.isArray(input.images) ? input.images : [];
  const images = rawImages.map(cleanOne).filter(Boolean);
  const image = cleanOne(input.image) || images[0] || null;

  return {
    image,
    images: images.length > 0 ? images : image ? [image] : [],
  };
}

function toPublicImageDto(raw) {
  if (!isStorageOrHttpUrl(raw)) return null;
  return raw.trim();
}

function toPublicImagesDto(rawImages, rawImage) {
  const main = toPublicImageDto(rawImage);
  const fromArr = Array.isArray(rawImages)
    ? rawImages.map(toPublicImageDto).filter(Boolean)
    : [];
  const merged = [...fromArr];
  if (main && !merged.includes(main)) merged.unshift(main);
  return merged;
}

module.exports = {
  STORAGE_URL_ERROR,
  IMAGE_URL_SQL_EXPR,
  isStorageOrHttpUrl,
  isEmbeddedImage,
  sanitizeProductImagesForDb,
  toPublicImageDto,
  toPublicImagesDto,
};
