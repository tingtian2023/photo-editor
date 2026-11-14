import { useState } from 'react'
import ImagePicker from '../components/ImagePicker'
import { EditForm, Examples, Field } from '../components/EditForm'
import type { ApiResult } from '../lib/api'
import { useImageEdit } from '../lib/useImageEdit'

export type DescribeConfig = {
  label: string
  placeholder: string
  examples: string[]
  submitLabel: string
  missingMessage: string
  multiline?: boolean
  call: (image: string, description: string) => Promise<ApiResult>
}

/** One image + one description: Background Swap, Lifestyle, Replace Model, Remove Prop. */
export default function DescribeScreen({ config }: { config: DescribeConfig }) {
  const edit = useImageEdit()
  const [description, setDescription] = useState('')

  function submit() {
    const problem = !edit.input
      ? 'Select an image first.'
      : !description.trim()
        ? config.missingMessage
        : null
    edit.run(problem, () => config.call(edit.input!.b64, description))
  }

  return (
    <EditForm edit={edit} submitLabel={config.submitLabel} onSubmit={submit}>
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field label={config.label}>
        {config.multiline === false ? (
          <input
            className="input w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={config.placeholder}
          />
        ) : (
          <textarea
            className="textarea w-full"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={config.placeholder}
          />
        )}
      </Field>
      <Examples items={config.examples} onPick={setDescription} />
    </EditForm>
  )
}
