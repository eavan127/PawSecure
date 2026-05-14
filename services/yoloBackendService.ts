/**
 * YOLO Backend Service
 * Communicates with Python Flask backend for YOLO detection
 */

import * as FileSystem from 'expo-file-system/legacy';

const BACKEND_URL = (process.env.EXPO_PUBLIC_YOLO_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

console.log(`[YOLO Service] Configured BACKEND_URL: ${BACKEND_URL}`);

interface BackendDetection {
    class_id: number;
    class_name: 'dog' | 'cat';
    confidence: number;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface BackendResponse {
    success: boolean;
    detections: BackendDetection[];
    dog_detected: boolean;
    cat_detected: boolean;
    primary_detection: BackendDetection | null;
    embedding:number[] | null;
    error?: string;
}

class YOLOBackendService {
    private backendAvailable: boolean | null = null;

    /**
     * Check if backend is available
     */
    async checkHealth(): Promise<boolean> {
        try {
            console.log(`🔍 Checking YOLO backend at ${BACKEND_URL}...`);
            const response = await fetch(`${BACKEND_URL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Backend available: ${data.model}`);
                this.backendAvailable = true;
                return true;
            }

            this.backendAvailable = false;
            return false;
        } catch (error) {
            console.log('⚠️ Backend not available:', error);
            this.backendAvailable = false;
            return false;
        }
    }

    /**
     * Convert image URI to base64 using expo-file-system (more reliable)
     */
    private async imageToBase64(imageUri: string): Promise<string> {
        try {
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });
            return base64;
        } catch (error) {
            console.error('[YOLO Service] Error reading image file:', error);
            // Fallback to fetch if FileSystem fails
            const response = await fetch(imageUri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const res = reader.result as string;
                    resolve(res.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    }

    /**
     * Detect animals using backend YOLO service
     */
    async detectAnimals(imageUri: string): Promise<BackendResponse> {
        console.log(`[Backend YOLO] Detecting animals...`);

        // Check if backend is available (re-check if it was previously false)
        if (this.backendAvailable === null || this.backendAvailable === false) {
            const isAvailable = await this.checkHealth();
            if (!isAvailable) {
                throw new Error(`YOLO Backend not reachable at ${BACKEND_URL}. Check network & server.`);
            }
        }

        try {
            // Convert image to base64
            const base64Image = await this.imageToBase64(imageUri);

            // Send to backend
            console.log(`📤 Sending image to: ${BACKEND_URL}/detect`);
            console.log(`📦 Base64 length: ${base64Image.length} characters`);

            const response = await fetch(`${BACKEND_URL}/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            console.log(`📡 Server response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Backend error text: ${errorText}`);
                throw new Error(`Backend returned ${response.status}: ${errorText}`);
            }

            const result: BackendResponse = await response.json();

            // Log result summary without the full embedding array (too long for terminal)
            const resultSummary = {
                success: result.success,
                detections: result.detections,
                dog_detected: result.dog_detected,
                cat_detected: result.cat_detected,
                primary_detection: result.primary_detection,
                embedding: result.embedding ? `[${result.embedding.length} dimensions]` : null
            };
            console.log(`📥 Received result:`, JSON.stringify(resultSummary, null, 2));

            if (!result.success) {
                throw new Error(result.error || 'Detection failed');
            }

            console.log(`✅ Backend detected ${result.detections.length} animals`);
            return result;

        } catch (error: any) {
            console.error('Backend YOLO detection failed:', error);
            throw error;
        }
    }
}

export const yoloBackendService = new YOLOBackendService();
export default yoloBackendService;
