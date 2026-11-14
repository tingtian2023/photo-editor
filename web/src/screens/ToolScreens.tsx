import { useState } from 'react'
import { Info } from 'lucide-react'
import ImagePicker from '../components/ImagePicker'
import { EditForm, Field } from '../components/EditForm'
import { api } from '../lib/api'
import type { PickedImage } from '../lib/image'
import { useImageEdit } from '../lib/useImageEdit'

// ── Add Text ────────────────────────────────────────────────────────────────

const POSITIONS = ['Top Left', 'Top Center', 'Top Right', 'Center', 'Bottom Left', 'Bottom Center', 'Bottom Right']

// Labels must match the colour names backend/main.py accepts.
const COLORS = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Black', hex: '#000000' },
  { label: 'Red', hex: '#DC1E1E' },
  { label: 'Yellow', hex: '#FFD700' },
  { label: 'Blue', hex: '#1464DC' },
]

export function AddTextScreen() {
  const edit = useImageEdit()
  const [text, setText] = useState('')
  const [position, setPosition] = useState('Bottom Center')
  const [fontSize, setFontSize] = useState(42)
  const [textColor, setTextColor] = useState('White')
  const [bgOpacity, setBgOpacity] = useState(55)

  function submit() {
    const problem = !edit.input ? 'Select an image first.' : !text.trim() ? 'Enter some text.' : null
    edit.run(problem, () => api.addText(edit.input!.b64, text, position, fontSize, textColor, bgOpacity))
  }

  return (
    <EditForm edit={edit} submitLabel="Add Text" onSubmit={submit}>
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field label="Text">
        <input className="input w-full" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. SALE 50% OFF" />
      </Field>
      <Field label="Position">
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${position === p ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPosition(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <Field label={`Font size: ${fontSize}px`}>
        <input
          type="range"
          className="range range-primary w-full"
          min={12}
          max={120}
          step={2}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </Field>
      <Field label={`Text colour: ${textColor}`}>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              aria-label={c.label}
              onClick={() => setTextColor(c.label)}
              style={{ backgroundColor: c.hex }}
              className={`size-11 rounded-full border border-base-300 ${textColor === c.label ? 'ring-4 ring-primary ring-offset-2 ring-offset-base-100' : ''}`}
            />
          ))}
        </div>
      </Field>
      <Field label={`Background strip opacity: ${bgOpacity}%`}>
        <input
          type="range"
          className="range range-primary w-full"
          min={0}
          max={100}
          step={5}
          value={bgOpacity}
          onChange={(e) => setBgOpacity(Number(e.target.value))}
        />
      </Field>
    </EditForm>
  )
}

// ── Remove Watermarks ───────────────────────────────────────────────────────

export function RemoveTextScreen() {
  const edit = useImageEdit()
  return (
    <EditForm
      edit={edit}
      submitLabel="Remove Text & Watermarks"
      onSubmit={() => edit.run(edit.input ? null : 'Select an image first.', () => api.removeText(edit.input!.b64))}
    >
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <div role="alert" className="alert alert-info alert-soft">
        <Info className="size-5" />
        <span>Works best when text overlays a consistent background.</span>
      </div>
    </EditForm>
  )
}

// ── Crop / Trim ─────────────────────────────────────────────────────────────

export function CropScreen() {
  const edit = useImageEdit()
  const [crop, setCrop] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const sides = ['top', 'bottom', 'left', 'right'] as const

  return (
    <EditForm
      edit={edit}
      submitLabel="Crop Image"
      onSubmit={() =>
        edit.run(edit.input ? null : 'Select an image first.', () =>
          api.crop(edit.input!.b64, crop.top, crop.bottom, crop.left, crop.right),
        )
      }
    >
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <p className="text-sm text-base-content/60">Enter how many pixels to trim from each edge.</p>
      <Field
        label="Crop amounts (px)"
        action={
          <button type="button" className="link link-primary font-normal" onClick={() => setCrop({ top: 0, bottom: 0, left: 0, right: 0 })}>
            Reset all to 0
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {sides.map((side) => (
            <label key={side} className="input w-full">
              <span className="label w-14 capitalize">{side}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={10}
                value={crop[side]}
                onChange={(e) => setCrop({ ...crop, [side]: Math.max(0, parseInt(e.target.value) || 0) })}
              />
            </label>
          ))}
        </div>
      </Field>
    </EditForm>
  )
}

// ── Change Clothing ─────────────────────────────────────────────────────────

const CLOTHING_EXAMPLES: [string, string][] = [
  ['shirt', 'oversized cream linen shirt'],
  ['jacket', 'black leather biker jacket'],
  ['dress', 'floral midi dress in pastel pink'],
  ['trousers', 'slim-fit dark navy chinos'],
]

export function ChangeClothingScreen() {
  const edit = useImageEdit()
  const [item, setItem] = useState('')
  const [replacement, setReplacement] = useState('')

  function submit() {
    const problem = !edit.input
      ? 'Select a photo first.'
      : !item.trim()
        ? 'Specify the clothing item to change.'
        : !replacement.trim()
          ? 'Describe the replacement garment.'
          : null
    edit.run(problem, () => api.changeClothing(edit.input!.b64, item, replacement))
  }

  return (
    <EditForm edit={edit} submitLabel="Change Clothing" onSubmit={submit}>
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field label="Item to change">
        <input className="input w-full" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. shirt, jacket, trousers, dress" />
      </Field>
      <Field label="Replace with">
        <input className="input w-full" value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="e.g. oversized white linen shirt" />
      </Field>
      <Field label="Examples (tap to fill)">
        <div className="flex flex-wrap gap-2">
          {CLOTHING_EXAMPLES.map(([i, r]) => (
            <button
              key={i}
              type="button"
              className="btn btn-sm btn-soft h-auto max-w-full whitespace-normal py-1.5 text-left font-normal"
              onClick={() => {
                setItem(i)
                setReplacement(r)
              }}
            >
              <b>{i}</b> → {r}
            </button>
          ))}
        </div>
      </Field>
    </EditForm>
  )
}

// ── Combine Images ──────────────────────────────────────────────────────────

const MODES = [
  { key: 'side-by-side', label: 'Side by Side' },
  { key: 'top-bottom', label: 'Top / Bottom' },
  { key: 'ai', label: 'AI Blend' },
]

export function CombineImagesScreen() {
  const edit = useImageEdit()
  const [img1, setImg1] = useState<PickedImage | null>(null)
  const [img2, setImg2] = useState<PickedImage | null>(null)
  const [mode, setMode] = useState('side-by-side')
  const [description, setDescription] = useState('')

  function submit() {
    const problem = !img1
      ? 'Select Image 1 first.'
      : !img2
        ? 'Select Image 2 first.'
        : mode === 'ai' && !description.trim()
          ? 'Enter a description for AI Blend.'
          : null
    edit.run(problem, () => api.combineImages(img1!.b64, img2!.b64, mode, description))
  }

  return (
    <EditForm edit={edit} submitLabel="Combine" onSubmit={submit}>
      <Field label="Pick two images">
        <div className="grid grid-cols-2 gap-3">
          <ImagePicker compact image={img1} onPick={setImg1} label="Image 1" />
          <ImagePicker compact image={img2} onPick={setImg2} label="Image 2" />
        </div>
      </Field>
      <Field label="Layout">
        <div className="join w-full">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`btn join-item flex-1 ${mode === m.key ? 'btn-primary' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Field>
      {mode === 'ai' && (
        <Field label="Describe the blend">
          <textarea
            className="textarea w-full"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Place the person from image 1 into the background of image 2"
          />
        </Field>
      )}
    </EditForm>
  )
}
