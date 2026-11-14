import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { saveImage } from '../lib/image'
import type { ImageEdit } from '../lib/useImageEdit'

/** Page wrapper for an edit screen: children, the submit button, then the result. */
export function EditForm({
  edit,
  submitLabel,
  onSubmit,
  children,
}: {
  edit: ImageEdit
  submitLabel: string
  onSubmit: () => void
  children: ReactNode
}) {
  return (
    <form
      className="mx-auto max-w-xl space-y-4 p-4 pb-10"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {children}
      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={edit.loading}>
        {edit.loading && <span className="loading loading-spinner" />}
        {submitLabel}
      </button>
      <Result edit={edit} />
    </form>
  )
}

function Result({ edit }: { edit: ImageEdit }) {
  if (edit.loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-base-content/60">
        <span className="loading loading-dots loading-lg text-primary" />
        Processing with AI…
      </div>
    )
  }
  if (!edit.status && !edit.result) return null
  return (
    <div className="space-y-3">
      <div className="divider my-0" />
      {edit.status && (
        <div role="alert" className={`alert ${edit.isError ? 'alert-error' : 'alert-soft'}`}>
          <span>{edit.status}</span>
        </div>
      )}
      {edit.result && (
        <>
          <img
            src={`data:image/png;base64,${edit.result}`}
            alt="Result"
            className="max-h-[70vh] w-full rounded-box bg-base-200 object-contain"
          />
          <button type="button" className="btn btn-secondary btn-block" onClick={() => saveImage(edit.result!)}>
            <Download className="size-4" /> Save Image
          </button>
        </>
      )}
    </div>
  )
}

/** Labelled form field. */
export function Field({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend flex w-full justify-between">
        <span>{label}</span>
        {action}
      </legend>
      {children}
    </fieldset>
  )
}

/** Tap-to-fill example chips. */
export function Examples({ items, onPick }: { items: string[]; onPick: (value: string) => void }) {
  return (
    <Field label="Examples">
      <div className="flex flex-wrap gap-2">
        {items.map((e) => (
          <button key={e} type="button" className="btn btn-sm btn-soft h-auto max-w-full whitespace-normal py-1.5 text-left font-normal" onClick={() => onPick(e)}>
            {e}
          </button>
        ))}
      </div>
    </Field>
  )
}

/** Radio-card list used by Enhance and Product Shots. */
export function OptionCards({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: string; desc: string }[]
  value: string
  onChange: (v: string) => void
  name: string
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex cursor-pointer items-center gap-3 rounded-box border-2 p-3 ${value === o.value ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'}`}
        >
          <input
            type="radio"
            name={name}
            className="radio radio-primary radio-sm"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>
            <span className="block font-semibold">{o.value}</span>
            <span className="block text-sm text-base-content/60">{o.desc}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
