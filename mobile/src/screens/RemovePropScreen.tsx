import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const EXAMPLES = ['handbag', 'sunglasses', 'hat', 'watch', 'phone', 'shopping bags'];

export default function RemovePropScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [description, setDescription] = useState('');

  function submit() {
    if (!inputB64) return alert('Select a photo first.');
    if (!description.trim()) return alert('Describe the prop to remove.');
    runEdit(() => api.removeProp(inputB64, description));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <Text style={styles.label}>Item to remove</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription}
        placeholder="e.g. handbag, sunglasses, hat, watch" placeholderTextColor="#aaa" />
      <Text style={styles.label}>Examples</Text>
      <View style={styles.chipRow}>
        {EXAMPLES.map((e) => (
          <TouchableOpacity key={e} style={styles.chip} onPress={() => setDescription(e)}>
            <Text style={styles.chipText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Remove Prop</Text>
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#EFEBE9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { color: '#4E342E', fontSize: 13 },
  btn: { backgroundColor: '#4E342E', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
