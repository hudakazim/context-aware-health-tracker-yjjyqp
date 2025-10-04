import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});Fimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});iimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});limport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});eimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
}); import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});dimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});oimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});eimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});simport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
}); import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});nimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});oimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});timport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
}); import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});eimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});ximport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});iimport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});simport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});timport React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});.import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import HealthDataService from '@/services/HealthDataService';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ActivityHistory } from '@/components/ActivityHistory';
import { InsightCard } from '@/components/InsightCard';

const { width } = Dimensions.get('window');

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

export default function InsightsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    steps: [],
    calories: [],
    activeMinutes: [],
    sleepHours: [],
    labels: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadWeeklyData();
    loadRecentActivities();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const weeklyStats = await HealthDataService.getWeeklyStats();
      const labels = generateWeekLabels();
      
      // Pad data if we don't have 7 days
      while (weeklyStats.length < 7) {
        weeklyStats.unshift({ steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 });
      }

      setWeeklyData({
        steps: weeklyStats.map(stat => stat.steps),
        calories: weeklyStats.map(stat => stat.calories),
        activeMinutes: weeklyStats.map(stat => stat.activeMinutes),
        sleepHours: weeklyStats.map(stat => stat.sleepHours),
        labels
      });

      // Generate insights
      generateInsights(weeklyStats);
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await HealthDataService.getRecentActivities(20);
      setRecentActivities(activities);
    } catch (error) {
      console.log('Error loading recent activities:', error);
    }
  };

  const generateWeekLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    return labels;
  };

  const generateInsights = (weeklyStats: any[]) => {
    const insights = [];
    
    // Calculate averages
    const avgSteps = weeklyStats.reduce((sum, stat) => sum + stat.steps, 0) / 7;
    const avgSleep = weeklyStats.reduce((sum, stat) => sum + stat.sleepHours, 0) / 7;
    const avgActiveMinutes = weeklyStats.reduce((sum, stat) => sum + stat.activeMinutes, 0) / 7;
    
    // Generate insights based on data
    if (avgSteps < 5000) {
      insights.push("💪 Try to increase your daily steps! Aim for at least 8,000 steps per day.");
    } else if (avgSteps > 10000) {
      insights.push("🎉 Great job! You're consistently hitting your step goals.");
    }
    
    if (avgSleep < 7) {
      insights.push("😴 Consider getting more sleep. Adults need 7-9 hours per night for optimal health.");
    } else if (avgSleep > 8) {
      insights.push("✨ Excellent sleep habits! You're getting quality rest.");
    }
    
    if (avgActiveMinutes < 20) {
      insights.push("🏃‍♂️ Try to be more active throughout the day. Even 30 minutes makes a difference!");
    } else if (avgActiveMinutes > 60) {
      insights.push("🔥 Amazing activity levels! You're staying very active.");
    }
    
    // Trend analysis
    const recentSteps = weeklyStats.slice(-3).map(s => s.steps);
    const earlierSteps = weeklyStats.slice(0, 3).map(s => s.steps);
    const recentAvg = recentSteps.reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = earlierSteps.reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > earlierAvg * 1.1) {
      insights.push("📈 Your activity is trending upward! Keep up the momentum.");
    } else if (recentAvg < earlierAvg * 0.9) {
      insights.push("📉 Your activity has decreased recently. Time to get moving!");
    }
    
    if (insights.length === 0) {
      insights.push("📊 Keep tracking your activities to get personalized insights!");
    }
    
    setInsights(insights);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Health Insights",
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
          {/* Weekly Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <WeeklyChart data={weeklyData} />
          </View>

          {/* Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </View>

          {/* Activity History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <ActivityHistory activities={recentActivities} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});