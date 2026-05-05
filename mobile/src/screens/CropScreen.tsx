import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

function NumInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={ni.wrap}>
      <Text style={ni.label}>{label}</Text>
      <View style={ni.row}>
        <TouchableOpacity style={ni.btn} onPress={() => onChange(Math.max(0, value - 10))}>
          <Text style={ni.btnText}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={ni.input}
          keyboardType="numeric"
          value={String(value)}
          onChangeText={(t) => onChange(Math.max(0, parseInt(t) || 0))}
        />
        <TouchableOpacity style={ni.btn} onPress={() => onChange(value + 10)}>
          <Text style={ni.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ni = StyleSheet.create({
  wrap: { flex: 1 },
  label: { color: '#555', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    backgroundColor: '#006064',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 20, lineHeight: 24 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    padding: 8,
    fontSize: 15,
    marginHorizontal: 6,
  },
});

export default function CropScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } =
    useImageEdit();
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    runEdit(() => api.crop(inputB64, top, bottom, left, right));
  }

  function reset() {
    setTop(0);
    setBottom(0);
    setLeft(0);
    setRight(0);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />

      <Text style={styles.info}>
        Enter how many pixels to trim from each edge. Tap +/− to adjust in steps of 10px.
      </Text>

      <Text style={styles.label}>Crop amounts (px)</Text>
      <View style={styles.grid}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <NumInput label="Top" value={top} onChange={setTop} />
          <NumInput label="Bottom" value={bottom} onChange={setBottom} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <NumInput label="Left" value={left} onChange={setLeft} />
          <NumInput label="Right" value={right} onChange={setRight} />
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={reset}>
        <Text style={styles.resetText}>Reset all to 0</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.btnText}>Crop Image</Text>
      </TouchableOpacity>

      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  info: { color: '#666', fontSize: 13, marginTop: 12, lineHeight: 18 },
  label: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 16, marginBottom: 8 },
  grid: {},
  resetBtn: { alignSelf: 'center', marginTop: 12 },
  resetText: { color: '#006064', fontSize: 13, fontWeight: '600' },
  btn: {
    backgroundColor: '#006064',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
