import { useRef, useState } from 'react'
import { Camera, ImagePlus, Images } from 'lucide-react'
import { readImage, type PickedImage } from '../lib/image'

type Props = {
  image: PickedImage | null
  onPick: (img: PickedImage) => void
  label?: string
  compact?: boolean
}

export default function ImagePicker({ image, onPick, label = 'Tap to select an image', compact = false }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    try {
      setError('')
      onPick(await readImage(file))
    } catch {
      setError('Could not read that image. Try a different photo.')
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        className={`flex w-full items-center justify-center overflow-hidden rounded-box border-2 border-dashed border-base-300 bg-base-200 ${compact ? 'aspect-square' : 'h-56'}`}
      >
        {image ? (
          <img src={image.url} alt="Selected" className="h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-base-content/50">
            <ImagePlus className="size-10" />
            <span className="text-sm">{label}</span>
          </span>
        )}
      </button>
      {!compact && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-primary" onClick={() => galleryRef.current?.click()}>
            <Images className="size-4" /> Gallery
          </button>
          <button type="button" className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
            <Camera className="size-4" /> Camera
          </button>
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
    </div>
  )
}
