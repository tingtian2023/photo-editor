import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import FreeEditScreen from './src/screens/FreeEditScreen';
import BackgroundSwapScreen from './src/screens/BackgroundSwapScreen';
import LifestyleScreen from './src/screens/LifestyleScreen';
import EnhanceScreen from './src/screens/EnhanceScreen';
import AddTextScreen from './src/screens/AddTextScreen';
import RemoveTextScreen from './src/screens/RemoveTextScreen';
import CropScreen from './src/screens/CropScreen';
import ReplaceModelScreen from './src/screens/ReplaceModelScreen';
import RemovePropScreen from './src/screens/RemovePropScreen';
import ChangeClothingScreen from './src/screens/ChangeClothingScreen';

export type RootStackParamList = {
  Home: undefined;
  FreeEdit: undefined;
  BackgroundSwap: undefined;
  Lifestyle: undefined;
  Enhance: undefined;
  AddText: undefined;
  RemoveText: undefined;
  Crop: undefined;
  ReplaceModel: undefined;
  RemoveProp: undefined;
  ChangeClothing: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#6200EE' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Photo Editor' }} />
          <Stack.Screen name="FreeEdit" component={FreeEditScreen} options={{ title: 'Free Edit' }} />
          <Stack.Screen name="BackgroundSwap" component={BackgroundSwapScreen} options={{ title: 'Background Swap' }} />
          <Stack.Screen name="Lifestyle" component={LifestyleScreen} options={{ title: 'Lifestyle Scene' }} />
          <Stack.Screen name="Enhance" component={EnhanceScreen} options={{ title: 'Enhance' }} />
          <Stack.Screen name="AddText" component={AddTextScreen} options={{ title: 'Add Text Overlay' }} />
          <Stack.Screen name="RemoveText" component={RemoveTextScreen} options={{ title: 'Remove Text & Watermarks' }} />
          <Stack.Screen name="Crop" component={CropScreen} options={{ title: 'Crop / Trim' }} />
          <Stack.Screen name="ReplaceModel" component={ReplaceModelScreen} options={{ title: 'Replace Model' }} />
          <Stack.Screen name="RemoveProp" component={RemovePropScreen} options={{ title: 'Remove Prop' }} />
          <Stack.Screen name="ChangeClothing" component={ChangeClothingScreen} options={{ title: 'Change Clothing' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
