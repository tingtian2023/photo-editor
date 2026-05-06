import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURES: {
  screen: keyof RootStackParamList;
  label: string;
  icon: string;
  desc: string;
  color: string;
}[] = [
  { screen: 'FreeEdit', label: 'Free Edit', icon: 'create-outline', desc: 'Any instruction you can describe', color: '#6200EE' },
  { screen: 'BackgroundSwap', label: 'Background Swap', icon: 'image-outline', desc: 'Replace the background', color: '#0277BD' },
  { screen: 'Lifestyle', label: 'Lifestyle Scene', icon: 'leaf-outline', desc: 'Place product in a scene', color: '#2E7D32' },
  { screen: 'Enhance', label: 'Enhance', icon: 'flash-outline', desc: 'Professional retouching', color: '#E65100' },
  { screen: 'AddText', label: 'Add Text', icon: 'text-outline', desc: 'Overlay text or banners', color: '#B71C1C' },
  { screen: 'RemoveText', label: 'Remove Watermarks', icon: 'eye-off-outline', desc: 'Clean text & logos', color: '#4A148C' },
  { screen: 'Crop', label: 'Crop / Trim', icon: 'crop-outline', desc: 'Trim edges precisely', color: '#006064' },
  { screen: 'ReplaceModel', label: 'Replace Model', icon: 'person-outline', desc: 'Swap the person in photo', color: '#1565C0' },
  { screen: 'RemoveProp', label: 'Remove Prop', icon: 'trash-outline', desc: 'Erase objects naturally', color: '#4E342E' },
  { screen: 'ChangeClothing', label: 'Change Clothing', icon: 'color-palette-outline', desc: 'Swap garments on model', color: '#880E4F' },
  { screen: 'CombineImages', label: 'Combine Images', icon: 'copy-outline', desc: 'Merge two photos side-by-side or with AI', color: '#00695C' },
];

export default function HomeScreen() {
  const nav = useNavigation<Nav>();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>
        AI-powered photo editing for product listings
      </Text>
      {FEATURES.map((f) => (
        <TouchableOpacity
          key={f.screen}
          style={[styles.card, { borderLeftColor: f.color }]}
          onPress={() => nav.navigate(f.screen)}
          activeOpacity={0.75}
        >
          <View style={[styles.iconWrap, { backgroundColor: f.color + '18' }]}>
            <Ionicons name={f.icon as any} size={26} color={f.color} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{f.label}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 40 },
  subtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginBottom: 10,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontWeight: '700', fontSize: 15, color: '#111' },
  cardDesc: { color: '#888', fontSize: 12, marginTop: 2 },
});
