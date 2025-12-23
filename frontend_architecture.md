## Feature-Sliced-Design
This project's frontend follows the principles of FSD (Feature-sliced-design) to ensure maintainability and structure.

### Shared 
src/shared/
├── api/                  # Base API configuration
│   ├── axios.ts           # Your Axios instance with global settings
│   ├── auth0.ts          # The Auth0 server client you shared
│   └── index.ts          # Public API: exports everything from api/
├── lib/                  # Infrastructure and third-party wrappers
│   ├── i18n/             # Next-intl logic
│   └── index.ts          # Public API for library helpers
├── ui/                   # Your UI Kit (generic components only)
│   ├── Button/           # Simple Mantine wrappers
│   ├── BackButton.tsx    # Generic back navigation
│   └── index.ts          # Public API for UI components
└── types/                # Project-wide global types
└── index.ts          # Generic interfaces (e.g., Pagination, API responses)