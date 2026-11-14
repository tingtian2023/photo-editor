export type PickedImage = { url: string; b64: string }

const MAX_SIDE = 2048

/**
 * Reads a picked file, scales it down so the longest side is at most 2048 px,
 * and returns a preview URL plus raw base64 (no data: prefix) for the API.
 * Phone photos are often 12+ MP; shrinking keeps uploads fast over the tunnel.
 */
export async function readImage(file: File): Promise<PickedImage> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  return { url: dataUrl, b64: dataUrl.slice(dataUrl.indexOf(',') + 1) }
}

/**
 * Saves a base64 PNG. On phones and tablets, opens the share sheet (which offers
 * "Save image"); on desktop, downloads the file.
 */
export async function saveImage(b64: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'image/png' })
  const filename = `photo-editor-${Date.now()}.png`
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.maxTouchPoints > 0 && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return // user closed the share sheet
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
