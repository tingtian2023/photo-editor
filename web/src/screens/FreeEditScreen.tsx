import { useEffect, useRef, useState } from 'react'
import { Bookmark, Trash2 } from 'lucide-react'
import ImagePicker from '../components/ImagePicker'
import { EditForm, Examples, Field } from '../components/EditForm'
import { api } from '../lib/api'
import { useImageEdit } from '../lib/useImageEdit'

const EXAMPLES = [
  'Make the lighting look like golden hour sunset',
  'Add a soft drop shadow beneath the product',
  'Turn the background into a blurred bokeh effect',
  'Remove the shadow under the product',
  'Make the colours more vibrant and saturated',
]

export default function FreeEditScreen() {
  const edit = useImageEdit()
  const [prompt, setPrompt] = useState('')
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    api.getPrompts().then(setSaved)
  }, [])

  function submit() {
    const problem = !edit.input ? 'Select an image first.' : !prompt.trim() ? 'Enter an instruction.' : null
    edit.run(problem, () => api.freeEdit(edit.input!.b64, prompt))
  }

  async function bookmark() {
    const name = prompt.slice(0, 30).trim()
    if (!name) return setNotice('Enter a prompt first.')
    await api.savePrompt(name, prompt)
    setSaved(await api.getPrompts())
    setNotice(`Saved as "${name}"`)
  }

  async function remove(name: string) {
    await api.deletePrompt(name)
    setSaved(await api.getPrompts())
  }

  return (
    <EditForm edit={edit} submitLabel="Apply Edit" onSubmit={submit}>
      <ImagePicker image={edit.input} onPick={edit.setInput} />
      <Field
        label="Instruction"
        action={
          <button type="button" className="link link-primary font-normal" onClick={() => dialogRef.current?.showModal()}>
            Saved prompts
          </button>
        }
      >
        <textarea
          className="textarea w-full"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to change…"
        />
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-ghost btn-sm text-primary" onClick={bookmark}>
            <Bookmark className="size-4" /> Bookmark prompt
          </button>
          {notice && <span className="text-sm text-base-content/60">{notice}</span>}
        </div>
      </Field>
      <Examples items={EXAMPLES} onPick={setPrompt} />

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Saved Prompts</h3>
          {Object.keys(saved).length === 0 ? (
            <p className="py-4 text-base-content/60">No saved prompts yet.</p>
          ) : (
            <ul className="list">
              {Object.entries(saved).map(([name, text]) => (
                <li key={name} className="list-row items-center">
                  <button
                    type="button"
                    className="list-col-grow min-w-0 text-left"
                    onClick={() => {
                      setPrompt(text)
                      dialogRef.current?.close()
                    }}
                  >
                    <div className="font-semibold">{name}</div>
                    <div className="truncate text-sm text-base-content/60">{text}</div>
                  </button>
                  <button type="button" className="btn btn-ghost btn-square btn-sm text-error" onClick={() => remove(name)} aria-label={`Delete ${name}`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="modal-action">
            <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </EditForm>
  )
}
