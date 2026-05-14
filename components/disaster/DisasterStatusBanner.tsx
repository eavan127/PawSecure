import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface DisasterStatusBannerProps {
    locationName: string;
    animalCount?: number;
    status?: 'active' | 'monitoring' | 'resolved';
}

export const DisasterStatusBanner: React.FC<DisasterStatusBannerProps> = ({
    locationName,
    animalCount = 0,
    status = 'active',
}) => {
    const getStatusText = () => {
        switch (status) {
            case 'active':
                return 'Active Disaster';
            case 'monitoring':
                return 'Monitoring';
            case 'resolved':
                return 'Resolved';
            default:
                return 'Active Disaster';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(220, 38, 38, 0.15)', 'rgba(249, 115, 22, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="warning"
                            size={20}
                            color={colors.minimalist.disasterRed}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.statusText}>
                            {getStatusText()} in {locationName}
                        </Text>
                        {animalCount > 0 && (
                            <Text style={styles.countText}>
                                {animalCount} animals reported
                            </Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.2)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.minimalist.disasterRedLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    statusText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    countText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        marginTop: 2,
    },
});
