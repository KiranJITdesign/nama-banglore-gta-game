<div align="center">🏙️ BENGALURU: CITY OF DREAMS

Explore, Drive, and Survive in an Open-World Bengaluru

""JavaScript" (https://img.shields.io/badge/Language-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)" (https://developer.mozilla.org/en-US/docs/Web/JavaScript)
""Three.js" (https://img.shields.io/badge/3D-Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)" (https://threejs.org/)
""Physics" (https://img.shields.io/badge/Physics-Cannon--es-5c3ee8?style=for-the-badge)" (https://github.com/pmndrs/cannon-es)
""Vite" (https://img.shields.io/badge/Build-Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)" (https://vite.dev/)
""Web Audio" (https://img.shields.io/badge/Audio-Web_Audio_API-f59e0b?style=for-the-badge)" (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

A 3D open-world action-adventure game set in Bengaluru, Karnataka. Explore the city, drive through traffic, interact with pedestrians, and experience dynamic police chases — all directly in your browser.

"Gameplay Features" (#-gameplay-features) • "Controls" (#-controls) • "How It Works" (#-how-it-works) • "Quick Start" (#-quick-start) • "Tech Stack" (#-tech-stack)

</div>---

🌍 Overview

BENGALURU: CITY OF DREAMS brings the streets of Bengaluru into an interactive 3D open-world gaming experience.

Explore recognizable locations, navigate through city traffic, drive different vehicles, and interact with an autonomous urban environment. From BMTC buses and auto-rickshaws to police pursuits and destructible roadside objects, the game recreates the energy of Bengaluru in a GTA-inspired setting.

The game combines five core systems:

1. 3D City Environment (Three.js): Renders an explorable Bengaluru-inspired city with roads, landmarks, buildings, parks, and infrastructure.
2. Physics-Based Gameplay (Cannon-es): Simulates vehicle movement, collisions, acceleration, braking, and interactions with the environment.
3. Vehicle System: Allows players to enter and drive cars, sports cars, BMTC buses, and auto-rickshaws.
4. AI Traffic & Pedestrians: Simulates autonomous city traffic, walking pedestrians, collision avoidance, and interactive NPC behavior.
5. Dynamic Audio & Police AI: Generates procedural vehicle sounds, horns, crashes, and sirens while triggering police pursuit based on player actions.

---

✨ Gameplay Features

- 🏙️ Open-World Bengaluru: Explore Dr. B. R. Ambedkar Road, Margosa Road, Cubbon Park, Silk Board, Hebbal Flyover, tech parks, petrol bunks, and BMTC bus stops.
- 🚗 Drivable Vehicles: Enter and drive cars, sports cars, BMTC city buses, and Bengaluru auto-rickshaws.
- 🏎️ Dynamic Driving Physics: Experience acceleration, steering, reverse gear, braking, handbrake, and engine RPM.
- 📱 Touchscreen Controls: Floating on-screen pedals, steering controls, horn, and vehicle exit buttons for mobile gameplay.
- 🚦 Intelligent Traffic AI: Simulated BMTC buses, sedans, SUVs, sports cars, and auto-rickshaws with collision avoidance.
- 🚶 Autonomous Pedestrians: Citizens walk around the city and react to player interactions, including self-defense behavior.
- 🚔 Police Chase System: Trigger a 1–5 star wanted level through destructive actions and escape pursuing Karnataka Police interceptors.
- 💥 Destructible Environment: Smash barricades, trash bins, and roadside stalls through vehicle collisions.
- ☠️ GTA-Style WASTED Screen: Experience collision-based player elimination.
- 🗺️ Interactive City Map: Expand the minimap to explore the city with live vehicle positions, pan, and zoom.
- 🔊 Procedural 3D Audio: Synthesized BMTC air horns, car horns, auto-rickshaw sounds, engine effects, footsteps, collisions, and police sirens.
- 🎥 Dynamic Camera: Switch between first-person and third-person driving perspectives.

---

🎮 Controls

Action| Keyboard| On-Screen / Touch
Move / Drive| "W" "A" "S" "D" / Arrow Keys| "▲ SPEED" / "▼ BRAKE"
Steer| "A" / "D" or Arrow Keys| "◀" / "▶"
Sprint| "Shift"| —
Jump / Handbrake| "Space"| —
Enter / Exit Vehicle| "E"| "[E] DRIVE" / "[EXIT]"
City Map| "M"| Click Minimap / "[M]"
Vehicle Horn| "H"| "📢 HORN"
Camera View| "C"| —
Pause Menu| "Esc"| —

---

🧱 How It Works

graph TD
    Player["Player Input<br/>Keyboard / Touch"] --> Controller["Game Controller"]
    Controller --> Movement["Player Movement"]
    Controller --> Vehicle["Vehicle System"]
    
    Vehicle --> Physics["Cannon-es Physics"]
    Physics --> Collision["Collision Detection"]
    Collision --> Destruction["Destructible Objects"]
    Collision --> Wanted["Wanted Level System"]
    
    Wanted --> Police["Police AI Pursuit"]
    
    World["Three.js 3D City"] --> Traffic["Traffic AI"]
    World --> Pedestrians["Pedestrian AI"]
    World --> Map["Interactive City Map"]
    
    Traffic --> Physics
    Pedestrians --> Interaction["NPC Interaction"]
    
    Vehicle --> Audio["Web Audio API"]
    Audio --> Sound["Procedural Audio<br/>Engine / Horn / Sirens"]
    
    Movement --> Camera["Dynamic Camera"]
    Vehicle --> Camera
    
    Controller --> HUD["HUD / Minimap / UI"]
    World --> HUD

---

📂 Repository Structure

nama-banglore-gta-game/
├── public/              # Static assets and game resources
├── src/                # Game source code
│   ├── main.js         # Main application entry point
│   ├── ...             # Game logic, physics, AI and rendering
├── index.html           # Main HTML entry point
├── package.json         # Dependencies and npm scripts
├── vite.config.js       # Vite configuration
└── README.md            # Project documentation

---

🚀 Quick Start

Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- A modern WebGL-compatible browser

1. Clone the Repository

git clone https://github.com/KiranJITdesign/nama-banglore-gta-game.git
cd nama-banglore-gta-game

2. Install Dependencies

npm install

3. Start the Development Server

npm run dev

Open the local URL displayed in your terminal. By default:

http://localhost:3000/

4. Build for Production

npm run build

5. Preview the Production Build

npm run preview

---

🛠️ Tech Stack

Technology| Purpose
Three.js| 3D rendering, environment, and PBR graphics
Cannon-es| Rigid-body physics and collision simulation
Vite| Development server and production build
JavaScript| Core game logic and interactivity
Web Audio API| Real-time procedural audio synthesis
HTML5 Canvas| Minimap rendering and visualization
CSS3| HUD, glassmorphism interface, and responsive controls

---

📝 Notes

- Designed as a browser-based 3D gaming experience.
- Best experienced in a modern browser with hardware acceleration enabled.
- Keyboard and touchscreen controls support different play styles.
- The game features Bengaluru-inspired locations, traffic, and urban elements.
- Built using Three.js, Cannon-es, and Vite.

---

<div align="center">🌆 Experience Bengaluru. Live the City. Own the Streets.

Developed by "KiranJITdesign" (https://github.com/KiranJITdesign)

</div>
