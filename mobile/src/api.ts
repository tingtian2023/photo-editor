import { API_BASE_URL } from './config';

type ApiResult = { image: string | null; status: string };

async function post(endpoint: string, fields: Record<string, string>): Promise<ApiResult> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const imageLen = fields.image?.length ?? 0;
  console.log(`[API] POST ${url} | image b64 length: ${imageLen} | fields: ${Object.keys(fields).filter(k => k !== 'image').join(', ')}`);
  try {
    const body = JSON.stringify(fields);
    console.log(`[API] Sending request, body size: ${body.length} bytes`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    console.log(`[API] Response status: ${response.status}`);
    if (!response.ok) {
      const text = await response.text();
      console.log(`[API] Error body: ${text.slice(0, 300)}`);
      return { image: null, status: `Server error ${response.status}: ${text}` };
    }
    const json = await response.json();
    console.log(`[API] Success | image returned: ${!!json.image} | status: ${json.status}`);
    return json;
  } catch (e: any) {
    console.log(`[API] Fetch threw: ${e.message}`);
    return { image: null, status: `Network error: ${e.message}` };
  }
}

// b64 is the raw base64 string from expo-image-picker (no data: prefix needed)
function img(b64: string, fields: Record<string, string> = {}) {
  return post(Object.keys(fields).length === 0
    ? (fields as any).__endpoint ?? 'edit'
    : (fields as any).__endpoint ?? 'edit',
    { image: b64, ...fields });
}

export const api = {
  freeEdit: (b64: string, prompt: string) =>
    post('edit', { image: b64, prompt }),

  swapBackground: (b64: string, description: string) =>
    post('background', { image: b64, description }),

  addLifestyle: (b64: string, description: string) =>
    post('lifestyle', { image: b64, description }),

  enhance: (b64: string, style: string) =>
    post('enhance', { image: b64, style }),

  addText: (
    b64: string,
    text: string,
    position: string,
    fontSize: number,
    textColor: string,
    bgOpacity: number,
  ) =>
    post('add-text', {
      image: b64, text, position,
      font_size: String(fontSize),
      text_color: textColor,
      bg_opacity: String(bgOpacity),
    }),

  removeText: (b64: string) =>
    post('remove-text', { image: b64 }),

  crop: (b64: string, top: number, bottom: number, left: number, right: number) =>
    post('crop', {
      image: b64,
      top: String(top), bottom: String(bottom),
      left: String(left), right: String(right),
    }),

  replaceModel: (b64: string, description: string) =>
    post('replace-model', { image: b64, description }),

  removeProp: (b64: string, description: string) =>
    post('remove-prop', { image: b64, description }),

  changeClothing: (b64: string, item: string, replacement: string) =>
    post('change-clothing', { image: b64, item, replacement }),

  getPrompts: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/prompts`);
      return res.json();
    } catch {
      return {};
    }
  },

  savePrompt: async (name: string, prompt: string) => {
    const res = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, prompt }),
    });
    return res.json();
  },

  deletePrompt: async (name: string) => {
    const res = await fetch(`${API_BASE_URL}/prompts/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
