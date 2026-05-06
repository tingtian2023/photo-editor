import React, { useState } from 'react';
import {
  ScrollView, View, Text, Image, TouchableOpacity,
  TextInput, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const MODES = [
  { key: 'side-by-side', label: 'Side by Side' },
  { key: 'top-bottom',   label: 'Top / Bottom' },
  { key: 'ai',           label: 'AI Blend' },
];

async function pickOne(): Promise<{ uri: string; b64: string } | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') { alert('Photo library permission is required.'); return null; }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    base64: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  if (!asset.base64) { alert('Could not read image data.'); return null; }
  return { uri: asset.uri, b64: asset.base64 };
}

export default function CombineImagesScreen() {
  const { resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();
  const [img1, setImg1] = useState<{ uri: string; b64: string } | null>(null);
  const [img2, setImg2] = useState<{ uri: string; b64: string } | null>(null);
  const [mode, setMode] = useState('side-by-side');
  const [description, setDescription] = useState('');

  async function handlePick(slot: 1 | 2) {
    const picked = await pickOne();
    if (!picked) return;
    slot === 1 ? setImg1(picked) : setImg2(picked);
  }

  function submit() {
    if (!img1) return alert('Select Image 1 first.');
    if (!img2) return alert('Select Image 2 first.');
    if (mode === 'ai' && !description.trim()) return alert('Enter a description for AI Blend.');
    runEdit(() => api.combineImages(img1.b64, img2.b64, mode, description));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.sectionLabel}>Pick two images</Text>
      <View style={styles.pickers}>
        {([1, 2] as const).map((slot) => {
          const img = slot === 1 ? img1 : img2;
          return (
            <TouchableOpacity key={slot} style={styles.pickerSlot} onPress={() => handlePick(slot)}>
              {img ? (
                <Image source={{ uri: img.uri }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="add-circle-outline" size={36} color="#aaa" />
                  <Text style={styles.thumbLabel}>Image {slot}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Layout</Text>
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.chip, mode === m.key && styles.chipActive]}
            onPress={() => setMode(m.key)}
          >
            <Text style={[styles.chipText, mode === m.key && styles.chipTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'ai' && (
        <>
          <Text style={styles.sectionLabel}>Describe the blend</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Place the person from image 1 into the background of image 2"
            placeholderTextColor="#aaa"
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.btnText}>Combine</Text>
      </TouchableOpacity>

      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontWeight: '600', color: '#333', fontSize: 14, marginTop: 14, marginBottom: 8 },
  pickers: { flexDirection: 'row', gap: 12 },
  pickerSlot: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: 160, borderRadius: 12 },
  thumbPlaceholder: {
    height: 160, backgroundColor: '#f0f0f0', borderRadius: 12,
    borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  thumbLabel: { color: '#aaa', fontSize: 13, marginTop: 4 },
  modeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
    backgroundColor: '#EDE7F6',
  },
  chipActive: { backgroundColor: '#6200EE' },
  chipText: { color: '#6200EE', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top', minHeight: 80, color: '#111',
  },
  btn: { backgroundColor: '#6200EE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
