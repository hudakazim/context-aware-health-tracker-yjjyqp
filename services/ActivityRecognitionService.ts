import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();Fimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();iimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();limport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();eimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService(); import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();dimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();oimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();eimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();simport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService(); import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();nimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();oimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();timport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService(); import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();eimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();ximport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();iimport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();simport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();timport { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();.import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import MLActivityClassifier from './MLActivityClassifier';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class ActivityRecognitionService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private pedometerSubscription: any = null;
  private sensorBuffer: SensorData[] = [];
  private activityCallbacks: ((activity: ActivityType) => void)[] = [];
  private currentActivity: ActivityType = 'idle';
  private isInitialized = false;
  private isTracking = false;
  private lastStepCount = 0;
  private stepCountWindow: number[] = [];
  private demoMode = true; // Enable demo mode for testing
  private demoInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check sensor availability
      const accelerometerAvailable = await Accelerometer.isAvailableAsync();
      const gyroscopeAvailable = await Gyroscope.isAvailableAsync();
      
      console.log('Accelerometer available:', accelerometerAvailable);
      console.log('Gyroscope available:', gyroscopeAvailable);

      if (!accelerometerAvailable) {
        console.warn('Accelerometer not available on this device');
      }

      if (!gyroscopeAvailable) {
        console.warn('Gyroscope not available on this device');
      }

      // Set update intervals
      Accelerometer.setUpdateInterval(100); // 10Hz
      Gyroscope.setUpdateInterval(100); // 10Hz

      // Load ML model
      await MLActivityClassifier.loadModel();

      this.isInitialized = true;
      console.log('ActivityRecognitionService initialized');
    } catch (error) {
      console.error('Error initializing ActivityRecognitionService:', error);
    }
  }

  startTracking() {
    if (!this.isInitialized || this.isTracking) return;

    console.log('Starting activity tracking...');
    this.isTracking = true;
    this.sensorBuffer = [];
    this.stepCountWindow = [];

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processSensorData('accelerometer', data);
    });

    // Subscribe to gyroscope
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.processSensorData('gyroscope', data);
    });

    // Subscribe to pedometer (if available)
    if (Platform.OS !== 'web') {
      this.startPedometerTracking();
    }

    // Start activity classification
    this.startActivityClassification();

    // Start demo mode if enabled
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stopTracking() {
    if (!this.isTracking) return;

    console.log('Stopping activity tracking...');
    this.isTracking = false;

    // Unsubscribe from sensors
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    // Stop demo mode
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private async startPedometerTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        const stepCount = result.steps;
        this.stepCountWindow.push(stepCount);
        
        // Keep only last 10 readings
        if (this.stepCountWindow.length > 10) {
          this.stepCountWindow.shift();
        }
      });
    } catch (error) {
      console.error('Error starting pedometer tracking:', error);
    }
  }

  private processSensorData(sensorType: 'accelerometer' | 'gyroscope', data: any) {
    const timestamp = Date.now();
    
    if (sensorType === 'accelerometer') {
      // Add to buffer with gyroscope placeholder
      this.sensorBuffer.push({
        accelerometer: data,
        gyroscope: { x: 0, y: 0, z: 0 }, // Will be updated when gyroscope data arrives
        timestamp
      });
    } else if (sensorType === 'gyroscope') {
      // Update the most recent entry with gyroscope data
      if (this.sensorBuffer.length > 0) {
        const lastEntry = this.sensorBuffer[this.sensorBuffer.length - 1];
        if (Math.abs(lastEntry.timestamp - timestamp) < 50) { // Within 50ms
          lastEntry.gyroscope = data;
        }
      }
    }

    // Keep buffer size manageable
    if (this.sensorBuffer.length > 50) {
      this.sensorBuffer.shift();
    }
  }

  private startActivityClassification() {
    // Run classification every 2 seconds
    const classificationInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(classificationInterval);
        return;
      }

      const activity = this.classifyActivity();
      if (activity !== this.currentActivity) {
        this.currentActivity = activity;
        this.notifyActivityChange(activity);
      }
    }, 2000);
  }

  private classifyActivity(): ActivityType {
    if (this.sensorBuffer.length < 10) {
      return 'idle';
    }

    // Get recent sensor data (last 2 seconds)
    const recentData = this.sensorBuffer.slice(-20);
    
    // Use ML classifier for activity recognition
    const result = MLActivityClassifier.classify(recentData);
    
    console.log(`ML Classification: ${result.activity} (confidence: ${result.confidence.toFixed(2)})`);
    
    return result.activity;
  }

  private extractFeatures(data: SensorData[]) {
    if (data.length === 0) {
      return {
        accelerometerMagnitude: 0,
        accelerometerVariance: 0,
        gyroscopeMagnitude: 0,
        stepRate: 0,
        movementIntensity: 0
      };
    }

    // Calculate accelerometer magnitude and variance
    const accMagnitudes = data.map(d => 
      Math.sqrt(d.accelerometer.x ** 2 + d.accelerometer.y ** 2 + d.accelerometer.z ** 2)
    );
    
    const accMean = accMagnitudes.reduce((a, b) => a + b, 0) / accMagnitudes.length;
    const accVariance = accMagnitudes.reduce((sum, val) => sum + (val - accMean) ** 2, 0) / accMagnitudes.length;

    // Calculate gyroscope magnitude
    const gyroMagnitudes = data.map(d =>
      Math.sqrt(d.gyroscope.x ** 2 + d.gyroscope.y ** 2 + d.gyroscope.z ** 2)
    );
    const gyroMean = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;

    // Estimate step rate from recent step counts
    const stepRate = this.stepCountWindow.length > 1 ? 
      (this.stepCountWindow[this.stepCountWindow.length - 1] - this.stepCountWindow[0]) / 
      (this.stepCountWindow.length * 0.1) : 0; // steps per second

    // Movement intensity (combination of acceleration variance and gyroscope activity)
    const movementIntensity = accVariance + gyroMean;

    return {
      accelerometerMagnitude: accMean,
      accelerometerVariance: accVariance,
      gyroscopeMagnitude: gyroMean,
      stepRate,
      movementIntensity
    };
  }

  private simpleClassifier(features: any): ActivityType {
    const { accelerometerVariance, gyroscopeMagnitude, stepRate, movementIntensity } = features;

    // Simple thresholds for activity classification
    if (movementIntensity < 0.1) {
      return 'sleeping';
    }
    
    if (accelerometerVariance < 0.5 && gyroscopeMagnitude < 0.2) {
      return 'idle';
    }
    
    if (stepRate > 2.5) {
      return 'running';
    }
    
    if (stepRate > 0.5 || (accelerometerVariance > 0.5 && accelerometerVariance < 2.0)) {
      return 'walking';
    }
    
    if (gyroscopeMagnitude > 1.0 && accelerometerVariance > 1.0) {
      return 'cycling';
    }
    
    if (accelerometerVariance > 2.0 && gyroscopeMagnitude < 0.5) {
      return 'driving';
    }

    return 'idle';
  }

  private notifyActivityChange(activity: ActivityType) {
    console.log('Activity changed to:', activity);
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  subscribe(callback: (activity: ActivityType) => void): () => void {
    this.activityCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): ActivityType {
    return this.currentActivity;
  }

  private startDemoMode() {
    console.log('Starting demo mode with simulated sensor data');
    
    const activities: ActivityType[] = ['walking', 'running', 'idle', 'cycling', 'sleeping'];
    let currentActivityIndex = 0;
    let activityDuration = 0;
    
    this.demoInterval = setInterval(() => {
      // Change activity every 30 seconds (15 intervals)
      if (activityDuration >= 15) {
        currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        activityDuration = 0;
        console.log(`Demo: Switching to ${activities[currentActivityIndex]}`);
      }
      
      const currentActivity = activities[currentActivityIndex];
      
      // Generate simulated sensor data based on current activity
      const sensorData = this.generateSimulatedSensorData(currentActivity);
      
      // Add to buffer
      this.sensorBuffer.push(sensorData);
      
      // Keep buffer size manageable
      if (this.sensorBuffer.length > 50) {
        this.sensorBuffer.shift();
      }
      
      activityDuration++;
    }, 2000); // Every 2 seconds
  }

  private generateSimulatedSensorData(activity: ActivityType): SensorData {
    const timestamp = Date.now();
    let accelerometer = { x: 0, y: 0, z: 0 };
    let gyroscope = { x: 0, y: 0, z: 0 };
    
    // Generate realistic sensor data based on activity
    switch (activity) {
      case 'walking':
        accelerometer = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 4
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.3
        };
        break;
        
      case 'running':
        accelerometer = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: 9.8 + (Math.random() - 0.5) * 8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 1.0,
          z: (Math.random() - 0.5) * 0.8
        };
        break;
        
      case 'cycling':
        accelerometer = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5) * 2
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 1.2
        };
        break;
        
      case 'sleeping':
        accelerometer = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: 9.8 + (Math.random() - 0.5) * 0.3
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        };
        break;
        
      default: // idle
        accelerometer = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: 9.8 + (Math.random() - 0.5) * 0.8
        };
        gyroscope = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        };
        break;
    }
    
    return { accelerometer, gyroscope, timestamp };
  }

  cleanup() {
    this.stopTracking();
    this.activityCallbacks = [];
    this.sensorBuffer = [];
    this.isInitialized = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export default new ActivityRecognitionService();