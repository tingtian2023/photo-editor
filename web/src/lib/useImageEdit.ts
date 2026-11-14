import { useState } from 'react'
import type { ApiResult } from './api'
import type { PickedImage } from './image'

/** Shared state for every edit screen: input image, result, status, loading. */
export function useImageEdit() {
  const [input, setInput] = useState<PickedImage | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  /**
   * Runs an edit. Pass a message as `problem` to show it instead of calling
   * the API (e.g. "Select an image first.").
   */
  async function run(problem: string | null, apiFn: () => Promise<ApiResult>) {
    if (problem) {
      setStatus(problem)
      setIsError(true)
      return
    }
    setLoading(true)
    setResult(null)
    setStatus('')
    try {
      const r = await apiFn()
      setResult(r.image)
      setStatus(r.status)
      setIsError(!r.image)
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return { input, setInput, result, status, isError, loading, run }
}

export type ImageEdit = ReturnType<typeof useImageEdit>
