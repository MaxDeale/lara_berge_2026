'use client'

const MAX_EDGE = 1800

/**
 * Shrinks a photo in the browser before upload, so five phone photos fit under the 4.5 MB
 * request limit. Anything the browser can't decode (e.g. HEIC outside Safari) is sent as-is.
 */
export async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size === 0) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 900_000) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    )
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}
