
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface ActivityRecord {
  id?: number;
  activity: string;
  timestamp: number;
  duration: number;
  date: string;
}

interface ActivityHistoryProps {
  activities: ActivityRecord[];
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

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const formatActivityName = (activity: string) => {
  return activity.charAt(0).toUpperCase() + activity.slice(1);
};

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities }) => {
  const renderActivityItem = ({ item }: { item: ActivityRecord }) => {
    const activityIcon = getActivityIcon(item.activity);
    const activityColor = getActivityColor(item.activity);
    const activityName = formatActivityName(item.activity);

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: activityColor }]}>
          <IconSymbol 
            name={activityIcon} 
            color={colors.card} 
            size={20} 
          />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityName}>{activityName}</Text>
            <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
          </View>
          <View style={styles.activityDetails}>
            <Text style={styles.activityDate}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.activityDuration}>
              {item.duration} {item.duration === 1 ? 'minute' : 'minutes'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="clock" color={colors.textSecondary} size={32} />
        <Text style={styles.emptyText}>No activities recorded yet</Text>
        <Text style={styles.emptySubtext}>Start tracking to see your activity history</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
