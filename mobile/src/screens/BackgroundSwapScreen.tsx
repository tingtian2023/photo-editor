import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const EXAMPLES = [
  'Clean white studio background',
  'Soft gradient from light grey to white',
  'Cosy bedroom shelf, warm lighting',
  'Outdoor park on a sunny day, shallow depth of field',
  'Luxury dark marble surface',
];

export default function BackgroundSwapScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [description, setDescription] = useState('');

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    if (!description.trim()) return alert('Describe the new background.');
    runEdit(() => api.swapBackground(inputB64, description));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <Text style={styles.label}>New background</Text>
      <TextInput style={styles.input} multiline numberOfLines={2} value={description}
        onChangeText={setDescription} placeholder="Describe the background you want…" placeholderTextColor="#aaa" />
      <Text style={styles.label}>Examples</Text>
      {EXAMPLES.map((e) => (
        <TouchableOpacity key={e} style={styles.chip} onPress={() => setDescription(e)}>
          <Text style={styles.chipText}>{e}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Swap Background</Text>
      </TouchableOpacity>
      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top', minHeight: 64, color: '#111' },
  chip: { backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginBottom: 7 },
  chipText: { color: '#0277BD', fontSize: 13 },
  btn: { backgroundColor: '#0277BD', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
