
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private isInitialized = false;
  private lastActivityTime = Date.now();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('health-reminders', {
          name: 'Health Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#64B5F6',
        });
      }

      this.isInitialized = true;
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
    }
  }

  async sendActivityReminder() {
    if (!this.isInitialized) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Time to Move!',
          body: "You've been inactive for 2 hours. Time for a walk!",
          data: { type: 'activity_reminder' },
        },
        trigger: null, // Send immediately
      });

      console.log('Activity reminder sent');
    } catch (error) {
      console.error('Error sending activity reminder:', error);
    }
  }

  async sendSleepReminder() {
    if (!this.isInitialized) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '😴 Bedtime Reminder',
          body: 'Consider winding down for better sleep quality.',
          data: { type: 'sleep_reminder' },
        },
        trigger: null,
      });

      console.log('Sleep reminder sent');
    } catch (error) {
      console.error('Error sending sleep reminder:', error);
    }
  }

  async sendGoalAchievement(goalType: string, value: number) {
    if (!this.isInitialized) return;

    try {
      let title = '';
      let body = '';

      switch (goalType) {
        case 'steps':
          title = '🎉 Step Goal Achieved!';
          body = `Congratulations! You've reached ${value.toLocaleString()} steps today.`;
          break;
        case 'activeMinutes':
          title = '💪 Active Goal Reached!';
          body = `Great job! You've been active for ${value} minutes today.`;
          break;
        case 'calories':
          title = '🔥 Calorie Goal Met!';
          body = `Awesome! You've burned ${value} calories today.`;
          break;
        default:
          return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'goal_achievement', goalType, value },
        },
        trigger: null,
      });

      console.log(`Goal achievement notification sent for ${goalType}`);
    } catch (error) {
      console.error('Error sending goal achievement notification:', error);
    }
  }

  updateActivityTime() {
    this.lastActivityTime = Date.now();
    
    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Set new timer for inactivity reminder
    this.inactivityTimer = setTimeout(() => {
      this.sendActivityReminder();
    }, this.INACTIVITY_THRESHOLD);
  }

  onActivityDetected(activity: string) {
    if (activity !== 'idle' && activity !== 'sleeping') {
      this.updateActivityTime();
    }
  }

  async scheduleDailyReminders() {
    if (!this.isInitialized) return;

    try {
      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule morning motivation (8 AM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Good Morning!',
          body: 'Ready to start your healthy day? Let\'s track your activities!',
          data: { type: 'daily_motivation' },
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });

      // Schedule evening wind-down reminder (9 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Evening Check-in',
          body: 'How was your day? Review your activity progress.',
          data: { type: 'evening_checkin' },
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Daily reminders scheduled');
    } catch (error) {
      console.error('Error scheduling daily reminders:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  cleanup() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

export default new NotificationService();
