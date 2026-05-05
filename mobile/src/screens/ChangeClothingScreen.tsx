import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const EXAMPLES: [string, string][] = [
  ['shirt', 'oversized cream linen shirt'],
  ['jacket', 'black leather biker jacket'],
  ['dress', 'floral midi dress in pastel pink'],
  ['trousers', 'slim-fit dark navy chinos'],
];

export default function ChangeClothingScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [item, setItem] = useState('');
  const [replacement, setReplacement] = useState('');

  function submit() {
    if (!inputB64) return alert('Select a photo first.');
    if (!item.trim()) return alert('Specify the clothing item to change.');
    if (!replacement.trim()) return alert('Describe the replacement garment.');
    runEdit(() => api.changeClothing(inputB64, item, replacement));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <Text style={styles.label}>Item to change</Text>
      <TextInput style={styles.input} value={item} onChangeText={setItem}
        placeholder="e.g. shirt, jacket, trousers, dress" placeholderTextColor="#aaa" />
      <Text style={styles.label}>Replace with</Text>
      <TextInput style={styles.input} value={replacement} onChangeText={setReplacement}
        placeholder="e.g. oversized white linen shirt" placeholderTextColor="#aaa" />
      <Text style={styles.label}>Examples (tap to fill)</Text>
      {EXAMPLES.map(([i, r]) => (
        <TouchableOpacity key={i} style={styles.chip} onPress={() => { setItem(i); setReplacement(r); }}>
          <Text style={styles.chipItem}>{i}</Text>
          <Text style={styles.chipArrow}> → </Text>
          <Text style={styles.chipReplacement}>{r}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Change Clothing</Text>
      </TouchableOpacity>
      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#ddd', color: '#111' },
  chip: { flexDirection: 'row', backgroundColor: '#FCE4EC', padding: 10, borderRadius: 8, marginBottom: 7, flexWrap: 'wrap' },
  chipItem: { color: '#880E4F', fontWeight: '700', fontSize: 13 },
  chipArrow: { color: '#888', fontSize: 13 },
  chipReplacement: { color: '#880E4F', fontSize: 13 },
  btn: { backgroundColor: '#880E4F', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
