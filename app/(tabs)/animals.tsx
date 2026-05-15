/**
 * Animals Tab — Pending Rescue List
 *
 * Shows all animals that have been detected by CCTV and are waiting
 * to be rescued. NGOs can browse this list and claim an animal.
 *
 * Data source: Supabase `pending_animals` table
 * Action:      Tap animal → animal-profile.tsx → "Go to Rescue" button
 */

import React from 'react';
import { NGOReportListScreen } from '../../screens/NGOReportListScreen';

export default function AnimalsTab() {
    return <NGOReportListScreen />;
}
