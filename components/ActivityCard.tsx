import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});Fimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});iimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});limport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});dimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});oimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});simport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});nimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});oimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});timport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});eimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});ximport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});iimport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});simport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});timport React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});.import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  activity: string;
  isTracking: boolean;
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return 'figure.walk';
    case 'running':
      return 'figure.run';
    case 'cycling':
      return 'bicycle';
    case 'sleeping':
      return 'moon.fill';
    case 'driving':
      return 'car.fill';
    default:
      return 'figure.stand';
  }
};

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'walking':
      return colors.primary;
    case 'running':
      return colors.error;
    case 'cycling':
      return colors.secondary;
    case 'sleeping':
      return colors.textSecondary;
    case 'driving':
      return colors.warning;
    default:
      return colors.grey;
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isTracking }) => {
  const activityIcon = getActivityIcon(activity);
  const activityColor = getActivityColor(activity);
  const activityName = formatActivityName(activity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={32} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.activityName}>{activityName}</Text>
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking active' : 'Tracking paused'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? colors.success : colors.warning }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});