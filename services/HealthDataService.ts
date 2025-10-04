
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

interface HealthStats {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleepHours: number;
}

interface ActivityRecord {
  id?: number;
  activity: string;
  timestamp: number;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD format
}

class HealthDataService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private webStorage: Map<string, any> = new Map(); // Fallback storage for web

  async initialize() {
    if (this.isInitialized) return;

    try {
      // For web platform, use localStorage as fallback due to wa-sqlite.wasm issues
      if (Platform.OS === 'web') {
        console.log('Using web storage fallback for HealthDataService on web platform');
        this.initializeWebStorage();
        this.isInitialized = true;
        return;
      }

      // Try to initialize SQLite for native platforms
      this.db = await SQLite.openDatabaseAsync('health_tracker.db');
      
      // Create tables if they don't exist
      await this.createTables();
      
      this.isInitialized = true;
      console.log('HealthDataService initialized with SQLite');
    } catch (error) {
      console.error('Error initializing HealthDataService with SQLite, falling back to web storage:', error);
      // Fallback to web storage if SQLite fails (e.g., on web with missing WASM)
      this.initializeWebStorage();
      this.isInitialized = true;
    }
  }

  private initializeWebStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Load existing data from localStorage
        const activityRecords = localStorage.getItem('health_activity_records');
        const dailyStats = localStorage.getItem('health_daily_stats');
        
        if (activityRecords) {
          this.webStorage.set('activity_records', JSON.parse(activityRecords));
        } else {
          this.webStorage.set('activity_records', []);
        }
        
        if (dailyStats) {
          this.webStorage.set('daily_stats', JSON.parse(dailyStats));
        } else {
          this.webStorage.set('daily_stats', {});
        }
      } else {
        // Fallback for environments without localStorage
        this.webStorage.set('activity_records', []);
        this.webStorage.set('daily_stats', {});
      }
      
      console.log('Web storage initialized');
    } catch (error) {
      console.error('Error initializing web storage:', error);
      this.webStorage.set('activity_records', []);
      this.webStorage.set('daily_stats', {});
    }
  }

  private saveWebStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('health_activity_records', JSON.stringify(this.webStorage.get('activity_records') || []));
        localStorage.setItem('health_daily_stats', JSON.stringify(this.webStorage.get('daily_stats') || {}));
      }
    } catch (error) {
      console.error('Error saving to web storage:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;

    try {
      // Activity records table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS activity_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          duration INTEGER NOT NULL,
          date TEXT NOT NULL
        );
      `);

      // Daily stats table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT UNIQUE NOT NULL,
          steps INTEGER DEFAULT 0,
          calories INTEGER DEFAULT 0,
          active_minutes INTEGER DEFAULT 0,
          sleep_hours REAL DEFAULT 0
        );
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
    }
  }

  async recordActivity(activity: string, duration: number = 1) {
    if (!this.isInitialized) {
      console.warn('HealthDataService not initialized');
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (this.db) {
        // SQLite implementation
        await this.db.runAsync(
          'INSERT INTO activity_records (activity, timestamp, duration, date) VALUES (?, ?, ?, ?)',
          [activity, timestamp, duration, date]
        );
        await this.updateDailyStats(date, activity, duration);
      } else {
        // Web storage implementation
        const activityRecords = this.webStorage.get('activity_records') || [];
        const newRecord = {
          id: Date.now(), // Simple ID generation
          activity,
          timestamp,
          duration,
          date
        };
        activityRecords.push(newRecord);
        this.webStorage.set('activity_records', activityRecords);
        
        await this.updateDailyStatsWeb(date, activity, duration);
        this.saveWebStorage();
      }

      console.log(`Recorded activity: ${activity} for ${duration} minutes`);
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  }

  private async updateDailyStats(date: string, activity: string, duration: number) {
    if (!this.db) return;

    try {
      // Ensure daily stats record exists
      await this.db.runAsync(
        'INSERT OR IGNORE INTO daily_stats (date) VALUES (?)',
        [date]
      );

      // Update stats based on activity
      const updates = this.calculateStatsUpdate(activity, duration);

      if (updates.steps > 0) {
        await this.db.runAsync(
          'UPDATE daily_stats SET steps = steps + ? WHERE date = ?',
          [updates.steps, date]
        );
      }

      if (updates.calories > 0) {
        await this.db.runAsync(
          'UPDATE daily_stats SET calories = calories + ? WHERE date = ?',
          [updates.calories, date]
        );
      }

      if (updates.activeMinutes > 0) {
        await this.db.runAsync(
          'UPDATE daily_stats SET active_minutes = active_minutes + ? WHERE date = ?',
          [updates.activeMinutes, date]
        );
      }

      if (updates.sleepHours > 0) {
        await this.db.runAsync(
          'UPDATE daily_stats SET sleep_hours = sleep_hours + ? WHERE date = ?',
          [updates.sleepHours, date]
        );
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  private async updateDailyStatsWeb(date: string, activity: string, duration: number) {
    try {
      const dailyStats = this.webStorage.get('daily_stats') || {};
      
      // Ensure daily stats record exists
      if (!dailyStats[date]) {
        dailyStats[date] = {
          steps: 0,
          calories: 0,
          active_minutes: 0,
          sleep_hours: 0
        };
      }

      // Update stats based on activity
      const updates = this.calculateStatsUpdate(activity, duration);

      dailyStats[date].steps += updates.steps;
      dailyStats[date].calories += updates.calories;
      dailyStats[date].active_minutes += updates.activeMinutes;
      dailyStats[date].sleep_hours += updates.sleepHours;

      this.webStorage.set('daily_stats', dailyStats);
    } catch (error) {
      console.error('Error updating daily stats (web):', error);
    }
  }

  private calculateStatsUpdate(activity: string, duration: number) {
    const updates = {
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      sleepHours: 0
    };

    switch (activity.toLowerCase()) {
      case 'walking':
        updates.steps = Math.round(duration * 100); // ~100 steps per minute
        updates.calories = Math.round(duration * 4); // ~4 calories per minute
        updates.activeMinutes = duration;
        break;
      case 'running':
        updates.steps = Math.round(duration * 180); // ~180 steps per minute
        updates.calories = Math.round(duration * 12); // ~12 calories per minute
        updates.activeMinutes = duration;
        break;
      case 'cycling':
        updates.calories = Math.round(duration * 8); // ~8 calories per minute
        updates.activeMinutes = duration;
        break;
      case 'sleeping':
        updates.sleepHours = duration / 60; // Convert minutes to hours
        break;
      default:
        // Idle or other activities
        updates.calories = Math.round(duration * 1.2); // Base metabolic rate
        break;
    }

    return updates;
  }

  async getTodayStats(): Promise<HealthStats> {
    if (!this.isInitialized) {
      return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (this.db) {
        // SQLite implementation
        const result = await this.db.getFirstAsync(
          'SELECT steps, calories, active_minutes, sleep_hours FROM daily_stats WHERE date = ?',
          [today]
        ) as any;

        if (result) {
          return {
            steps: result.steps || 0,
            calories: result.calories || 0,
            activeMinutes: result.active_minutes || 0,
            sleepHours: result.sleep_hours || 0
          };
        } else {
          // Create today's record if it doesn't exist
          await this.db.runAsync(
            'INSERT OR IGNORE INTO daily_stats (date) VALUES (?)',
            [today]
          );
          return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
        }
      } else {
        // Web storage implementation
        const dailyStats = this.webStorage.get('daily_stats') || {};
        const todayStats = dailyStats[today];
        
        if (todayStats) {
          return {
            steps: todayStats.steps || 0,
            calories: todayStats.calories || 0,
            activeMinutes: todayStats.active_minutes || 0,
            sleepHours: todayStats.sleep_hours || 0
          };
        } else {
          return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
        }
      }
    } catch (error) {
      console.error('Error getting today stats:', error);
      return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
    }
  }

  async getWeeklyStats(): Promise<HealthStats[]> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days

      if (this.db) {
        // SQLite implementation
        const results = await this.db.getAllAsync(
          `SELECT date, steps, calories, active_minutes, sleep_hours 
           FROM daily_stats 
           WHERE date >= ? AND date <= ? 
           ORDER BY date ASC`,
          [
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ]
        ) as any[];

        return results.map(row => ({
          steps: row.steps || 0,
          calories: row.calories || 0,
          activeMinutes: row.active_minutes || 0,
          sleepHours: row.sleep_hours || 0
        }));
      } else {
        // Web storage implementation
        const dailyStats = this.webStorage.get('daily_stats') || {};
        const weeklyStats: HealthStats[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayStats = dailyStats[dateStr];
          weeklyStats.push({
            steps: dayStats?.steps || 0,
            calories: dayStats?.calories || 0,
            activeMinutes: dayStats?.active_minutes || 0,
            sleepHours: dayStats?.sleep_hours || 0
          });
        }
        
        return weeklyStats;
      }
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return [];
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityRecord[]> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      if (this.db) {
        // SQLite implementation
        const results = await this.db.getAllAsync(
          'SELECT * FROM activity_records ORDER BY timestamp DESC LIMIT ?',
          [limit]
        ) as any[];

        return results.map(row => ({
          id: row.id,
          activity: row.activity,
          timestamp: row.timestamp,
          duration: row.duration,
          date: row.date
        }));
      } else {
        // Web storage implementation
        const activityRecords = this.webStorage.get('activity_records') || [];
        return activityRecords
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async clearAllData() {
    if (!this.isInitialized) {
      console.warn('HealthDataService not initialized');
      return;
    }

    try {
      if (this.db) {
        // SQLite implementation
        await this.db.execAsync('DELETE FROM activity_records');
        await this.db.execAsync('DELETE FROM daily_stats');
      } else {
        // Web storage implementation
        this.webStorage.set('activity_records', []);
        this.webStorage.set('daily_stats', {});
        this.saveWebStorage();
      }
      console.log('All health data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
    this.isInitialized = false;
  }
}

// Create and export a singleton instance
const healthDataService = new HealthDataService();

// Add a simple test method for debugging
(healthDataService as any).test = async () => {
  console.log('Testing HealthDataService...');
  await healthDataService.initialize();
  console.log('HealthDataService test completed');
};

export default healthDataService;
