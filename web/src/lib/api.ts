import { clearToken, getServerUrl, getToken, normalizeServerUrl } from './auth'

export type ApiResult = { image: string | null; status: string }

// Every request carries the access code. A 401 clears the stored code,
// which sends the user back to the access-code screen.
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${getServerUrl()}/${path}`, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), 'X-App-Token': getToken() },
  })
  if (response.status === 401) clearToken()
  return response
}

async function post(endpoint: string, fields: Record<string, string>): Promise<ApiResult> {
  try {
    const response = await authFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (!response.ok) {
      return { image: null, status: `Server error ${response.status}: ${await response.text()}` }
    }
    return await response.json()
  } catch (e) {
    return { image: null, status: `Network error: ${(e as Error).message}` }
  }
}

/** Checks a candidate access code against a server without storing it. */
export async function checkToken(code: string, serverUrl: string): Promise<'ok' | 'invalid' | 'network'> {
  try {
    const res = await fetch(`${normalizeServerUrl(serverUrl)}/auth/check`, {
      headers: { 'X-App-Token': code },
    })
    if (res.ok) return 'ok'
    return res.status === 401 ? 'invalid' : 'network'
  } catch {
    return 'network'
  }
}

export const api = {
  freeEdit: (image: string, prompt: string) => post('edit', { image, prompt }),
  swapBackground: (image: string, description: string) => post('background', { image, description }),
  addLifestyle: (image: string, description: string) => post('lifestyle', { image, description }),
  shotStyle: (image: string, style: string, details: string) => post('shot-style', { image, style, details }),
  enhance: (image: string, style: string) => post('enhance', { image, style }),
  addText: (image: string, text: string, position: string, fontSize: number, textColor: string, bgOpacity: number) =>
    post('add-text', {
      image,
      text,
      position,
      font_size: String(fontSize),
      text_color: textColor,
      bg_opacity: String(bgOpacity),
    }),
  removeText: (image: string) => post('remove-text', { image }),
  crop: (image: string, top: number, bottom: number, left: number, right: number) =>
    post('crop', { image, top: String(top), bottom: String(bottom), left: String(left), right: String(right) }),
  replaceModel: (image: string, description: string) => post('replace-model', { image, description }),
  removeProp: (image: string, description: string) => post('remove-prop', { image, description }),
  changeClothing: (image: string, item: string, replacement: string) =>
    post('change-clothing', { image, item, replacement }),
  combineImages: (image1: string, image2: string, mode: string, description: string) =>
    post('combine', { image1, image2, mode, description }),

  getPrompts: async (): Promise<Record<string, string>> => {
    try {
      const res = await authFetch('prompts')
      return res.ok ? await res.json() : {}
    } catch {
      return {}
    }
  },
  savePrompt: async (name: string, prompt: string) => {
    await authFetch('prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, prompt }),
    })
  },
  deletePrompt: async (name: string) => {
    await authFetch(`prompts/${encodeURIComponent(name)}`, { method: 'DELETE' })
  },
}
