import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

type ApiResult = { image: string | null; status: string };

export function useImageEdit() {
  const [inputUri, setInputUri] = useState<string | null>(null);
  const [inputB64, setInputB64] = useState<string | null>(null);
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function setInput(uri: string, b64: string) {
    setInputUri(uri);
    setInputB64(b64);
  }

  async function runEdit(apiFn: () => Promise<ApiResult>) {
    setLoading(true);
    setResultB64(null);
    setStatus('Processing…');
    try {
      const result = await apiFn();
      setResultB64(result.image);
      setStatus(result.status);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveToGallery() {
    if (!resultB64) return;
    const { status: permStatus } = await MediaLibrary.requestPermissionsAsync();
    if (permStatus !== 'granted') {
      alert('Gallery permission denied. Enable it in Settings.');
      return;
    }
    const uri = FileSystem.cacheDirectory + 'photo_editor_result.png';
    await FileSystem.writeAsStringAsync(uri, resultB64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await MediaLibrary.saveToLibraryAsync(uri);
    alert('Saved to gallery!');
  }

  return { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery };
}
