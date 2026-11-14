import type { ComponentType } from 'react'
import {
  Camera,
  Copy,
  Crop,
  EyeOff,
  Image,
  Leaf,
  Palette,
  SquarePen,
  Trash2,
  Type,
  User,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { api } from './lib/api'
import DescribeScreen, { type DescribeConfig } from './screens/DescribeScreen'
import FreeEditScreen from './screens/FreeEditScreen'
import { EnhanceScreen, ProductShotsScreen } from './screens/StyleScreens'
import {
  AddTextScreen,
  ChangeClothingScreen,
  CombineImagesScreen,
  CropScreen,
  RemoveTextScreen,
} from './screens/ToolScreens'

export type Feature = {
  path: string
  label: string
  title?: string
  desc: string
  icon: LucideIcon
  color: string
  Screen: ComponentType
}

const describe = (config: DescribeConfig) => () => <DescribeScreen config={config} />

/** Home-screen order. Each entry is one route at `#/<path>`. */
export const FEATURES: Feature[] = [
  { path: 'free-edit', label: 'Free Edit', desc: 'Any instruction you can describe', icon: SquarePen, color: '#6200EE', Screen: FreeEditScreen },
  { path: 'product-shots', label: 'Product Shots', desc: 'White background, lifestyle, packaging, close-up, group', icon: Camera, color: '#AD1457', Screen: ProductShotsScreen },
  {
    path: 'background', label: 'Background Swap', desc: 'Replace the background', icon: Image, color: '#0277BD',
    Screen: describe({
      label: 'New background',
      placeholder: 'Describe the background you want…',
      submitLabel: 'Swap Background',
      missingMessage: 'Describe the new background.',
      call: api.swapBackground,
      examples: [
        'Clean white studio background',
        'Soft gradient from light grey to white',
        'Cosy bedroom shelf, warm lighting',
        'Outdoor park on a sunny day, shallow depth of field',
        'Luxury dark marble surface',
      ],
    }),
  },
  {
    path: 'lifestyle', label: 'Lifestyle Scene', desc: 'Place product in a scene', icon: Leaf, color: '#2E7D32',
    Screen: describe({
      label: 'Scene description',
      placeholder: 'Describe the scene and how the product is used…',
      submitLabel: 'Generate Scene',
      missingMessage: 'Describe the lifestyle scene.',
      call: api.addLifestyle,
      examples: [
        'Woman drinking from the mug at a cosy café, warm lighting',
        'Flat lay on a white marble surface with dried flowers',
        'Man wearing it while hiking in a forest, golden hour',
        'Product on a modern kitchen counter, clean and minimal',
        'Close-up on a wooden table with a cup of coffee nearby',
      ],
    }),
  },
  { path: 'enhance', label: 'Enhance', desc: 'Professional retouching', icon: Zap, color: '#E65100', Screen: EnhanceScreen },
  { path: 'add-text', label: 'Add Text', title: 'Add Text Overlay', desc: 'Overlay text or banners', icon: Type, color: '#B71C1C', Screen: AddTextScreen },
  { path: 'remove-text', label: 'Remove Watermarks', title: 'Remove Text & Watermarks', desc: 'Clean text & logos', icon: EyeOff, color: '#4A148C', Screen: RemoveTextScreen },
  { path: 'crop', label: 'Crop / Trim', desc: 'Trim edges precisely', icon: Crop, color: '#006064', Screen: CropScreen },
  {
    path: 'replace-model', label: 'Replace Model', desc: 'Swap the person in photo', icon: User, color: '#1565C0',
    Screen: describe({
      label: 'Describe the replacement person',
      placeholder: 'e.g. East Asian woman, 20s, long black hair, smiling',
      submitLabel: 'Replace Model',
      missingMessage: 'Describe the replacement person.',
      call: api.replaceModel,
      examples: [
        'South Asian woman, 30s, curly hair, confident expression',
        'East Asian man, 20s, short black hair, neutral expression',
        'Young blonde woman, blue eyes, bright smile',
        'Middle-aged man, beard, athletic build',
      ],
    }),
  },
  {
    path: 'remove-prop', label: 'Remove Prop', desc: 'Erase objects naturally', icon: Trash2, color: '#4E342E',
    Screen: describe({
      label: 'Item to remove',
      placeholder: 'e.g. handbag, sunglasses, hat, watch',
      submitLabel: 'Remove Prop',
      missingMessage: 'Describe the prop to remove.',
      multiline: false,
      call: api.removeProp,
      examples: ['handbag', 'sunglasses', 'hat', 'watch', 'phone', 'shopping bags'],
    }),
  },
  { path: 'change-clothing', label: 'Change Clothing', desc: 'Swap garments on model', icon: Palette, color: '#880E4F', Screen: ChangeClothingScreen },
  { path: 'combine', label: 'Combine Images', desc: 'Merge two photos side-by-side or with AI', icon: Copy, color: '#00695C', Screen: CombineImagesScreen },
]
