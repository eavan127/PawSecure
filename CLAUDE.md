# PawSecure — Claude Code Project Guide

## What This Project Is
A computer vision system for tracking and rescuing injured stray animals in Malaysia.
- CCTV/camera footage is analyzed by a Python AI backend (YOLO + CLIP)
- A React Native mobile app lets NGOs (SPCA, volunteers) see animals near them
- When rescued, the animal moves from a "pending rescue" list to a permanent archive
- NGOs have dashboards with analytics on rescued animals

## Repository Layout
```
PawSecure/
├── backend/         # Python AI server (FastAPI + YOLO + CLIP)
├── app/             # Expo Router screens (file-based routing)
├── screens/         # Screen component implementations
├── components/      # Reusable React Native UI components
├── contexts/        # React Context: Auth, Data, Report
├── services/        # Business logic + Supabase/Firebase API calls
├── lib/             # Supabase client, TypeScript types
├── types/           # TypeScript type definitions
├── theme/           # Design tokens (colors, spacing, typography)
└── supabase_schema.sql  # Database schema reference
```

## Tech Stack
- **Frontend**: React Native + Expo SDK 54, Expo Router
- **Backend**: FastAPI (Python) + Uvicorn, replacing old Flask server
- **Detection**: YOLOv8/v11 via Ultralytics
- **Re-identification**: OpenCLIP (open-clip-torch) for animal facial embeddings
- **Image processing**: OpenCV (opencv-python)
- **Database**: Supabase (PostgreSQL + pgvector for vector embeddings)
- **Auth**: Supabase Auth
- **Storage**: Firebase Storage (images)
- **Maps**: React Native Maps

## Backend Architecture (Critical to Understand)
The backend has TWO jobs:
1. **Detection** — YOLO finds animals in a frame and draws bounding boxes
2. **Re-identification** — CLIP generates a 512-dim embedding (a numerical fingerprint)
   of the cropped animal face/body, stored in pgvector so we can find the same
   animal across different camera angles and sightings

The injury classification runs on top of the YOLO detection result using a secondary
classifier or prompt-based logic (injury keywords: bleeding, limping, eye damage, skin).

## Running the Backend
```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Running the Frontend
```bash
npx expo start
```

## Environment Variables
See `.env.example`. Never commit `.env`.

## Database
Supabase project. Schema in `supabase_schema.sql`.
pgvector extension must be enabled for the `animal_embeddings` table.

## Coding Rules (Follow These)
- No comments that explain WHAT the code does — only WHY if non-obvious
- TypeScript strict mode — never use `any`
- Services handle all Supabase/API calls — screens never call Supabase directly
- Every animal gets a unique ID: format `PS-{YEAR}-{RANDOM6}`
- Injury severity must be one of: `none | mild | moderate | severe | critical`
- Animal status flow: `sighted → pending_rescue → rescued → archived`
- FastAPI routes use snake_case, TypeScript uses camelCase

## What NOT to Do
- Do not mix Firebase Auth and Supabase Auth — use Supabase Auth only
- Do not add features beyond what is requested
- Do not use Flask — the backend uses FastAPI now
- Do not commit model weight files (.pt) — they are gitignored
