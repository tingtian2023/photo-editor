import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  b64: string | null;
  status: string;
  loading: boolean;
  onSave: () => void;
}

export default function ResultCard({ b64, status, loading, onSave }: Props) {
  if (!loading && !b64 && !status) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Processing with AI…</Text>
        </View>
      ) : (
        <>
          {status ? (
            <Text style={[styles.status, !b64 && styles.statusError]}>{status}</Text>
          ) : null}
          {b64 ? (
            <>
              <Image
                source={{ uri: `data:image/png;base64,${b64}` }}
                style={styles.image}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save to Gallery</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 16 },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 14, color: '#666', fontSize: 15 },
  status: { color: '#333', marginBottom: 10, fontStyle: 'italic', fontSize: 13 },
  statusError: { color: '#c00' },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#018786',
    paddingVertical: 13,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
