// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();F// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();i// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();l// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();e// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier(); // Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();d// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();o// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();e// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();s// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier(); // Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();n// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();o// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();t// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier(); // Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();e// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();x// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();i// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();s// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();t// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();.// Simulated ML Activity Classifier
// This simulates a machine learning model for activity recognition
// In a real implementation, this would use TensorFlow.js or similar

interface SensorReading {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  timestamp: number;
}

interface ActivityFeatures {
  meanAcceleration: number;
  accelerationVariance: number;
  meanGyroscope: number;
  gyroscopeVariance: number;
  stepFrequency: number;
  movementIntensity: number;
  verticalMovement: number;
  horizontalMovement: number;
}

type ActivityType = 'idle' | 'walking' | 'running' | 'cycling' | 'sleeping' | 'driving';

class MLActivityClassifier {
  private readonly WINDOW_SIZE = 50; // Number of sensor readings to analyze
  private readonly FEATURE_WEIGHTS = {
    // Weights learned from "training data" (simulated)
    walking: {
      meanAcceleration: 0.3,
      accelerationVariance: 0.4,
      stepFrequency: 0.5,
      verticalMovement: 0.4,
      movementIntensity: 0.3
    },
    running: {
      meanAcceleration: 0.4,
      accelerationVariance: 0.5,
      stepFrequency: 0.6,
      verticalMovement: 0.5,
      movementIntensity: 0.6
    },
    cycling: {
      meanAcceleration: 0.2,
      accelerationVariance: 0.3,
      gyroscopeVariance: 0.5,
      horizontalMovement: 0.4,
      movementIntensity: 0.4
    },
    driving: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.6,
      gyroscopeVariance: 0.3,
      horizontalMovement: 0.2,
      movementIntensity: 0.3
    },
    sleeping: {
      meanAcceleration: 0.05,
      accelerationVariance: 0.1,
      movementIntensity: 0.1,
      verticalMovement: 0.05,
      horizontalMovement: 0.05
    },
    idle: {
      meanAcceleration: 0.1,
      accelerationVariance: 0.2,
      movementIntensity: 0.2,
      stepFrequency: 0.0
    }
  };

  extractFeatures(sensorData: SensorReading[]): ActivityFeatures {
    if (sensorData.length === 0) {
      return {
        meanAcceleration: 0,
        accelerationVariance: 0,
        meanGyroscope: 0,
        gyroscopeVariance: 0,
        stepFrequency: 0,
        movementIntensity: 0,
        verticalMovement: 0,
        horizontalMovement: 0
      };
    }

    // Calculate acceleration magnitudes
    const accelerationMagnitudes = sensorData.map(reading => 
      Math.sqrt(
        reading.accelerometer.x ** 2 + 
        reading.accelerometer.y ** 2 + 
        reading.accelerometer.z ** 2
      )
    );

    // Calculate gyroscope magnitudes
    const gyroscopeMagnitudes = sensorData.map(reading =>
      Math.sqrt(
        reading.gyroscope.x ** 2 + 
        reading.gyroscope.y ** 2 + 
        reading.gyroscope.z ** 2
      )
    );

    // Statistical features
    const meanAcceleration = this.calculateMean(accelerationMagnitudes);
    const accelerationVariance = this.calculateVariance(accelerationMagnitudes, meanAcceleration);
    const meanGyroscope = this.calculateMean(gyroscopeMagnitudes);
    const gyroscopeVariance = this.calculateVariance(gyroscopeMagnitudes, meanGyroscope);

    // Movement analysis
    const verticalMovement = this.calculateMean(sensorData.map(r => Math.abs(r.accelerometer.z)));
    const horizontalMovement = this.calculateMean(sensorData.map(r => 
      Math.sqrt(r.accelerometer.x ** 2 + r.accelerometer.y ** 2)
    ));

    // Step frequency estimation (simplified)
    const stepFrequency = this.estimateStepFrequency(sensorData);

    // Overall movement intensity
    const movementIntensity = (accelerationVariance + gyroscopeVariance) / 2;

    return {
      meanAcceleration,
      accelerationVariance,
      meanGyroscope,
      gyroscopeVariance,
      stepFrequency,
      movementIntensity,
      verticalMovement,
      horizontalMovement
    };
  }

  classify(sensorData: SensorReading[]): { activity: ActivityType; confidence: number } {
    if (sensorData.length < 10) {
      return { activity: 'idle', confidence: 0.5 };
    }

    const features = this.extractFeatures(sensorData);
    const scores: { [key in ActivityType]: number } = {
      idle: 0,
      walking: 0,
      running: 0,
      cycling: 0,
      sleeping: 0,
      driving: 0
    };

    // Calculate scores for each activity using feature matching
    Object.keys(this.FEATURE_WEIGHTS).forEach(activity => {
      const activityKey = activity as ActivityType;
      const weights = this.FEATURE_WEIGHTS[activityKey];
      let score = 0;

      // Walking detection
      if (activityKey === 'walking') {
        if (features.stepFrequency > 0.5 && features.stepFrequency < 3.0) score += 0.4;
        if (features.accelerationVariance > 0.3 && features.accelerationVariance < 2.0) score += 0.3;
        if (features.verticalMovement > 0.2) score += 0.3;
      }

      // Running detection
      else if (activityKey === 'running') {
        if (features.stepFrequency > 2.5) score += 0.5;
        if (features.accelerationVariance > 1.5) score += 0.3;
        if (features.movementIntensity > 1.0) score += 0.2;
      }

      // Cycling detection
      else if (activityKey === 'cycling') {
        if (features.gyroscopeVariance > 0.5 && features.accelerationVariance < 1.5) score += 0.4;
        if (features.horizontalMovement > 0.3) score += 0.3;
        if (features.stepFrequency < 0.5) score += 0.3; // No stepping motion
      }

      // Driving detection
      else if (activityKey === 'driving') {
        if (features.accelerationVariance > 0.8 && features.gyroscopeVariance < 0.5) score += 0.4;
        if (features.stepFrequency < 0.2) score += 0.3;
        if (features.movementIntensity > 0.5 && features.movementIntensity < 1.5) score += 0.3;
      }

      // Sleeping detection
      else if (activityKey === 'sleeping') {
        if (features.movementIntensity < 0.2) score += 0.5;
        if (features.meanAcceleration < 0.1) score += 0.3;
        if (features.stepFrequency < 0.1) score += 0.2;
      }

      // Idle detection
      else if (activityKey === 'idle') {
        if (features.movementIntensity < 0.5 && features.stepFrequency < 0.3) score += 0.4;
        if (features.accelerationVariance < 0.5) score += 0.3;
        if (features.gyroscopeVariance < 0.3) score += 0.3;
      }

      scores[activityKey] = Math.max(0, Math.min(1, score));
    });

    // Find the activity with the highest score
    const bestActivity = Object.keys(scores).reduce((a, b) => 
      scores[a as ActivityType] > scores[b as ActivityType] ? a : b
    ) as ActivityType;

    const confidence = scores[bestActivity];

    // Apply minimum confidence threshold
    if (confidence < 0.3) {
      return { activity: 'idle', confidence: 0.6 };
    }

    return { activity: bestActivity, confidence };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => (val - mean) ** 2);
    return this.calculateMean(squaredDiffs);
  }

  private estimateStepFrequency(sensorData: SensorReading[]): number {
    if (sensorData.length < 10) return 0;

    // Simple peak detection on vertical acceleration
    const verticalAccel = sensorData.map(r => r.accelerometer.z);
    const peaks = this.detectPeaks(verticalAccel, 0.5); // Threshold for step detection
    
    // Calculate frequency (steps per second)
    const timeSpan = (sensorData[sensorData.length - 1].timestamp - sensorData[0].timestamp) / 1000;
    return timeSpan > 0 ? peaks.length / timeSpan : 0;
  }

  private detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && 
          data[i] > data[i + 1] && 
          data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Simulate model training (in a real app, this would load a pre-trained model)
  async loadModel(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate loading time
      setTimeout(() => {
        console.log('ML Activity Classifier model loaded (simulated)');
        resolve(true);
      }, 1000);
    });
  }

  // Get model confidence for the current classification
  getModelInfo(): { version: string; accuracy: number; trainingData: string } {
    return {
      version: '1.0.0-simulated',
      accuracy: 0.87, // Simulated accuracy
      trainingData: 'Simulated training on 10,000+ activity samples'
    };
  }
}

export default new MLActivityClassifier();