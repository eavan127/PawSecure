/**
 * animal-profile route — redirects to the full rescue detail screen.
 * Kept as a named route so existing links still work.
 */
import { useLocalSearchParams, Redirect } from 'expo-router';

export default function AnimalProfileRedirect() {
    const { id, animalId } = useLocalSearchParams<{ id?: string; animalId?: string }>();
    const resolvedId = animalId ?? id ?? '';
    return <Redirect href={`/ngo-report-detail?animalId=${resolvedId}`} />;
}
