frontend/
│
├── public/
│
├── src/
│
│   ├── pages/                     # Route-level views
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── UserDetail.jsx
│   │   ├── Persona.jsx
│   │   ├── Simulation.jsx
│   │   ├── Risk.jsx
│   │   ├── Reports.jsx
│   │   └── OSINT.jsx             🔥 (ADD)
│
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Badge.jsx
│   │
│   │   ├── dashboard/
│   │   │   ├── HeroRiskPanel.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── RiskBreakdown.jsx
│   │   │   ├── AttackIntelligence.jsx
│   │   │   ├── ActivityFeed.jsx
│   │   │   └── QuickActions.jsx
│   │
│   │   ├── users/
│   │   │   ├── UserTable.jsx
│   │   │   ├── UserCard.jsx
│   │   │   └── UserProfile.jsx
│   │
│   │   ├── osint/
│   │   │   ├── ScanForm.jsx
│   │   │   ├── ScanList.jsx
│   │   │   └── ScanCard.jsx
│   │
│   │   ├── persona/
│   │   │   ├── PersonaRadar.jsx
│   │   │   ├── TraitCard.jsx
│   │   │   └── PersonaSummary.jsx
│   │
│   │   ├── simulation/
│   │   │   ├── AttackTimeline.jsx
│   │   │   ├── AttackCard.jsx
│   │   │   └── SimulationList.jsx
│   │
│   │   ├── risk/
│   │   │   ├── RiskScoreCard.jsx
│   │   │   ├── RiskHistoryChart.jsx
│   │   │   └── RiskBreakdownChart.jsx
│   │
│   │   ├── reports/
│   │   │   ├── ReportPreview.jsx
│   │   │   └── ExportButton.jsx
│
│   ├── api/                      🔥 BACKEND CONNECTION LAYER
│   │   ├── config.js
│   │   ├── apiClient.js
│   │   ├── users.js
│   │   ├── osint.js
│   │   ├── persona.js
│   │   ├── simulation.js
│   │   ├── risk.js
│   │   └── reports.js
│
│   ├── hooks/                    🔥 DATA FLOW LAYER (CRITICAL)
│   │   ├── useUsers.js
│   │   ├── useOSINT.js
│   │   ├── usePersona.js
│   │   ├── useSimulation.js
│   │   ├── useRisk.js
│   │   └── useReports.js
│
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── getRiskColor.js
│   │   └── constants.js
│
│   ├── App.jsx                   🔥 ROUTING
│   ├── main.jsx
│   └── index.css