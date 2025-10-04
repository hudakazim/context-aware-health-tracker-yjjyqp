import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Alert, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import ActivityRecognitionService from '@/services/ActivityRecognitionService';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  color = colors.primary,
  destructive = false 
}) => (
  <Pressable style={styles.settingItem} onPress={onPress}>
    <View style={[styles.settingIcon, { backgroundColor: color }]}>
      <IconSymbol name={icon} color={colors.card} size={20} />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, destructive && { color: colors.error }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      )}
    </View>
    <IconSymbol name="chevron.right" color={colors.textSecondary} size={16} />
  </Pressable>
);

export default function ProfileScreen() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your health tracking data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await HealthDataService.clearAllData();
              Alert.alert('Success', 'All health data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export feature coming soon! Your data will remain private and secure on your device.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyInfo = () => {
    Alert.alert(
      'Privacy & Security',
      'Your health data is processed entirely on your device using on-device machine learning. No data is sent to external servers or cloud services. All activity recognition and insights are generated locally to protect your privacy.',
      [{ text: 'Got it' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Health Tracker',
      'Context-Aware Health Tracker v1.0\n\nThis app uses your device sensors (accelerometer, gyroscope) to automatically detect activities like walking, running, cycling, and sleeping. All processing happens on your device to ensure maximum privacy.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Profile & Settings",
          }}
        />
      )}
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && styles.scrollContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.fill" color={colors.card} size={32} />
            </View>
            <Text style={styles.profileName}>Health Tracker User</Text>
            <Text style={styles.profileSubtitle}>Privacy-focused health monitoring</Text>
          </View>

          {/* Data & Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="lock.shield.fill"
                title="Privacy & Security"
                subtitle="Learn how your data is protected"
                onPress={handlePrivacyInfo}
                color={colors.secondary}
              />
              <SettingItem
                icon="square.and.arrow.up"
                title="Export Data"
                subtitle="Export your health data"
                onPress={handleExportData}
                color={colors.primary}
              />
            </View>
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="info.circle.fill"
                title="About"
                subtitle="App version and information"
                onPress={handleAbout}
                color={colors.textSecondary}
              />
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="trash.fill"
                title={isClearing ? "Clearing..." : "Clear All Data"}
                subtitle="Permanently delete all health data"
                onPress={handleClearData}
                color={colors.error}
                destructive={true}
              />
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <View style={styles.privacyHeader}>
              <IconSymbol name="shield.checkered" color={colors.secondary} size={20} />
              <Text style={styles.privacyTitle}>100% Private</Text>
            </View>
            <Text style={styles.privacyText}>
              All your health data stays on your device. We use on-device machine learning 
              for activity recognition and never send your personal information to external servers.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scrollContainerWithTabBar: {
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  privacyNotice: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    marginTop: 8,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
