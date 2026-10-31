# nama-banglore-gta-game

# BENGALURU: CITY OF DREAMS
> 3D Open-World Action Adventure Game set in Bengaluru, Karnataka, India. Built with Three.js, Cannon-es Physics, and Vite.

---

## 🎮 Gameplay Features

- **Open-World Bengaluru Map:** Explorable city featuring Dr B R Ambedkar Road, Margosa Road (Malleshwaram), Silk Board / Hebbal Elevated Flyover, Cubbon Park, Petrol Bunk (Fuel Station), Tech Park Towers, and BMTC Bus Stops.
- **Drivable Vehicles:** Approach and enter any car, sports car, BMTC City Bus, or Bengaluru auto-rickshaw using `E`.
- **Dynamic Driving Physics & Controls:** Acceleration, high speed, braking, reverse gear, steering, handbrake, and realistic engine audio synthesis.
- **On-Screen Driving Cockpit Controls:** Floating pedals for speed, brake, steer left/right, horn, and exit vehicle.
- **Traffic AI Simulation:** Moving BMTC buses (Routes 335E & 500D), sports cars, sedans, SUVs, and auto-rickshaws with radar collision avoidance and spatial horn honking.
- **Autonomous Pedestrians & Retaliation:** Bengaluru residents walk along sidewalks. Disturbing or attacking citizens triggers angry self-defense melee brawls that deal damage to the player.
- **Destructible Property & Police Chase:** Ramming police barricades, trash bins, or stalls smashes them and triggers the **Wanted Level** (1 to 5 stars). Karnataka Police Interceptors pursue the player with flashing lightbars and oscillating sirens.
- **GTA-Style "WASTED" Screen:** Collision lethality when hit by oncoming traffic or police vehicles.
- **Enlarged Fullscreen City Map:** Press `M` or click the minimap to inspect the entire city with live vehicle positions and pan/zoom navigation.
- **Procedural 3D Audio (Web Audio API):** Authentic BMTC bus air horns, car horns, auto peep-peep, engine RPM, footsteps, crash impacts, and police sirens.

---

## ⌨️ Controls

| Action | Keyboard | On-Screen / Touch |
|---|---|---|
| **Move / Drive** | `W` `A` `S` `D` or `Arrow Keys` | `▲ SPEED` / `▼ BRAKE` / `◀ ▶ STEER` |
| **Sprint** | `Shift` | |
| **Jump / Handbrake** | `Space` | |
| **Enter / Exit Vehicle** | `E` | `[E] DRIVE` / `[EXIT]` |
| **Enlarge City Map** | `M` | Click Minimap or `[M]` |
| **Vehicle Horn** | `H` | `📢 HORN` |
| **Camera View** | `C` (3rd-person / 1st-person) | |
| **Pause Menu** | `Esc` | |

---

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/KiranJITdesign/nama-banglore-gta-game.git
cd nama-banglore-gta-game

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:3000/` in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Three.js** - 3D Graphics & PBR Rendering
- **Cannon-es** - Rigid Body Physics Simulation
- **Vite** - Modern Fast Build Tool
- **Web Audio API** - Procedural Real-time Audio Synthesis
- **HTML5 Canvas / CSS3** - Cinematic Glassmorphism HUD & Minimap
