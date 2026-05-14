# PawGuard AI Modernization Implementation Plan

This document outlines the step-by-step process to migrate the **PawGuard_AI** repository to a modern, Google-centric architecture. The goal is to replace existing components with Google Cloud and Firebase technologies while staying within the **Free Tier** limits.

---

## 1. Core Technology Stack (Free Tier Optimized)

| Component | Current Technology | New Google Technology | Free Tier Limit (Approx.) |
| :--- | :--- | :--- | :--- |
| **Animal Detection** | CLIP / Custom Model | **Gemini 2.5 Flash** | 15 RPM, 1M TPM, 1,500 RPD |
| **Embeddings** | CLIP | **Multimodal Embeddings API** | $300 trial credit / Low cost per 1k |
| **Storage** | Local / Other | **Firebase Storage** | 5 GB Total, 1 GB/day download |
| **Database** | Local / Other | **Cloud Firestore** | 1 GB Total, 50k reads/day |
| **Maps & Location** | Static / None | **Google Maps JS API** | 28,500 loads/month (Free Cap) |

---

## 2. Phase 1: Environment Setup & Authentication

### 2.1 Google AI Studio (Gemini)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key for **Gemini 2.5 Flash**.
3. Save this as `GOOGLE_AI_KEY` in your environment variables.

### 2.2 Firebase Project
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** (Start in Test Mode).
3. Enable **Firebase Storage**.
4. Register your web/mobile app to get the `firebaseConfig` object.

### 2.3 Google Maps Platform
1. Enable **Maps JavaScript API** and **Geocoding API** in Google Cloud Console.
2. Create an API Key and restrict it to your app's domain.

---

## 3. Phase 2: AI Migration (Detection & Embeddings)

### 3.1 Replace CLIP with Gemini 2.5 Flash
Instead of using CLIP for zero-shot detection, use Gemini's multimodal capabilities to detect animals and provide detailed reports.

**Implementation Logic:**
```python
import google.generativeai as genai

genai.configure(api_key="YOUR_GOOGLE_AI_KEY")
model = genai.GenerativeModel('gemini-2.5-flash')

def detect_animal(image_path):
    image = genai.upload_file(path=image_path)
    prompt = "Identify the animal in this image. Provide the species, health status, and any immediate dangers."
    response = model.generate_content([prompt, image])
    return response.text
```

### 3.2 Replace CLIP Embeddings with Google Multimodal Embeddings
Use Vertex AI's Multimodal Embeddings to generate vectors for search and similarity.

**Implementation Logic:**
- Use the `multimodalembedding@001` model.
- Store the resulting 1408-dimension vector in Firestore for similarity search.

---

## 4. Phase 3: Location & Mapping Integration

### 4.1 Editable Google Map for Reports
Allow users to drag a marker to refine their location if GPS is inaccurate.

**Frontend Implementation (JavaScript):**
1. Initialize a map centered at the user's current GPS coordinates.
2. Place a **Draggable Marker**.
3. Listen for the `dragend` event to update the report's latitude and longitude.

```javascript
let marker = new google.maps.Marker({
    position: userCoords,
    map: map,
    draggable: true
});

marker.addListener('dragend', function() {
    let newPos = marker.getPosition();
    updateReportLocation(newPos.lat(), newPos.lng());
});
```

### 4.2 Reverse Geocoding
Use the **Geocoding API** to convert the marker's coordinates into a human-readable address for the report.

---

## 5. Phase 4: Data Persistence (Firebase)

### 5.1 Firebase Storage for Media
1. Upload the captured image to Firebase Storage.
2. Retrieve the **Download URL**.

### 5.2 Clean Firestore Database Structure
Store the report metadata in a structured format.

**Collection: `reports`**
```json
{
    "userId": "user_123",
    "timestamp": "2026-02-01T12:00:00Z",
    "animalType": "Dog",
    "status": "Injured",
    "imageUrl": "https://firebasestorage...",
    "embedding": [0.12, -0.05, ...],
    "location": {
        "lat": 37.7749,
        "lng": -122.4194,
        "address": "123 Market St, San Francisco"
    }
}
```

---

## 6. Execution Checklist for AI Assistant

To execute this plan, provide the following instructions to your AI (Claude/Gemini):

1. **Refactor `detection.py`**: Remove CLIP dependencies. Integrate `google-generativeai` SDK. Use Gemini 2.5 Flash for image analysis.
2. **Update `storage_manager.py`**: Replace local file saving with Firebase Storage `upload_blob` functionality.
3. **Database Migration**: Create a service to push detection results to Firestore instead of a local CSV or SQLite.
4. **Frontend Map Component**: Create a React/Vue component that renders a Google Map with a draggable marker. Bind the marker's position to the report form state.
5. **Cost Optimization**: Ensure all API calls are cached where possible and Gemini is called only once per report to minimize token usage.

---

## 7. Cost Management Tips
- **Gemini**: Stay under 15 requests per minute to remain in the Free Tier.
- **Firebase**: Monitor the 5GB storage limit. Implement a cleanup script to delete reports older than 30 days if storage fills up.
- **Maps**: Use the "Free Usage Caps" feature in the Google Cloud Console to prevent any charges if usage spikes.
