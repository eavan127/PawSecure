
# 🐾 PawGuard AI

> **Saving Lives, One Paw at a Time.**  
> An AI-powered platform for stray animal rescue, disaster management, and adoption.

## 💡 Inspiration
During natural disasters like floods or earthquakes, pets and stray animals are often the forgotten victims. We noticed a lack of coordinated systems to track stranded animals or manage rescue operations efficiently. **PawGuard AI** was born out of the desire to bridge the gap between technology and animal welfare, giving NGOs and rescuers a powerful tool to save lives.

## 🚀 What it does
PawGuard AI is a comprehensive mobile application designed for two main user groups: **Public Users** and **NGOs/Rescuers**.

*   **🔍 AI-Powered Detection**: proof-of-concept integration using **YOLOv11** to automatically detect and classify animals (dogs/cats) from camera feeds or uploaded images.
*   **🚨 Disaster Mode**: A specialized specialized real-time emergency system that activates during crises (e.g., floods, earthquakes). It geofences disaster zones and prioritizes rescue requests within those areas.
*   **📍 Location-Based Reporting**: Users can pin locations of stray or injured animals, creating a live map for rescuers.
*   **🏡 Adoption Platform**: A "Tinder-like" interface for browsing adoptable pets, making it easier for animals to find forever homes.
*   **📊 NGO Dashboard**: A dedicated command center for organizations to manage reports, track rescue status, and coordinate volunteer efforts.

## ⚙️ How we built it
We built PawGuard AI using a modern, scalable tech stack:

*   **Frontend**: React Native with **Expo (SDK 54)** for a cross-platform mobile experience.
*   **Backend**: 
    *   **Supabase** for real-time database, authentication, and storage.
    *   **Python (Flask)** running a custom **YOLOv11** model for object detection.
*   **AI/ML**: **YOLOv11n** (Nano) model, optimized for speed and accuracy in detecting dogs and cats.
*   **Maps & Location**: Integration with **Expo Location** and Maps to provide precise geolocation for reports and disaster zones.
*   **Design**: Custom design system with **Expo Linear Gradient** and **Reanimated** for smooth, engaging UI interactions.

## ✨ Key Features & Highlights

### 1. Intelligence & Automation
Instead of manual data entry, our **YOLOv11 Backend** analyzes possibilities of animals in images instantly.
> *"Is that a dog or a cat?"* -> PawGuard knows instantly.

### 2. Real-Time Disaster Response
When a disaster strikes (e.g., "Sabah Earthquake Zone"), the app switches context.
*   **Dynamic Geofencing**: Users inside the zone get specific alerts.
*   **Priority Queue**: Operations in disaster zones are flagged as "Critical".
*   **Live Updates**: Rescuers see reports pop up in real-time via Supabase subscriptions.

### 3. Community Driven
*   **Gamification**: Users earn points/badges for reporting and helping (concept).
*   **Adoption Spotlight**: Highlighting urgent adoption cases to the community.

## 🛠️ Installation & Setup (For Judges)

### Prerequisites
*   Node.js & npm/yarn
*   Python 3.10+
*   Expo Go app on your phone (or Android/iOS Simulator)

### Step 1: Clone the Repo
```bash
git clone https://github.com/Jessy123123/PawGuard_AI.git
cd PawGuard_AI
```

### Step 2: Backend Setup (YOLO)
The AI detection runs on a local Python server.
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*You should see: `✅ YOLOv11 model loaded! Running on http://0.0.0.0:5000`*

### Step 3: Frontend Setup
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    EXPO_PUBLIC_YOLO_BACKEND_URL=http://YOUR_LOCAL_IP:5000
    ```
    *(Replace `YOUR_LOCAL_IP` with your machine's local IP address, e.g., `192.168.1.5`)*

3.  **Run the App**:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with **Expo Go**.

## 📱 Usage Guide
1.  **Login**: Use the demo credentials or sign up.
    *   *Demo NGO Account*: `ngo@pawguard.com` / `password123` (If applicable)
2.  **Report**: Tap the **Camera** icon. Snap a photo of a pet. Watch the AI detect it!
3.  **Disaster Mode**: Navigate to the "Disaster" tab to see active zones (mocked for demo purposes).

## 🧠 Challenges we ran into
*   **Real-time Synchronization**: Keeping the rescue status updated across all devices instantly was tricky. We solved this using **Supabase Realtime** subscriptions.
*   **AI on Mobile**: Running heavy models on phones is hard. We offloaded the heavy lifting to a lightweight **Flask API** serving YOLOv11, ensuring the app remains buttery smooth.

## 🏆 Accomplishments that we're proud of
*   Successfully integrating a custom **Python AI Backend** with a **React Native** frontend.
*   Creating a **Disaster Management System** that can genuinely help in emergencies.
*   The smooth, animated UI that makes the app feel premium and trustworthy.

## 🔮 What's next for PawGuard AI
*   **Offline Mode**: Caching reports for areas with poor connectivity.
*   **Vet Integration**: Connect injured animals directly with nearby clinics.
*   **Donation Gateway**: Allow users to fund specific rescue missions directly.

---

**Built with ❤️ for the KitaHack 2026**
