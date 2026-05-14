import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline) return null;

    return (
        <View style={styles.container}>
            <Ionicons name="cloud-offline" size={16} color={theme.colors.textDark} />
            <Text style={styles.text}>No Internet Connection</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.warning,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    text: {
        ...theme.textStyles.body,
        color: theme.colors.textDark,
        fontWeight: '600',
        fontSize: 12,
    },
});
