
<div align="center">

# 🚗 Namma Bengaluru GTA

### Bengaluru: City of Dreams

An open-world 3D action-adventure game set in the bustling streets of Bengaluru, Karnataka. Built directly for the web with browser-native physics, real-time 3D rendering, and procedural audio.

**Three.js** • **Cannon-es** • **Vite** • **Web Audio API** • **HTML5 Canvas**

Explore iconic landmarks, hijack BMTC buses, dodge Bengaluru traffic, or trigger high-speed police chases across the city.

[Overview](#-overview) • [Features](#-features) • [Controls](#-controls) • [Architecture](#-how-it-works) • [Repository Structure](#-repository-structure) • [Quick Start](#-quick-start) • [Troubleshooting](#-troubleshooting)

</div>

---

## 🌍 Overview

**Namma Bengaluru GTA** brings open-world urban exploration to your web browser. Drive around faithful virtual representations of famous Bengaluru corridors, navigate dynamic traffic, interact with reactive AI pedestrians, and face off against Karnataka Police interceptors.

The game pipeline integrates five core systems:

1. **PBR 3D Scene (Three.js):** Renders urban corridors, dynamic vehicle models, daylight shaders, and lighting.
2. **Rigid Body Physics (Cannon-es):** Simulates vehicle suspension, steering torque, high-velocity collisions, and destructible props.
3. **Procedural Web Audio:** Generates dynamic engine RPM sounds, BMTC pneumatic air horns, ambient traffic, and police sirens without relying on heavy external audio assets.
4. **Autonomous AI Agents:** Directs multi-lane vehicular traffic and pedestrian sidewalk wanderers capable of initiating retaliatory melee fights.
5. **Heads-Up Display (HUD):** Provides live-rendered glassmorphism dashboard gauges, a mini-radar, and an expandable interactive city map.

---

## ✨ Features

- 🏙️ **Authentic Bengaluru Map:** Detailed roads including Dr. B.R. Ambedkar Road, Malleshwaram Margosa Road, Silk Board & Hebbal flyovers, Cubbon Park, fuel stations, and tech parks.
- 🚌 **Iconic Drivable Vehicles:** Take the wheel of sedans, sports cars, auto-rickshaws, and iconic BMTC transit buses (Routes 335E & 500D).
- 🛞 **Dynamic Vehicle Dynamics:** Realistic acceleration curves, drift/braking, reverse gear, weight distribution, and steering physics.
- 🤼 **Pedestrian AI & Retaliation:** City residents stroll the walkways; bump into or attack them, and they engage in dynamic street melee combat.
- 🚨 **5-Star Wanted System:** Smashing barricades, stalls, or civilians alerts Karnataka Police squad cars equipped with pursuit AI, flashers, and sirens.
- 💀 **Classic "WASTED" Screen:** Triggers upon fatal impacts, high-speed vehicle ejections, or zero-health states.
- 🗺️ **Full-Screen Interactive Map:** Press `M` to inspect live vehicle GPS markers, landmarks, and zoom across the district layout.
- 🔊 **Synthetic 3D Audio:** Custom audio synthesizers emulate high-pitch auto horns, air bus horns, crash impacts, and Doppler-effect sirens.

---

## 🎮 Controls

| Action | Keyboard | Touch / On-Screen |
|---|---|---|
| **Move / Drive** | `W` `A` `S` `D` or `Arrow Keys` | `▲ SPEED` / `▼ BRAKE` / `◀ ▶ STEER` |
| **Sprint** | `Shift` | — |
| **Jump / Handbrake** | `Space` | `HANDBRAKE` |
| **Enter / Exit Vehicle** | `E` | `[E] DRIVE` / `[EXIT]` |
| **Enlarge City Map** | `M` | Tap Minimap or `[M]` |
| **Vehicle Horn** | `H` | `📢 HORN` |
| **Camera View** | `C` *(1st / 3rd-person toggle)* | — |
| **Pause Game** | `Esc` | — |

---
## 🧱 How It Works

```mermaid
graph TD
    subgraph Client ["Client Browser (index.html & HUD)"]
        UI["Glassmorphism HUD, Minimap & Speedometer"]
        Input["W A S D, Touch pedals, E, H, Space, M"]
        Audio["Procedural Web Audio (BMTC horns, RPM, sirens)"]
        Renderer["Three.js 3D WebGL Viewport"]
    end

    subgraph Engine ["Game Engine (Vite Bundler)"]
        Physics["Cannon-es Physics World (Suspension & Collisions)"]
        City["Bengaluru Map (Roads, Flyovers, Buildings)"]
        TrafficAI["Vehicle AI (BMTC buses, autos, cars)"]
        PedAI["Pedestrian AI (Sidewalk walk, melee retaliation)"]
        Police["Wanted System (1-5 Stars, Karnataka Police chase)"]
    end

    Input -->|"Drive, sprint, horn, interact"| Physics
    Input -->|"Toggle map, horn sound"| UI
    Physics -->|"Body transforms & velocity"| Renderer
    City -->|"Mesh geometry & PBR textures"| Renderer
    TrafficAI -->|"Pathfinding & raycast avoidance"| Physics
    PedAI -->|"Aggro & damage detection"| Physics
    Police -->|"Pursuit & interceptor sirens"| Physics
    Physics -->|"Speed RPM, impacts, sirens"| Audio
    Physics -->|"Live coordinates & speed"| UI
'''
📂 Repository Structure
nama-banglore-gta-game/
├── public/              # Static assets, textures, and UI icons
├── src/
│   ├── audio/           # Procedural Web Audio API sound synthesizers
│   ├── entities/        # Player, Pedestrian, and Vehicle controller classes
│   ├── physics/         # Cannon-es world setup, colliders, and bounding bodies
│   ├── world/           # Three.js map geometry, roads, buildings, and lighting
│   ├── ui/              # Canvas HUD, Glassmorphism cockpit, and minimap
│   └── main.js          # Main game loop and engine orchestration
├── index.html           # Root entry HTML
├── package.json         # Project scripts and dependencies
├── vite.config.js       # Vite build setup
└── README.md            # Project documentation

🚀 Quick Start
Prerequisites
 * Node.js (v16.0 or higher recommended)
 * npm or yarn
 * Modern WebGL2-compatible browser (Chrome, Edge, Firefox, or Safari)
1. Clone the Repository
git clone [https://github.com/KiranJITdesign/nama-banglore-gta-game.git](https://github.com/KiranJITdesign/nama-banglore-gta-game.git)
cd nama-banglore-gta-game

2. Install Dependencies
npm install

3. Launch Development Server
npm run dev

Navigate to http://localhost:3000/ (or the local URL printed in your terminal) to play.
4. Build for Production
npm run build
npm run preview

🧰 Troubleshooting
| Problem | Fix |
|---|---|
| Low FPS / Stuttering | Ensure Hardware Acceleration is enabled in your browser settings (chrome://settings/system). |
| No Sound / Horns Silent | Web browsers require a user interaction before allowing audio. Click anywhere on the game canvas to resume the Web Audio Context. |
| Physics Clipping / Falling Through Map | Lower the physics substep interval or reload the scene if the browser tab was suspended in the background. |
📝 Notes
 * Runs best on desktop GPUs with WebGL2 support.
 * Performance scaling can be tuned inside your graphics/rendering setup file (src/main.js).

