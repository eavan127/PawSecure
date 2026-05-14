import React, { type PropsWithChildren } from 'react';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { ReportProvider } from '../contexts/ReportContext';

// Disable font scaling globally (TS-safe)
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

type ProvidersProps = PropsWithChildren<{}>;

export const Providers = ({ children }: ProvidersProps) => {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <DataProvider>
                    <ReportProvider>
                        {children}
                    </ReportProvider>
                </DataProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
};
