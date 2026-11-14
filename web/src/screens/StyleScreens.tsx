import { useState } from 'react'
import ImagePicker from '../components/ImagePicker'
import { EditForm, Field, OptionCards } from '../components/EditForm'
import { api } from '../lib/api'
import { useImageEdit } from '../lib/useImageEdit'

// Values must match ENHANCE_PROMPTS keys in backend/main.py.
const ENHANCE_STYLES = [
  { value: 'Professional studio', desc: 'Sharp details, perfect lighting, clean neutral background' },
  { value: 'Bright & clean', desc: 'Brighter, more vibrant, noise and blur removed' },
  { value: 'Luxury / premium', desc: 'Elegant lighting, rich colours, high-end feel' },
  { value: 'Warm & natural', desc: 'Warm tones, soft natural light, approachable look' },
]

export function EnhanceScreen() {
  const edit = useImageEdit()
  const [style, setStyle] = useState(ENHANCE_STYLES[0].value)

  return (
    <EditForm
      edit={edit}
      submitLabel="Enhance Image"
      onSubmit={() => edit.run(edit.input ? null : 'Select an image first.', () => api.enhance(edit.input!.b64, style))}
    >
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field label="Enhancement style">
        <OptionCards name="enhance-style" options={ENHANCE_STYLES} value={style} onChange={setStyle} />
      </Field>
    </EditForm>
  )
}

// Values must match SHOT_STYLE_PROMPTS keys in backend/main.py.
const SHOT_STYLES = [
  {
    value: 'White background',
    desc: 'Plain white, marketplace-style (e.g. Amazon). Clean and distraction-free.',
    placeholder: 'Optional, e.g. "slight angle, soft shadow"',
  },
  {
    value: 'Lifestyle',
    desc: 'Product in use or in context, so shoppers can judge size and picture it in their lives.',
    placeholder: 'Optional, e.g. "on a kitchen counter in morning light"',
  },
  {
    value: 'Packaging',
    desc: 'Shows how the product is packaged, to set expectations.',
    placeholder: 'Optional, e.g. "kraft paper box with tissue paper"',
  },
  {
    value: 'Close-up',
    desc: 'Zoomed-in detail shot that highlights features and quality.',
    placeholder: 'Optional, e.g. "focus on the stitching"',
  },
  {
    value: 'Group shot',
    desc: 'With other variants or complementary products. Good for bundles, upselling and cross-selling.',
    placeholder: 'Optional, e.g. "in red, blue and green" or "with matching mug"',
  },
]

export function ProductShotsScreen() {
  const edit = useImageEdit()
  const [style, setStyle] = useState(SHOT_STYLES[0].value)
  const [details, setDetails] = useState('')
  const current = SHOT_STYLES.find((s) => s.value === style) ?? SHOT_STYLES[0]

  return (
    <EditForm
      edit={edit}
      submitLabel="Create Shot"
      onSubmit={() =>
        edit.run(edit.input ? null : 'Select an image first.', () => api.shotStyle(edit.input!.b64, style, details))
      }
    >
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field label="Shot style">
        <OptionCards name="shot-style" options={SHOT_STYLES} value={style} onChange={setStyle} />
      </Field>
      <Field label="Details">
        <textarea
          className="textarea w-full"
          rows={2}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={current.placeholder}
        />
      </Field>
    </EditForm>
  )
}
