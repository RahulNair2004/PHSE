backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   │
│   ├── database/
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── migrations/
│   │
│   ├── routes/
│   │   ├── user_routes.py
│   │   ├── osint_routes.py
│   │   ├── persona_routes.py
│   │   ├── simulation_routes.py
│   │   ├── scoring_routes.py
│   │   └── report_routes.py
│   │
│   ├── services/
│   │   ├── osint_service.py
│   │   ├── scraping_service.py
│   │   ├── persona_service.py
│   │   ├── style_analysis_service.py
│   │   ├── simulation_service.py
│   │   ├── scoring_service.py
│   │   ├── visualization_service.py
│   │   └── mitigation_service.py
│   │   
│   ├── ai/
│   │   ├── llm_engine.py
│   │   ├── embedding_engine.py
│   │   ├── stylometry_engine.py
│   │   └── prompt_templates.py
│   │
│   ├── utils/
│   │   ├── text_cleaner.py
│   │   ├── similarity.py
│   │   ├── risk_formula.py
│   │   ├── validators.py
│   │   └── logger.py
│   │
│   └── tests/
│       ├── test_osint.py
│       ├── test_persona.py
│       ├── test_scoring.py
│       └── test_simulation.py
│
├── requirements.txt
└── Dockerfile