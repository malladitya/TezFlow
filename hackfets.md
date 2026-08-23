# TezFlow

## National Supply-Chain Nervous System

TezFlow is an AI-enabled supply-chain control platform that helps teams detect disruptions early and coordinate a fast response.

It is designed for situations such as floods, severe weather, shortages, route closures, and sudden demand increases where delays can affect food, medicine, fuel, and other essential goods.

## The Problem

Supply-chain teams often receive important information from disconnected sources:

- Weather warnings
- Traffic and road conditions
- Warehouse inventory
- Delivery status
- Regional demand
- Driver and carrier updates

Because this information is fragmented, teams may discover a problem only after deliveries are delayed or supplies run short. Decisions are often made through phone calls, spreadsheets, and incomplete updates.

## The TezFlow Solution

TezFlow creates one shared operational view for supply-chain teams. It:

1. Collects weather, route, traffic, demand, and operational signals.
2. Combines these signals into a regional **Chaos Score**.
3. Identifies regions and routes that may become high risk.
4. Explains the likely impact in clear language.
5. Recommends actions such as rerouting vehicles or transferring stock.
6. Synchronizes decisions across headquarters, warehouses, and drivers.
7. Connects approved actions to SAP through a secure backend API.

## Who Uses TezFlow?

### Regional Logistics Control Teams

Monitor national or regional supply conditions and coordinate the response.

### Warehouse Managers

Track stock levels, approve transfers, and prepare supplies for high-risk regions.

### Drivers and Fleet Operators

Receive updated routes and report congestion or field conditions.

### Relief and Healthcare Teams

Help prioritize medicine, food, and other critical supplies for affected communities.

### Government and Enterprise Coordinators

Make accountable decisions across public and private logistics networks.

## How AI Is Used

AI is used as a decision-support layer:

- **Detect:** Identify rising disruption risk from multiple signals.
- **Predict:** Estimate how delays or shortages may spread.
- **Explain:** Produce an operational brief in plain language.
- **Recommend:** Suggest routes, transfers, and emergency priorities.
- **Learn:** Record response outcomes for future improvement.

The AI does not replace the responsible manager. It recommends and explains; a human validates local conditions and approves high-impact actions.

## Role of SAP

SAP acts as the enterprise execution layer. After a logistics manager reviews and approves a recommendation, TezFlow can send a reroute request to an SAP freight-order API through the backend.

The SAP API key is kept on the server and is never exposed in browser code. If no SAP credentials are configured, the application uses a clearly labeled local dry-run mode for demonstrations.

## Main App Surfaces

- **HQ Command Center:** View the Chaos Score, risk regions, AI briefs, maps, and response controls.
- **Warehouse Dashboard:** Monitor inventory pressure and coordinate transfers.
- **Driver Portal:** Receive reroutes and report live road conditions.

## Example: Flood Response

1. Heavy rain makes a major route unsafe.
2. Weather and route signals increase the regional Chaos Score.
3. TezFlow identifies a risk to medicine and food deliveries.
4. The AI generates a short disruption brief and response strategy.
5. The control-room manager reviews the recommendation.
6. A safer route and warehouse transfer are approved.
7. The driver, warehouse, HQ, and SAP execution layer receive the updated action.

## What Makes TezFlow Different?

Most logistics tools show tracking information or report problems after they happen. TezFlow connects the complete response cycle:

> **Sense the disruption -> understand the risk -> explain the decision -> coordinate the teams -> execute the action.**

Its unique value is the combination of:

- Multi-signal disruption detection
- A simple Chaos Score for operational clarity
- Explainable AI recommendations
- Human approval and accountability
- HQ, warehouse, and driver synchronization
- SAP-connected execution
- Local fallback behavior for resilient demonstrations

## Expected Impact

TezFlow aims to help organizations achieve:

- Earlier disruption detection
- Faster response and rerouting
- Fewer cascading delays and stockouts
- Better use of vehicles and inventory
- More reliable delivery of essential goods
- Fairer prioritization of vulnerable regions
- A clearer audit trail for operational decisions

## Technology Overview

- HTML, CSS, and JavaScript frontend
- Leaflet map visualization
- Open-Meteo weather data
- OSRM and OpenRouteService routing options
- Supabase and browser event synchronization
- Google Gemini AI endpoints
- Vercel serverless API routes
- SAP OData integration route

## Run Locally

From the `supplychain` folder, start a local web server:

```bash
python -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/hq.html`
- `http://localhost:8000/warehouse.html`
- `http://localhost:8000/driver.html`

The frontend can run in fallback mode without API keys. For live services, configure environment variables on the backend:

```env
GEMINI_API_KEY=your_google_gemini_api_key
SAP_API_KEY=your_sap_api_key
SAP_BASE_URL=https://your-sap-host/sap/opu/odata/sap/
```

## One-Line Pitch

> TezFlow turns supply-chain disruption from a delayed reaction into an explainable, equitable, and SAP-executable response.
