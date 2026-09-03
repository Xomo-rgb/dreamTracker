import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/AuthContext';
import { professionalTheme } from '../theme/professional';

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (user) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      }, 2500);
    }
  }, [user, loading]);

  return (
    <LinearGradient
      colors={['#0c1e3d', '#1e3a8a', '#2563eb']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Image
              source={require('../../assets/images/logo/sant-egidio-mark.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>DreamTracker</Text>
            <Text style={styles.tagline}>Patient Tracking Management</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: professionalTheme.spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 135,
    marginBottom: professionalTheme.spacing.lg,
  },
  appName: {
    fontSize: 48,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.white,
    textAlign: 'center',
    marginBottom: professionalTheme.spacing.md,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: professionalTheme.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 1,
  },
} as any);