# PawSecure 🐾

> Extended from **PawGuardAI** (KitaHack 2026) — rebuilt with a production-ready stack for NGO stray animal rescue operations in Malaysia.

---

## What is PawSecure?

PawSecure is an AI-powered stray animal rescue platform designed for NGOs, SPCA branches, and volunteer rescue organisations. It enables organisations to report injured stray animals detected via CCTV, manage a live rescue queue, and maintain a permanent rescue archive — all powered by a custom-trained YOLO model.

### From PawGuardAI → PawSecure

| | PawGuardAI (KitaHack 2026) | PawSecure |
|--|--|--|
| Frontend | Expo Go (mobile) | Expo Router (web) |
| Backend | Flask (port 5000) | FastAPI (port 8000) |
| Database | Firebase | Supabase (PostgreSQL) |
| AI Model | YOLO + CLIP | YOLO11 fine-tuned + ResNet18 |
| Images | Temporary blob URLs | Supabase Storage (permanent) |
| Auth | Firebase Auth | Supabase Auth + RLS |
| Map | Basic | Leaflet / OpenStreetMap |

---

## Tech Stack

**Frontend**
- React Native Web (Expo Router)
- TypeScript
- Leaflet / OpenStreetMap

**Backend**
- Python FastAPI
- YOLO11 (fine-tuned on 4,168 stray animal images)
- ResNet18 (512-dim animal embeddings)
- OpenCV (injury severity detection)

**Database & Storage**
- Supabase PostgreSQL
- Supabase Auth (JWT + RLS)
- Supabase Storage (cloud image hosting)
- pgvector (animal embedding similarity search)

---

## Features

- 📷 **CCTV Upload** — upload images or video frames from CCTV footage
- 🤖 **AI Detection** — custom YOLO11 model detects dogs and cats with bounding boxes
- 🩸 **Injury Analysis** — OpenCV HSV colour analysis classifies injury as none / mild / moderate / severe
- 🗺️ **Live Map** — Leaflet map with severity-coloured markers for all pending animals
- 📋 **Rescue Queue** — NGOs browse, filter, and claim animals for rescue
- ✅ **Rescue Confirmation** — upload rescue photo to confirm and archive the rescue
- 🏠 **Rescue Archive** — permanent record of every rescued animal with stats
- 🔍 **Animal Re-ID** — ResNet18 embeddings stored in pgvector for same-animal matching
- 📊 **Org Dashboard** — live stats per organisation (reports, rescues, points)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase project (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/PawSecure.git
cd PawSecure
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_YOLO_BACKEND_URL=http://localhost:8000
```

### 4. Set up the Python backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### 5. Start the backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend docs available at: `http://localhost:8000/docs`

### 6. Start the frontend
```bash
# In a new terminal, from project root
npx expo start --web --clear
```

Open Chrome → `http://localhost:8081`

---

## AI Model

The YOLO model was fine-tuned on the [Stray Animal Detection 2](https://universe.roboflow.com/rep-rxi6f/stray-animal-detection-2) dataset from Roboflow:

- **4,168 training images** (after augmentation)
- **Classes:** cat (0), dog (1)
- **Training:** 50 epochs, 640×640, Google Colab T4 GPU
- **Base model:** YOLO11n (yolo11n.pt)

Animal re-identification uses **ResNet18** (torchvision, ImageNet weights) with the classification head removed — producing 512-dim L2-normalised embeddings stored in Supabase pgvector.

---

## Database Setup

Run `supabase_schema.sql` in your Supabase SQL Editor to create all tables, RLS policies, and indexes.

Also create a **Supabase Storage bucket**:
- Name: `animal-images`
- Public: ✅ ON

```sql
UPDATE storage.buckets SET public = true WHERE id = 'animal-images';
```

---

## Project Structure

```
PawSecure/
├── app/                    # Expo Router pages
│   ├── (auth)/             # Login, signup, landing
│   └── (tabs)/             # Map, animals, rescued, report, profile
├── screens/                # Main screen components
├── services/               # Supabase + YOLO API calls
├── contexts/               # Auth context
├── components/             # Reusable components (WebMap, etc.)
├── lib/                    # Supabase client + TypeScript types
├── theme/                  # Colors and spacing
├── backend/                # FastAPI Python server
│   ├── main.py             # All AI endpoints
│   ├── best.pt             # Fine-tuned YOLO model
│   └── dataset/            # Training dataset (not committed)
└── supabase_schema.sql     # Database schema
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check if backend is running |
| `/detect` | POST | YOLO animal detection (bbox + class) |
| `/embed` | POST | ResNet18 embedding for animal re-ID |
| `/injury` | POST | Injury severity classification |
| `/pipeline` | POST | YOLO + injury in one call |

All endpoints accept `{ "image": "<base64>" }` as input.

---

## Acknowledgements

- **PawGuardAI** — original hackathon concept (KitaHack 2026)
- [Roboflow Stray Animal Detection 2](https://universe.roboflow.com/rep-rxi6f/stray-animal-detection-2) — training dataset
- [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics) — object detection
- [Supabase](https://supabase.com) — database, auth, storage
- [OpenStreetMap](https://www.openstreetmap.org) / [Leaflet](https://leafletjs.com) — map
