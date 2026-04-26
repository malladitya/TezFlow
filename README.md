<div align="center">
  <img src="assets/Logo2.png.png" alt="TezFlow Logo" width="200" />
  <h1>TezFlow</h1>
  <p><strong>National Logistics Intelligence & Supply Chain Optimization Platform</strong></p>
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![UI: Earthbound Tactical](https://img.shields.io/badge/UI-Earthbound_Tactical-0f1419.svg)](https://github.com/)
</div>

<br>

**TezFlow** (NSCNS) is an enterprise-grade, resilient logistics prototype designed to dynamically optimize supply chains. It continuously analyzes transit and operational signals, detects disruption patterns early via AI, and triggers auto-rerouting and resource allocation before localized failures cascade into broad delays.

---

## ✨ Core Capabilities

1. **Continuous Monitoring Cycles:** Replaces static scenario runs with an always-on, live-analyzing heartbeat engine.
2. **Predictive Disruption Response:** Threshold-based auto-rerouting using a live "Chaos Score."
3. **Dynamic Route Intelligence:** Fetches real-world geometry and distances using Open Source Routing Machine (OSRM) and OpenRouteService.
4. **Multi-Signal Fusion:** Merges external live weather (Open-Meteo), active traffic status, and field operations into a single dashboard.
5. **Cross-Terminal Synchronization:** A shared heartbeat powered by a `BroadcastChannel` event bus, keeping the National HQ, Warehouse, and Driver terminals perfectly in sync.

## 🖥️ System Surfaces

TezFlow is composed of three interconnected front-end terminals:

| Terminal | Path | Description |
| :--- | :--- | :--- |
| **National HQ** | `index.html` / `hq.html` | High-level Command Center. Displays the Bento UI, Chaos Score, and live predictions. |
| **Warehouse Dashboard** | `warehouse.html` | Logistics node view for managing inventory transfers and responding to dispatch requests. |
| **Driver Portal** | `driver.html` | Edge-level view for fleet units to receive automated reroutes and report local road congestion. |

## 📂 Project Structure

```text
supplychain/
├── index.html           # Landing / Access Terminal
├── hq.html              # National Command Center
├── warehouse.html       # Warehouse / Dispatch Node
├── driver.html          # Fleet / Driver Interface
├── assets/              # Logos and UI assets
├── css/                 
│   └── styles.css       # Unified Earthbound Tactical Design System
├── js/
│   ├── script.js        # HQ analysis engine & core heartbeat
│   ├── map.js           # Leaflet routing, rendering, & providers
│   ├── events.js        # Real-time BroadcastChannel Event Bus
│   ├── features.js      # Core intelligence modules (Chaos, Predictions)
│   ├── flood-demo.js    # Cinematic Punjab Flood Demo sequencer
│   ├── auth-check.js    # Firebase Auth logic
│   └── supabase.js      # Cloud synchronization fallback
├── data/
│   └── route-snapshots.js # Offline, rate-limit-proof OSRM geometries
└── docs/                
    ├── working.md       # Demo recording script & walkthrough
    └── presentation.md  # Extended project details
```

## 🚀 Quick Start (Local Run)

TezFlow utilizes module imports and strict CORS rules for fetching external route geometries. It **must** be run via a local HTTP server.

1. Clone the repository.
2. Start a local static server (e.g., using VS Code Live Server, Python `http.server`, or Node `serve`).
   ```bash
   # Example using Python 3
   python -m http.server 5500
   ```
3. Open the terminals in separate browser windows to test the real-time event bus:
   - `http://localhost:5500/index.html`
   - `http://localhost:5500/hq.html`
   - `http://localhost:5500/driver.html`

## 🎬 Running the Crisis Demo

To demonstrate TezFlow's self-healing capabilities, you can trigger the **Punjab Flood Scenario**:

1. Open **HQ Command** and **Driver Portal** in side-by-side windows.
2. In the HQ top navigation bar, click the **🌊 Demo** button.
3. Watch as the system detects the severe weather anomaly in Punjab, spikes the Chaos Score, and initiates the "Emergency Mode."
4. Look at the Driver Portal map—witness the AI completely drop the flooded route and recalculate a massive 9,000+ point geometric bypass through Rajasthan in real-time.
5. In HQ, observe the Dynamic Allocation engine automatically reroute food, fuel, and medical supplies to stabilize the region.

## 🌩️ Live Data Integrations

* **Route Intelligence:** Integrates with **OSRM Demo** and **OSMDE Car** to pull actual road networks instead of straight lines. Distances and estimated durations are fed into the transit pressure calculations. (Supports *OpenRouteService* with an optional API key).
* **Weather Intelligence:** Fetches live weather constraints from **Open-Meteo** on a 10-minute cycle, instantly modifying the base friction of regional roads based on precipitation and wind conditions.

## ☁️ Cloud Deployment

TezFlow is fully deployment-ready as a static application on **Vercel** or **GitHub Pages**.

To deploy with optional Google Gemini AI summaries enabled:
1. Connect the repository to Vercel.
2. In Vercel Project Settings > Environment Variables, add your `GEMINI_API_KEY`.
3. Deploy! The front-end will serve statically, and the AI routes will execute via Vercel Serverless Functions (`/api/gemini-brief`).

---
<div align="center">
  <i>"Predict the disruption. Preempt the delay."</i>
</div>
