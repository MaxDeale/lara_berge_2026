import sharp from 'sharp'
import { MAX_REFERENCE_BYTES, MAX_REFERENCES } from './commission'

const MAX_EDGE = 2400

export type ProcessedImage = { buffer: Buffer; filename: string }

/**
 * Checks and normalises commission reference photos on the server: images only, at most 5,
 * at most 10 MB each, resized to 2400px on the long edge and re-encoded as JPEG. Re-encoding
 * drops EXIF, so the GPS location in a phone photo never reaches Lara's dataset.
 */
export async function processReferenceImages(
  files: File[],
): Promise<ProcessedImage[] | { error: string }> {
  const real = files.filter((f) => f.size > 0)
  if (real.length > MAX_REFERENCES)
    return { error: `Please choose up to ${MAX_REFERENCES} images.` }

  const out: ProcessedImage[] = []
  for (const [i, file] of real.entries()) {
    if (file.size > MAX_REFERENCE_BYTES) return { error: 'Each image needs to be under 10 MB.' }
    try {
      const input = Buffer.from(await file.arrayBuffer())
      const meta = await sharp(input).metadata()
      if (
        !meta.format ||
        !['jpeg', 'png', 'webp', 'gif', 'heif', 'avif', 'tiff'].includes(meta.format)
      ) {
        return { error: 'Only image files, please.' }
      }
      const buffer = await sharp(input, { failOn: 'error' })
        .rotate() // respect the phone's orientation before EXIF is dropped
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer()
      out.push({ buffer, filename: `reference-${i + 1}.jpg` })
    } catch {
      return { error: `We couldn't read "${file.name}". Could you try a JPEG or PNG?` }
    }
  }
  return out
}
