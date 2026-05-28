// Animal Match Result — redirect to animals list
import { Redirect } from 'expo-router';
export default function AnimalMatchResult() {
    return <Redirect href="/(tabs)/animals" />;
}
