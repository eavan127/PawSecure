module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // 'expo-router/babel', // This is optional in newer versions but safe to include for compatibility if needed. 
            // For now, babel-preset-expo handles most router needs.
            // Reanimated plugin must be last
            'react-native-reanimated/plugin',
        ],
    };
};
