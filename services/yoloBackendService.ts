// Port changed from 5000 (Flask) to 8000 (FastAPI)
const BACKEND_URL = (process.env.EXPO_PUBLIC_YOLO_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// Types 

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface AnimalDetection {
    class_id: number;
    class_name: 'dog' | 'cat';
    confidence: number;         // 0.0 – 1.0
    bbox: BoundingBox;
}

/** Response from POST /detect */
export interface DetectResponse {
    success: boolean;
    detections: AnimalDetection[];
    dog_detected: boolean;
    cat_detected: boolean;
    primary_detection: AnimalDetection | null;
}

/** Response from POST /embed */
export interface EmbedResponse {
    success: boolean;
    embedding: number[];        // 512 floats — store in Supabase pgvector
    embedding_dim: number;      // always 512
}

/** Response from POST /injury */
export interface InjuryResponse {
    success: boolean;
    has_blood: boolean;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    signals: string[];          // e.g. ["red_region_detected"]
}

/** One animal result from POST /pipeline */
export interface PipelineAnimal {
    class_name: 'dog' | 'cat';
    confidence: number;
    bbox: BoundingBox;
    embedding?: number[];       // not returned by pipeline — generated separately via embedFromBbox
    injury: {
        has_blood: boolean;
        severity: 'none' | 'mild' | 'moderate' | 'severe';
        signals: string[];
    };
}

/** Response from POST /pipeline */
export interface PipelineResponse {
    success: boolean;
    animal_count: number;
    animals: PipelineAnimal[];
}

// Service Class 

class YOLOBackendService {
    private backendAvailable: boolean | null = null;

    // Health 

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${BACKEND_URL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[PawSecure] Backend healthy. Models: ${data.models}`);
                this.backendAvailable = true;
                return true;
            }

            this.backendAvailable = false;
            return false;
        } catch {
            console.warn(`[PawSecure] Backend not reachable at ${BACKEND_URL}`);
            this.backendAvailable = false;
            return false;
        }
    }

    // Image helpers 

    private async imageUriToBase64(imageUri: string): Promise<string> {
        // Web: use FileReader (works with blob:// and file URIs)
        const response = await fetch(imageUri);
        const blob = await response.blob(); 
        // blob = binary large object
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private async ensureBackendReady(): Promise<void> {
        if (this.backendAvailable) return;
        const ok = await this.checkHealth();
        if (!ok) {
            throw new Error(
                `PawSecure backend not reachable at ${BACKEND_URL}.\n` +
                `Make sure you ran: uvicorn main:app --reload --host 0.0.0.0 --port 8000`
            );
        }
    }

    private async post<T>(endpoint: string, base64Image: string): Promise<T> {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Backend ${endpoint} returned ${response.status}: ${text}`);
        }

        return response.json() as Promise<T>;
    }

    async runPipeline(imageUri: string): Promise<PipelineResponse> {
        await this.ensureBackendReady();
        const base64 = await this.imageUriToBase64(imageUri);
        const result = await this.post<PipelineResponse>('/pipeline', base64);

        console.log(`[PawSecure] Pipeline found ${result.animal_count} animal(s)`);
        return result;
    }

    /**
     * POST /detect — use this if you only need bounding boxes.
     *
     * Cheaper than /pipeline — does NOT run CLIP or injury analysis.
     * Useful for a live camera preview where you just want to draw boxes.
     */
    async detectAnimals(imageUri: string): Promise<DetectResponse> {
        await this.ensureBackendReady();
        const base64 = await this.imageUriToBase64(imageUri);
        const result = await this.post<DetectResponse>('/detect', base64);

        console.log(`[PawSecure] Detected ${result.detections.length} animal(s)`);
        return result;
    }

    /**
     * POST /embed — generate a 512-dim embedding for a cropped animal image.
     *
     * You must crop the animal first using the bbox from /detect.
     * Store the returned embedding in Supabase animal_embeddings table.
     */
    async embedAnimal(croppedImageUri: string): Promise<EmbedResponse> {
        await this.ensureBackendReady();
        const base64 = await this.imageUriToBase64(croppedImageUri);
        return this.post<EmbedResponse>('/embed', base64);
    }

    /**
     * Crop animal from a full image using bbox coordinates (browser Canvas),
     * then send the crop to /embed for CLIP embedding.
     *
     * Call this AFTER submit (fire and forget) so it never blocks the UI.
     * The pipeline no longer runs CLIP — this replaces that step.
     */
    async embedFromBbox(imageUri: string, bbox: BoundingBox): Promise<EmbedResponse> {
        await this.ensureBackendReady();

        // Crop the animal region using the browser's Canvas API
        const base64 = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width  = Math.round(bbox.width);
                canvas.height = Math.round(bbox.height);
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas not available')); return; }
                ctx.drawImage(
                    img,
                    Math.round(bbox.x), Math.round(bbox.y),
                    Math.round(bbox.width), Math.round(bbox.height),
                    0, 0,
                    Math.round(bbox.width), Math.round(bbox.height),
                );
                // draw the crop
                canvas.toBlob(blob => {
                    // get raw bytes of cropped animal 
                    if (!blob) { reject(new Error('Crop failed')); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror   = reject;
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', 0.9);
                // 90% quality
            };
            img.onerror = reject;
            img.src = imageUri;
        });

        return this.post<EmbedResponse>('/embed', base64);
    }

    /**
     * POST /injury — classify injury severity from a cropped animal image.
     *
     * Returns: severity ("none" | "mild" | "moderate" | "severe")
     * and a list of signals that triggered the classification.
     */
    async analyzeInjury(croppedImageUri: string): Promise<InjuryResponse> {
        await this.ensureBackendReady();
        const base64 = await this.imageUriToBase64(croppedImageUri);
        return this.post<InjuryResponse>('/injury', base64);
    }
}

export const yoloBackendService = new YOLOBackendService();
export default yoloBackendService;
