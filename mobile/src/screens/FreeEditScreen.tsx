import React, { useState, useEffect } from 'react';
import {
  ScrollView, TextInput, TouchableOpacity, Text, View,
  StyleSheet, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerCard from '../components/ImagePickerCard';
import ResultCard from '../components/ResultCard';
import { useImageEdit } from '../hooks/useImageEdit';
import { api } from '../api';

const EXAMPLES = [
  'Make the lighting look like golden hour sunset',
  'Add a soft drop shadow beneath the product',
  'Turn the background into a blurred bokeh effect',
  'Remove the shadow under the product',
  'Make the colours more vibrant and saturated',
];

export default function FreeEditScreen() {
  const { inputUri, inputB64, setInput, resultB64, status, loading, runEdit, saveToGallery } =
    useImageEdit();
  const [prompt, setPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<Record<string, string>>({});
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => { api.getPrompts().then(setSavedPrompts); }, []);

  function submit() {
    if (!inputB64) return alert('Select an image first.');
    if (!prompt.trim()) return alert('Enter an instruction.');
    runEdit(() => api.freeEdit(inputB64, prompt));
  }

  async function handleSavePrompt() {
    const name = prompt.slice(0, 30).trim();
    if (!name) return alert('Enter a prompt first.');
    await api.savePrompt(name, prompt);
    setSavedPrompts(await api.getPrompts());
    alert(`Saved as "${name}"`);
  }

  async function handleDeletePrompt(name: string) {
    await api.deletePrompt(name);
    setSavedPrompts(await api.getPrompts());
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ImagePickerCard uri={inputUri} onPick={setInput} />

      <View style={styles.row}>
        <Text style={styles.label}>Instruction</Text>
        <TouchableOpacity onPress={() => setShowPrompts(true)}>
          <Text style={styles.link}>Saved prompts</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Describe what you want to change…"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity style={styles.savePromptBtn} onPress={handleSavePrompt}>
        <Ionicons name="bookmark-outline" size={15} color="#6200EE" />
        <Text style={styles.savePromptText}>Bookmark prompt</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Examples</Text>
      {EXAMPLES.map((e) => (
        <TouchableOpacity key={e} style={styles.chip} onPress={() => setPrompt(e)}>
          <Text style={styles.chipText}>{e}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>Apply Edit</Text>
      </TouchableOpacity>

      <ResultCard b64={resultB64} status={status} loading={loading} onSave={saveToGallery} />

      <Modal visible={showPrompts} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Saved Prompts</Text>
            {Object.keys(savedPrompts).length === 0 ? (
              <Text style={styles.modalEmpty}>No saved prompts yet.</Text>
            ) : (
              <FlatList
                data={Object.entries(savedPrompts)}
                keyExtractor={([name]) => name}
                renderItem={({ item: [name, text] }) => (
                  <View style={styles.promptRow}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => { setPrompt(text); setShowPrompts(false); }}>
                      <Text style={styles.promptName}>{name}</Text>
                      <Text style={styles.promptPreview} numberOfLines={1}>{text}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePrompt(name)}>
                      <Ionicons name="trash-outline" size={20} color="#c00" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowPrompts(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 },
  label: { fontWeight: '600', color: '#333', fontSize: 14 },
  link: { color: '#6200EE', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top', minHeight: 80, color: '#111',
  },
  savePromptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 16 },
  savePromptText: { color: '#6200EE', fontSize: 13 },
  chip: { backgroundColor: '#EDE7F6', padding: 10, borderRadius: 8, marginBottom: 7 },
  chipText: { color: '#6200EE', fontSize: 13 },
  btn: { backgroundColor: '#6200EE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontWeight: '700', fontSize: 18, marginBottom: 16 },
  modalEmpty: { color: '#888', textAlign: 'center', marginVertical: 20 },
  promptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  promptName: { fontWeight: '600', color: '#111', fontSize: 14 },
  promptPreview: { color: '#888', fontSize: 12, marginTop: 2 },
  modalClose: { backgroundColor: '#6200EE', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  modalCloseText: { color: '#fff', fontWeight: '700' },
});
