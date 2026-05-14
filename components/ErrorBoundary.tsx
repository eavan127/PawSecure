import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="warning" size={64} color={theme.colors.danger} />
                    </View>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        We encountered an unexpected error. Please try again.
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                    )}
                    <Pressable style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.textStyles.h2,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    message: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    errorText: {
        ...theme.textStyles.caption,
        color: theme.colors.danger,
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surfaceDark,
        borderRadius: theme.radius.sm,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xxxl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.button,
    },
    buttonText: {
        ...theme.textStyles.button,
        color: theme.colors.textDark,
    },
});
