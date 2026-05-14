import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ActivityItem as ActivityItemType } from '../types';

interface ActivityItemProps {
    activity: ActivityItemType;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    const getIconColor = () => {
        switch (activity.type) {
            case 'location':
                return theme.colors.primary;
            case 'medical':
                return theme.colors.info;
            case 'intake':
                return theme.colors.textSecondary;
            case 'rescue':
                return theme.colors.primary;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceDark }]}>
                <Ionicons name={activity.icon as any} size={20} color={getIconColor()} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.timestamp}>{activity.timestamp}</Text>
                </View>
                <Text style={styles.title}>{activity.title}</Text>
                <Text style={styles.description}>{activity.description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    timestamp: {
        ...theme.textStyles.caption,
        color: theme.colors.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    title: {
        ...theme.textStyles.bodyLarge,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
});
