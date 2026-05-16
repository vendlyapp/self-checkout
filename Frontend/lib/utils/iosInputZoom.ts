/** Safari iOS hace zoom si font-size del input < 16px; a veces no revierte al blur. */
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isWebkit = /WebKit/.test(ua)
  const isChromeIos = /CriOS/.test(ua)
  return isIOS && isWebkit && !isChromeIos
}

/** Tras blur, fuerza viewport a escala 1 para quitar zoom residual en iOS. */
export function resetIosViewportZoom(): void {
  if (!isIosSafari() || typeof document === 'undefined') return
  const meta = document.querySelector('meta[name="viewport"]')
  if (!meta) return
  const base =
    meta.getAttribute('content') ??
    'width=device-width, initial-scale=1, viewport-fit=cover'
  const locked = base.includes('maximum-scale')
    ? base
    : `${base}, maximum-scale=1`
  meta.setAttribute('content', locked)
  requestAnimationFrame(() => {
    meta.setAttribute('content', base)
  })
}
