frontend/
src/
├── components/
│   ├── chat/
│   │   ├── base/
│   │   │   ├── ChatInterface.tsx       # Base chat UI component
│   │   │   └── BaseServiceChat.tsx     # Base service chat with document handling
│   │   └── services/
│   │       ├── DatabaseChat.tsx        # Database-specific chat
│   │       ├── FinanceChat.tsx         # Finance-specific chat
│   │       ├── LegalChat.tsx           # Legal-specific chat
│   │       ├── MarketingChat.tsx       # Marketing-specific chat
│   │       └── RegistrationChat.tsx    # Registration-specific chat
│   └── database-chat/                  # Keep existing database components
├── services/
│   └── api/
│       ├── chat.ts                     # Chat API service
│       └── document.ts                 # Document upload service
└── pages/
    └── services/
        ├── database-insights.tsx
        ├── finance.tsx
        ├── legal.tsx
        ├── marketing.tsx
        └── registration.tsx



backend/
├── api/
│   ├── routes/
│   │   ├── chat_routes.py
│   │   └── service_routes/
│   │       ├── database_routes.py
│   │       ├── document_routes.py
│   │       ├── finance_routes.py
│   │       ├── legal_routes.py
│   │       ├── marketing_routes.py
│   │       └── registration_routes.py
│   └── services/
│       ├── service_handlers/
│       │   ├── database_handler.py
│       │   ├── finance_handler.py
│       │   ├── legal_handler.py
│       │   ├── marketing_handler.py
│       │   └── registration_handler.py
│       └── chat_service.py
├── core/
│   ├── database/
│   │   └── config.py
│   ├── document_processor/
│   │   └── processor.py
│   ├── rag/
│   │   └── retriever.py
│   └── sql_processor/
│       └── processor.py
├── main.py
├── requirements.txt
└── .env