/**
 * Notification Service for PawGuard AI
 * Handles push notification management and in-app alerts for NGO users
 */

import { supabase } from '../lib/supabase';
import { DisasterZone, AnimalReport } from '../lib/supabaseTypes';

// ============= TYPES =============

export type NotificationType =
    | 'new_report'
    | 'disaster_alert'
    | 'report_update'
    | 'assignment'
    | 'urgent_case';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: string;
}

// ============= LOCAL NOTIFICATION STORAGE =============
// In production, this would integrate with Expo Push Notifications

let localNotifications: Notification[] = [];
let notificationListeners: ((notifications: Notification[]) => void)[] = [];

function notifyListeners() {
    notificationListeners.forEach(listener => listener([...localNotifications]));
}

// ============= NOTIFICATION CREATION =============

/**
 * Create a notification locally (in-app)
 */
export function createNotification(
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>
): Notification {
    const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        body,
        data,
        read: false,
        createdAt: new Date().toISOString(),
    };

    localNotifications.unshift(notification);

    // Keep only latest 50 notifications
    if (localNotifications.length > 50) {
        localNotifications = localNotifications.slice(0, 50);
    }

    notifyListeners();
    console.log('🔔 Notification created:', title);

    return notification;
}

// ============= DISASTER NOTIFICATIONS =============

/**
 * Send disaster alert notification to all NGO users
 */
export function sendDisasterAlertNotification(zone: DisasterZone): Notification {
    return createNotification(
        'disaster_alert',
        `🚨 DISASTER ALERT: ${zone.name}`,
        zone.description || 'A new disaster zone has been activated. Check affected animals.',
        {
            zoneId: zone.id,
            severity: zone.severity,
            centerLat: zone.centerLatitude,
            centerLng: zone.centerLongitude,
            radiusKm: zone.radiusKm,
        }
    );
}

/**
 * Send notification when disaster zone is deactivated
 */
export function sendDisasterResolvedNotification(zone: DisasterZone): Notification {
    return createNotification(
        'disaster_alert',
        `✅ Disaster Resolved: ${zone.name}`,
        'This disaster zone has been deactivated. Normal operations resumed.',
        { zoneId: zone.id }
    );
}

// ============= REPORT NOTIFICATIONS =============

/**
 * Send notification for new report in disaster zone
 */
export function sendNewDisasterReportNotification(
    report: AnimalReport,
    zoneName: string
): Notification {
    return createNotification(
        'urgent_case',
        `🆘 Urgent: Animal in ${zoneName}`,
        `A ${report.species} was reported in an active disaster zone. Immediate attention needed.`,
        {
            reportId: report.id,
            reportDisplayId: report.reportId,
            species: report.species,
            isEmergency: true,
        }
    );
}

/**
 * Send notification for new emergency report
 */
export function sendEmergencyReportNotification(report: AnimalReport): Notification {
    return createNotification(
        'urgent_case',
        `🚑 Emergency Report: ${report.reportId}`,
        `A ${report.species} needs urgent medical attention at ${report.address}`,
        {
            reportId: report.id,
            reportDisplayId: report.reportId,
            species: report.species,
        }
    );
}

/**
 * Send notification when a report is assigned to an NGO
 */
export function sendAssignmentNotification(
    report: AnimalReport,
    ngoName: string
): Notification {
    return createNotification(
        'assignment',
        `📋 New Assignment: ${report.reportId}`,
        `You have been assigned to rescue a ${report.species} at ${report.address}`,
        {
            reportId: report.id,
            reportDisplayId: report.reportId,
            ngoName: ngoName,
        }
    );
}

/**
 * Send notification when report status changes
 */
export function sendStatusUpdateNotification(
    report: AnimalReport,
    oldStatus: string,
    newStatus: string
): Notification {
    const statusEmoji: Record<string, string> = {
        new: '🆕',
        in_progress: '🔄',
        rescued: '💙',
        resolved: '✅',
        adopted: '🏠',
    };

    return createNotification(
        'report_update',
        `${statusEmoji[newStatus] || '📝'} Status Updated: ${report.reportId}`,
        `Report status changed from "${oldStatus}" to "${newStatus}"`,
        {
            reportId: report.id,
            reportDisplayId: report.reportId,
            oldStatus,
            newStatus,
        }
    );
}

// ============= NOTIFICATION MANAGEMENT =============

/**
 * Get all notifications
 */
export function getNotifications(): Notification[] {
    return [...localNotifications];
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
    return localNotifications.filter(n => !n.read).length;
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: string): void {
    const notification = localNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        notifyListeners();
    }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
    localNotifications.forEach(n => n.read = true);
    notifyListeners();
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
    localNotifications = [];
    notifyListeners();
}

/**
 * Subscribe to notification updates
 */
export function subscribeToNotifications(
    callback: (notifications: Notification[]) => void
): () => void {
    notificationListeners.push(callback);

    // Immediately call with current notifications
    callback([...localNotifications]);

    return () => {
        notificationListeners = notificationListeners.filter(l => l !== callback);
    };
}

// ============= SUPABASE INTEGRATION =============

/**
 * Subscribe to disaster zone changes and send notifications
 */
export function setupDisasterNotifications(): () => void {
    const subscription = supabase
        .channel('disaster-notifications')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'disaster_zones',
            },
            (payload: { eventType: string; new: unknown; old: unknown }) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const zone = payload.new as any;
                    if (zone.is_active) {
                        sendDisasterAlertNotification({
                            id: zone.id,
                            name: zone.name,
                            description: zone.description,
                            centerLatitude: zone.center_latitude,
                            centerLongitude: zone.center_longitude,
                            radiusKm: zone.radius_km,
                            isActive: zone.is_active,
                            severity: zone.severity,
                            activatedAt: zone.activated_at,
                        });
                    }
                }
            }
        )
        .subscribe();

    console.log('🔔 Disaster notification subscription active');

    return () => {
        subscription.unsubscribe();
    };
}

/**
 * Subscribe to new emergency reports and send notifications
 */
export function setupEmergencyReportNotifications(): () => void {
    const subscription = supabase
        .channel('emergency-report-notifications')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'animal_reports',
                filter: 'is_emergency=eq.true',
            },
            (payload: { new: unknown; old: unknown }) => {
                const report = payload.new as any;
                sendEmergencyReportNotification({
                    id: report.id,
                    reportId: report.report_id,
                    reporterId: report.reporter_id,
                    reporterName: report.reporter_name,
                    species: report.species,
                    address: report.address,
                    isEmergency: report.is_emergency,
                    status: report.status,
                    imageUrl: report.image_url,
                    animalId: report.animal_id,
                    isVaccinated: report.is_vaccinated,
                    isNeutered: report.is_neutered,
                    isRescued: report.is_rescued,
                    disasterMode: report.disaster_mode,
                    createdAt: report.created_at,
                    updatedAt: report.updated_at,
                });
            }
        )
        .subscribe();

    console.log('🔔 Emergency report notification subscription active');

    return () => {
        subscription.unsubscribe();
    };
}

export default {
    createNotification,
    sendDisasterAlertNotification,
    sendDisasterResolvedNotification,
    sendNewDisasterReportNotification,
    sendEmergencyReportNotification,
    sendAssignmentNotification,
    sendStatusUpdateNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    subscribeToNotifications,
    setupDisasterNotifications,
    setupEmergencyReportNotifications,
};
