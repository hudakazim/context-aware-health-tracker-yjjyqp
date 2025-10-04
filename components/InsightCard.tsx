import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});Fimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});iimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});limport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});eimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
}); import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});dimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});oimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});eimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});simport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
}); import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});nimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});oimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});timport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
}); import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});eimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});ximport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});iimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});simport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});timport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});.import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Extract emoji from the beginning of the insight text
  const emojiMatch = insight.match(/^(\p{Emoji}+)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '💡';
  const text = insight.replace(/^(\p{Emoji}+\s*)/u, '');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});