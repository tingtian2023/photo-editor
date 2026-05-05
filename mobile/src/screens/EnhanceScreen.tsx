import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const STYLES = [
  { value: 'Professional studio', desc: 'Sharp details, perfect lighting, clean neutral background' },
  { value: 'Bright & clean', desc: 'Brighter, more vibrant, noise and blur removed' },
  { value: 'Luxury / premium', desc: 'Elegant lighting, rich colours, high-end feel' },
  { value: 'Warm & natural', desc: 'Warm tones, soft natural light, approachable look' },
];

export default function EnhanceScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [selected, setSelected] = useState('Professional studio');

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    runEdit(() => api.enhance(inputB64, selected));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <Text style={styles.label}>Enhancement style</Text>
      {STYLES.map((s) => (
        <TouchableOpacity key={s.value} style={[styles.option, selected === s.value && styles.optionSelected]}
          onPress={() => setSelected(s.value)} activeOpacity={0.8}>
          <View style={styles.optionRadio}>
            {selected === s.value && <View style={styles.optionDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, selected === s.value && styles.optionLabelSelected]}>{s.value}</Text>
            <Text style={styles.optionDesc}>{s.desc}</Text>
          </View>
          {selected === s.value && <Ionicons name="checkmark-circle" size={20} color="#E65100" />}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Enhance Image</Text>
      </TouchableOpacity>
      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 12, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: '#e0e0e0', gap: 12 },
  optionSelected: { borderColor: '#E65100', backgroundColor: '#FFF3E0' },
  optionRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E65100', justifyContent: 'center', alignItems: 'center' },
  optionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E65100' },
  optionLabel: { fontWeight: '600', fontSize: 14, color: '#333' },
  optionLabelSelected: { color: '#E65100' },
  optionDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  btn: { backgroundColor: '#E65100', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
