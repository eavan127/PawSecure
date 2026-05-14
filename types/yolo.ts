/**
 * YOLO Detection Types
 * Animal identification result interface for YOLO-only detection
 */

export interface AnimalIdentificationResult {
    species: 'dog' | 'cat' | 'unknown';
    breed: string;
    color: string;
    distinctiveFeatures: string[];
    healthNotes?: string;
    isEmergency?: boolean;
    confidence: number;
    embedding?: number[]; // CLIP embedding from YOLO backend for animal re-identification
}

export interface YOLODetection {
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

export interface YOLOBackendResponse {
    success: boolean;
    detections: YOLODetection[];
    dog_detected: boolean;
    cat_detected: boolean;
    primary_detection: YOLODetection | null;
    error?: string;
}
