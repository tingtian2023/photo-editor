import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const EXAMPLES = [
  'Woman drinking from the mug at a cosy café, warm lighting',
  'Flat lay on a white marble surface with dried flowers',
  'Man wearing it while hiking in a forest, golden hour',
  'Product on a modern kitchen counter, clean and minimal',
  'Close-up on a wooden table with a cup of coffee nearby',
];

export default function LifestyleScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [description, setDescription] = useState('');

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    if (!description.trim()) return alert('Describe the lifestyle scene.');
    runEdit(() => api.addLifestyle(inputB64, description));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <Text style={styles.label}>Scene description</Text>
      <TextInput style={styles.input} multiline numberOfLines={2} value={description}
        onChangeText={setDescription} placeholder="Describe the scene and how the product is used…" placeholderTextColor="#aaa" />
      <Text style={styles.label}>Examples</Text>
      {EXAMPLES.map((e) => (
        <TouchableOpacity key={e} style={styles.chip} onPress={() => setDescription(e)}>
          <Text style={styles.chipText}>{e}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Generate Scene</Text>
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
  chip: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 7 },
  chipText: { color: '#2E7D32', fontSize: 13 },
  btn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
