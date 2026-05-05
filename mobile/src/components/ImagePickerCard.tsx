import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string | null;
  onPick: (uri: string, base64: string) => void;
}

async function pickImage(
  launch: () => Promise<ImagePicker.ImagePickerResult>,
  onPick: Props['onPick'],
) {
  const result = await launch();
  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    if (!asset.base64) {
      alert('Could not read image data. Try a different photo.');
      return;
    }
    onPick(asset.uri, asset.base64);
  }
}

export default function ImagePickerCard({ uri, onPick }: Props) {
  async function fromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Photo library permission is required.'); return; }
    pickImage(
      () => ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      }),
      onPick,
    );
  }

  async function fromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { alert('Camera permission is required.'); return; }
    pickImage(
      () => ImagePicker.launchCameraAsync({ quality: 0.8, base64: true }),
      onPick,
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={fromGallery} activeOpacity={0.85}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={52} color="#aaa" />
            <Text style={styles.placeholderText}>Tap to select an image</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={fromGallery}>
          <Ionicons name="images-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={fromCamera}>
          <Ionicons name="camera-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  image: { width: '100%', height: 240, borderRadius: 12, backgroundColor: '#f0f0f0' },
  placeholder: {
    width: '100%', height: 200, backgroundColor: '#f0f0f0', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed',
  },
  placeholderText: { color: '#aaa', marginTop: 8, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: {
    flex: 1, flexDirection: 'row', backgroundColor: '#6200EE',
    paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
