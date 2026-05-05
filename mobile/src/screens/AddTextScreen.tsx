import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const POSITIONS = [
  'Top Left', 'Top Center', 'Top Right',
  'Center',
  'Bottom Left', 'Bottom Center', 'Bottom Right',
];

const COLORS: { label: string; hex: string }[] = [
  { label: 'White',  hex: '#FFFFFF' },
  { label: 'Black',  hex: '#000000' },
  { label: 'Red',    hex: '#DC1E1E' },
  { label: 'Yellow', hex: '#FFD700' },
  { label: 'Blue',   hex: '#1464DC' },
];

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={sp.wrap}>
      <Text style={sp.label}>{label}: {value}</Text>
      <View style={sp.row}>
        <TouchableOpacity
          style={sp.btn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={sp.btnText}>−</Text>
        </TouchableOpacity>
        <View style={sp.track}>
          <View
            style={[
              sp.fill,
              { width: `${((value - min) / (max - min)) * 100}%` },
            ]}
          />
        </View>
        <TouchableOpacity
          style={sp.btn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={sp.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { marginBottom: 4 },
  label: { color: '#555', fontSize: 13, marginBottom: 6, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: {
    backgroundColor: '#B71C1C',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 20, lineHeight: 24 },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#B71C1C', borderRadius: 3 },
});

export default function AddTextScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } =
    useImageEdit();
  const [text, setText] = useState('');
  const [position, setPosition] = useState('Bottom Center');
  const [fontSize, setFontSize] = useState(42);
  const [textColor, setTextColor] = useState('White');
  const [bgOpacity, setBgOpacity] = useState(55);

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    if (!text.trim()) return alert('Enter some text.');
    runEdit(() => api.addText(inputB64, text, position, fontSize, textColor, bgOpacity));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />

      <Text style={styles.label}>Text</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="e.g. SALE 50% OFF"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Position</Text>
      <View style={styles.grid}>
        {POSITIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.posBtn, position === p && styles.posBtnSelected]}
            onPress={() => setPosition(p)}
          >
            <Text style={[styles.posBtnText, position === p && styles.posBtnTextSelected]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Font size</Text>
      <Stepper
        label="px"
        value={fontSize}
        min={12}
        max={120}
        step={2}
        onChange={setFontSize}
      />

      <Text style={styles.label}>Text colour</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c.label}
            style={[
              styles.colorBtn,
              { backgroundColor: c.hex, borderColor: c.hex === '#FFFFFF' ? '#ccc' : c.hex },
              textColor === c.label && styles.colorBtnSelected,
            ]}
            onPress={() => setTextColor(c.label)}
          >
            {textColor === c.label && (
              <Text style={{ color: ['#FFFFFF', '#FFD700'].includes(c.hex) ? '#333' : '#fff', fontSize: 16 }}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.colorLabel}>{textColor}</Text>

      <Text style={styles.label}>Background strip opacity</Text>
      <Stepper
        label="%"
        value={bgOpacity}
        min={0}
        max={100}
        step={5}
        onChange={setBgOpacity}
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.btnText}>Add Text</Text>
      </TouchableOpacity>

      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#111',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  posBtnSelected: { backgroundColor: '#B71C1C', borderColor: '#B71C1C' },
  posBtnText: { color: '#555', fontSize: 13 },
  posBtnTextSelected: { color: '#fff', fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBtnSelected: { borderWidth: 3 },
  colorLabel: { color: '#555', fontSize: 13, marginTop: 4 },
  btn: {
    backgroundColor: '#B71C1C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
