import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BottomNav } from '../src/components/common/BottomNav';
import { professionalTheme } from '../src/theme/professional';
import HomeScreen from '../src/screens/HomeScreen';
import PatientsScreen from '../src/screens/PatientsScreen';

const { height } = Dimensions.get('window');

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'patients':
        return <PatientsScreen />;
      case 'reports':
        return <HomeScreen />;
      case 'profile':
        return <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    backgroundColor: professionalTheme.colors.background.light,
  },
  content: {
    flex: 1,
  },
});