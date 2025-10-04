
import React, { useState, useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform, Dimensions } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { ActivityCard } from "@/components/ActivityCard";
import { StatsCard } from "@/components/StatsCard";
import { WelcomeModal } from "@/components/WelcomeModal";
import ActivityRecognitionService from "@/services/ActivityRecognitionService";
import HealthDataService from "@/services/HealthDataService";
import NotificationService from "@/services/NotificationService";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [currentActivity, setCurrentActivity] = useState<string>('idle');
  const [todayStats, setTodayStats] = useState({
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    sleepHours: 0,
  });
  const [isTracking, setIsTracking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const loadTodayStats = useCallback(async () => {
    try {
      const stats = await HealthDataService.getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  }, []);

  const updateStats = useCallback(async (activity: string) => {
    try {
      await HealthDataService.recordActivity(activity);
      const newStats = await HealthDataService.getTodayStats();
      setTodayStats(newStats);
      
      // Check for goal achievements and send notifications
      checkGoalAchievements(newStats);
    } catch (error) {
      console.log('Error updating stats:', error);
    }
  }, [todayStats]);

  const checkGoalAchievements = (stats: any) => {
    // Check step goal (10,000 steps)
    if (stats.steps >= 10000 && todayStats.steps < 10000) {
      NotificationService.sendGoalAchievement('steps', stats.steps);
    }
    
    // Check active minutes goal (30 minutes)
    if (stats.activeMinutes >= 30 && todayStats.activeMinutes < 30) {
      NotificationService.sendGoalAchievement('activeMinutes', stats.activeMinutes);
    }
    
    // Check calorie goal (2000 calories)
    if (stats.calories >= 2000 && todayStats.calories < 2000) {
      NotificationService.sendGoalAchievement('calories', stats.calories);
    }
  };

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize services
        await ActivityRecognitionService.initialize();
        await HealthDataService.initialize();
        await NotificationService.initialize();
        
        // Load today's stats
        await loadTodayStats();
        
        // Schedule daily reminders
        await NotificationService.scheduleDailyReminders();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
    
    // Subscribe to activity updates
    const unsubscribe = ActivityRecognitionService.subscribe((activity) => {
      console.log('Activity detected:', activity);
      setCurrentActivity(activity);
      updateStats(activity);
      
      // Notify notification service of activity
      NotificationService.onActivityDetected(activity);
    });

    return () => {
      unsubscribe();
      ActivityRecognitionService.cleanup();
      NotificationService.cleanup();
    };
  }, [loadTodayStats, updateStats]);

  const toggleTracking = () => {
    if (isTracking) {
      ActivityRecognitionService.stopTracking();
    } else {
      ActivityRecognitionService.startTracking();
    }
    setIsTracking(!isTracking);
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={toggleTracking}
      style={styles.headerButtonContainer}
    >
      <IconSymbol 
        name={isTracking ? "pause.fill" : "play.fill"} 
        color={colors.primary} 
        size={20}
      />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => console.log('Settings pressed')}
      style={styles.headerButtonContainer}
    >
      <IconSymbol
        name="gear"
        color={colors.primary}
        size={20}
      />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Tracker",
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
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
          {/* Current Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Activity</Text>
            <ActivityCard 
              activity={currentActivity}
              isTracking={isTracking}
            />
          </View>

          {/* Today's Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="Steps"
                value={todayStats.steps.toString()}
                icon="figure.walk"
                color={colors.primary}
                target="10,000"
              />
              <StatsCard
                title="Calories"
                value={todayStats.calories.toString()}
                icon="flame.fill"
                color={colors.accent}
                target="2,000"
              />
              <StatsCard
                title="Active Minutes"
                value={todayStats.activeMinutes.toString()}
                icon="timer"
                color={colors.secondary}
                target="30"
              />
              <StatsCard
                title="Sleep Hours"
                value={todayStats.sleepHours.toFixed(1)}
                icon="moon.fill"
                color={colors.textSecondary}
                target="8.0"
              />
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacySection}>
            <View style={styles.privacyHeader}>
              <IconSymbol name="lock.fill" color={colors.secondary} size={16} />
              <Text style={styles.privacyTitle}>Privacy First</Text>
            </View>
            <Text style={styles.privacyText}>
              All your health data is processed locally on your device. 
              No data is sent to external servers.
            </Text>
          </View>
        </ScrollView>

        {/* Welcome Modal */}
        <WelcomeModal 
          visible={showWelcome} 
          onClose={() => setShowWelcome(false)} 
        />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  headerButtonContainer: {
    padding: 6,
  },
  privacySection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.grey,
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
