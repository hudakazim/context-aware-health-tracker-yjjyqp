
import * as SQLite from 'expo-sqlite';

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

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync('health_tracker.db');
      
      // Create tables if they don't exist
      await this.createTables();
      
      this.isInitialized = true;
      console.log('HealthDataService initialized');
    } catch (error) {
      console.error('Error initializing HealthDataService:', error);
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
    if (!this.db || !this.isInitialized) {
      console.warn('HealthDataService not initialized');
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Insert activity record
      await this.db.runAsync(
        'INSERT INTO activity_records (activity, timestamp, duration, date) VALUES (?, ?, ?, ?)',
        [activity, timestamp, duration, date]
      );

      // Update daily stats
      await this.updateDailyStats(date, activity, duration);

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
    if (!this.db || !this.isInitialized) {
      return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
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
    } catch (error) {
      console.error('Error getting today stats:', error);
      return { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
    }
  }

  async getWeeklyStats(): Promise<HealthStats[]> {
    if (!this.db || !this.isInitialized) {
      return [];
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days

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
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return [];
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityRecord[]> {
    if (!this.db || !this.isInitialized) {
      return [];
    }

    try {
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
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async clearAllData() {
    if (!this.db || !this.isInitialized) {
      console.warn('HealthDataService not initialized');
      return;
    }

    try {
      await this.db.execAsync('DELETE FROM activity_records');
      await this.db.execAsync('DELETE FROM daily_stats');
      console.log('All health data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export default new HealthDataService();
