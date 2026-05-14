import React from 'react';
import { useRouter } from 'expo-router';
import { DisasterModeScreen } from '../../screens/DisasterModeScreen';
import { useAuth } from '../../contexts/AuthContext';

export default function DisasterTab() {
    const router = useRouter();
    const { user } = useAuth();

    // Citizens can only view, NGOs can take action
    const isViewOnly = user?.role !== 'ngo';

    const navigation = {
        goBack: () => router.back(),
        navigate: (screen: string, params?: any) => {
            if (screen === 'DisasterAnimalDetail') {
                router.push({ pathname: '/disaster-animal-detail', params });
            } else if (screen === 'contact-reporter') {
                router.push({ pathname: '/contact-reporter', params });
            } else {
                router.push({ pathname: `/${screen.toLowerCase()}`, params });
            }
        },
    };

    return <DisasterModeScreen navigation={navigation} viewOnly={isViewOnly} />;
}
