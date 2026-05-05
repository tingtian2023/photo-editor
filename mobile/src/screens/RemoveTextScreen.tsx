import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

export default function RemoveTextScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } = useImageEdit();

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    runEdit(() => api.removeText(inputB64));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />
      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={18} color="#4A148C" />
        <Text style={styles.tipText}>Works best when text overlays a consistent background.</Text>
      </View>
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Remove Text &amp; Watermarks</Text>
      </TouchableOpacity>
      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  tipBox: { flexDirection: 'row', backgroundColor: '#F3E5F5', borderRadius: 10, padding: 12, gap: 8, marginTop: 12, alignItems: 'flex-start' },
  tipText: { flex: 1, color: '#4A148C', fontSize: 13, lineHeight: 18 },
  btn: { backgroundColor: '#4A148C', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
