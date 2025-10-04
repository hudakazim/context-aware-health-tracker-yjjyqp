import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});Fimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});iimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});limport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});dimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});oimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});simport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});nimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});oimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});timport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});ximport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});iimport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});simport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});timport React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});.import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  const features = [
    {
      icon: 'figure.walk',
      title: 'Activity Recognition',
      description: 'Automatically detects walking, running, cycling, and more using your device sensors.',
      color: colors.primary,
    },
    {
      icon: 'brain.head.profile',
      title: 'On-Device AI',
      description: 'Uses machine learning locally on your device - no data sent to servers.',
      color: colors.secondary,
    },
    {
      icon: 'chart.bar.fill',
      title: 'Smart Insights',
      description: 'Get personalized health insights and activity recommendations.',
      color: colors.accent,
    },
    {
      icon: 'lock.shield.fill',
      title: 'Privacy First',
      description: 'All your health data stays private and secure on your device.',
      color: colors.success,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="heart.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.title}>Welcome to Health Tracker</Text>
            <Text style={styles.subtitle}>
              Your privacy-focused companion for health monitoring and activity recognition
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <IconSymbol name={feature.icon} color={colors.card} size={24} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Demo Notice */}
          <View style={styles.demoNotice}>
            <View style={styles.demoHeader}>
              <IconSymbol name="play.circle.fill" color={colors.warning} size={20} />
              <Text style={styles.demoTitle}>Demo Mode Active</Text>
            </View>
            <Text style={styles.demoText}>
              This app is running in demo mode with simulated sensor data. 
              In a real deployment, it would use your device&apos;s actual sensors 
              (accelerometer, gyroscope, pedometer) for accurate activity recognition.
            </Text>
          </View>

          {/* Technical Features */}
          <View style={styles.techSection}>
            <Text style={styles.techTitle}>Technical Features</Text>
            <View style={styles.techList}>
              <Text style={styles.techItem}>• Sensor Fusion (Accelerometer + Gyroscope)</Text>
              <Text style={styles.techItem}>• On-Device Machine Learning</Text>
              <Text style={styles.techItem}>• Local SQLite Data Storage</Text>
              <Text style={styles.techItem}>• Smart Push Notifications</Text>
              <Text style={styles.techItem}>• Real-time Activity Classification</Text>
              <Text style={styles.techItem}>• Privacy-First Architecture</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable style={styles.getStartedButton} onPress={onClose}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <IconSymbol name="arrow.right" color={colors.card} size={16} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  demoNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.card,
    marginRight: 8,
  },
  techSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techList: {
    gap: 6,
  },
  techItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});