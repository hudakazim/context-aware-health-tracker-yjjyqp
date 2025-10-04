import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});Fimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});iimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});limport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});eimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
}); import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});dimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});oimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});eimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});simport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
}); import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});nimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});oimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});timport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
}); import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});eimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});ximport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});iimport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});simport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});timport React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});.import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // Account for padding
const chartHeight = 200;

interface WeeklyData {
  steps: number[];
  calories: number[];
  activeMinutes: number[];
  sleepHours: number[];
  labels: string[];
}

interface WeeklyChartProps {
  data: WeeklyData;
}

type ChartType = 'steps' | 'calories' | 'activeMinutes' | 'sleepHours';

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('steps');

  const chartOptions = [
    { key: 'steps' as ChartType, label: 'Steps', color: colors.primary },
    { key: 'calories' as ChartType, label: 'Calories', color: colors.accent },
    { key: 'activeMinutes' as ChartType, label: 'Active Min', color: colors.secondary },
    { key: 'sleepHours' as ChartType, label: 'Sleep', color: colors.textSecondary },
  ];

  const getCurrentData = () => {
    return data[selectedChart] || [];
  };

  const getCurrentColor = () => {
    const option = chartOptions.find(opt => opt.key === selectedChart);
    return option?.color || colors.primary;
  };

  const renderBarChart = () => {
    const currentData = getCurrentData();
    const maxValue = Math.max(...currentData, 1);
    const barWidth = (chartWidth - 60) / 7; // Account for padding and spacing

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {currentData.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 60);
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getCurrentColor(),
                        width: barWidth - 8,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.labels[index]}</Text>
                <Text style={styles.barValue}>
                  {selectedChart === 'sleepHours' ? value.toFixed(1) : Math.round(value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.selectorContainer}>
        {chartOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.selectorButton,
              selectedChart === option.key && { backgroundColor: option.color }
            ]}
            onPress={() => setSelectedChart(option.key)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedChart === option.key && { color: colors.card }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {renderBarChart()}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours' 
              ? getCurrentData().reduce((a, b) => a + b, 0).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0))
            }
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {selectedChart === 'sleepHours'
              ? (getCurrentData().reduce((a, b) => a + b, 0) / 7).toFixed(1)
              : Math.round(getCurrentData().reduce((a, b) => a + b, 0) / 7)
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: chartHeight,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: chartHeight - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});