import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GamifiedBottomNav } from '../src/components/common/GamifiedBottomNav';
import { gamifiedTheme } from '../src/theme/gamified';
import HomeScreen from '../src/screens/HomeScreen';
import PatientsScreen from '../src/screens/PatientsScreen';

export default function GamifiedLayout() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'ranking':
        return <PatientsScreen />;
      case 'contest':
        return <HomeScreen />; // Placeholder
      case 'messages':
        return <HomeScreen />; // Placeholder
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <GamifiedBottomNav
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gamifiedTheme.colors.background.light,
  },
  content: {
    flex: 1,
  },
});