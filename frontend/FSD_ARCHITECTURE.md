# FSD Architecture - EnVision Ad Frontend

This project follows the Feature-Sliced Design (FSD) methodology, adapted for Next.js App Router with internationalization support.

## Project Structure

```
frontend/
├── app/                              # Next.js App Router (root level)
│   ├── [locale]/                     # Internationalized routes
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home page (re-exports from src/pages)
│   │   ├── browse/                   # Browse route
│   │   ├── business/                 # Business management route
│   │   ├── dashboard/                # Dashboard route
│   │   └── medias/[id]/              # Media detail route
│   └── ...
├── pages/                            # Empty (prevents Next.js confusion)
│   └── README.md
├── middleware.ts                     # Next.js middleware (re-exports from src/shared/api)
└── src/                              # FSD layers
    ├── app/                          # App-wide setup
    │   └── providers/                # Global providers (Mantine, etc.)
    ├── pages/                        # Page components
    │   ├── home/
    │   ├── browse/
    │   ├── dashboard/
    │   ├── business/
    │   └── media-detail/
    ├── widgets/                      # Complex composite UI blocks
    │   ├── business-dashboard/
    │   └── media-dashboard/
    ├── features/                     # User interactions/features
    │   ├── business-management/
    │   │   ├── ui/                   # Modal, forms
    │   │   └── model/                # Hooks, business logic
    │   └── media-management/
    │       ├── ui/                   # Modal, forms, schedule selector
    │       └── model/                # Hooks, business logic
    ├── entities/                     # Business entities
    │   ├── business/
    │   │   ├── api/                  # API calls (BusinessService)
    │   │   ├── model/                # Types (BusinessTypes)
    │   │   └── ui/                   # Entity-specific UI (if needed)
    │   └── media/
    │       ├── api/                  # API calls (MediaService)
    │       ├── model/                # Types (MediaTypes, MediaAdStatus)
    │       └── ui/                   # Entity-specific UI (if needed)
    └── shared/                       # Reusable infrastructure
        ├── ui/                       # UI kit (Header, Footer, Cards, etc.)
        ├── config/                   # Theme, constants
        ├── api/                      # Proxy, HTTP client
        ├── i18n/                     # Internationalization
        └── auth0/                    # Authentication

```

## Layer Responsibilities

### App Layer (`src/app/`)

Contains application-wide initialization logic:

- **providers**: Global providers (Mantine, theme, etc.)
- Should NOT contain business logic or UI components

### Pages Layer (`src/pages/`)

Compositional layer for entire pages:

- Assembles widgets and features into complete pages
- Handles page-level logic and data fetching
- Each page folder contains:
  - `ui/`: Page component(s)
  - `index.ts`: Exports for Next.js App Router ()

### Widgets Layer (`src/widgets/`)

Complex composite UI blocks that combine multiple features:

- **business-dashboard**: Business management dashboard with table and actions
- **media-dashboard**: Media owner dashboard with navigation and media table
- Can use features, entities, and shared layers
- Should be relatively self-contained and reusable

### Features Layer (`src/features/`)

User-facing functionality and interactions:

- **business-management**: Business CRUD operations, forms, modals
  - `ui/`: BusinessModal, BusinessDetailsForm
  - `model/`: useBusinessForm, useBusinessList hooks
- **media-management**: Media CRUD operations, forms, modals
  - `ui/`: MediaModal, MediaDetailsForm, ScheduleSelector
  - `model/`: useMediaForm, useMediaList hooks
- Each feature is isolated and can be developed/tested independently

### Entities Layer (`src/entities/`)

Business domain entities with their data and operations:

- **business**:
  - `api/`: getAllBusinesses, createBusiness, updateBusiness, etc.
  - `model/`: BusinessTypes, CompanySize enum
  - `ui/`: Entity-specific UI components (if needed)
- **media**:
  - `api/`: getAllMedia, getMediaById, updateMedia, etc.
  - `model/`: MediaTypes, MediaAdStatus enum
  - `ui/`: Entity-specific UI components (if needed)
- Represents core business concepts
- Can only depend on shared layer

### Shared Layer (`src/shared/`)

Reusable infrastructure not tied to business logic:

- **ui/**: Reusable components (Header, Footer, Cards, Carousel, Grid, etc.)
- **config/**: Theme, constants, configuration
- **api/**: HTTP client, proxy middleware
- **i18n/**: Internationalization routing and navigation
- **auth0/**: Authentication configuration
- Cannot depend on any other FSD layers

## Next.js App Router Integration

The Next.js `app/` folder (at project root) serves as a routing layer that re-exports page components from `src/pages/`:

```tsx
// app/[locale]/browse/page.tsx
export { BrowsePage as default } from "@/pages/browse";
```

This approach:

- Keeps FSD structure clean in `src/`
- Allows Next.js routing to work as expected
- Maintains separation between routing and business logic

## Import Rules

### Allowed Dependencies (bottom to top):

- **app** → pages, widgets, features, entities, shared
- **pages** → widgets, features, entities, shared
- **widgets** → features, entities, shared
- **features** → entities, shared
- **entities** → shared
- **shared** → nothing (no FSD dependencies)

### Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@/app/*": ["./src/app/*"],
  "@/pages/*": ["./src/pages/*"],
  "@/widgets/*": ["./src/widgets/*"],
  "@/features/*": ["./src/features/*"],
  "@/entities/*": ["./src/entities/*"],
  "@/shared/*": ["./src/shared/*"]
}
```

## Best Practices

1. **Colocation**: Keep related files together (UI, hooks, types)
2. **Public API**: Use `index.ts` to expose only what's needed
3. **No Circular Dependencies**: Respect the layer hierarchy
4. **Feature Independence**: Features should not depend on each other
5. **Entity Purity**: Entities contain only domain logic, no UI
6. **Shared Reusability**: Shared components should be business-agnostic

## Migration Notes

- Old `src/components/` → split into `src/widgets/`, `src/features/ui/`, and `src/shared/ui/`
- Old `src/services/` → `src/entities/*/api/`
- Old `src/types/` → `src/entities/*/model/`
- Old `src/lib/` → `src/shared/i18n/` and `src/shared/auth0/`
- Old `src/app/[locale]/` → pages moved to `src/pages/`, routes to root `app/[locale]/`

## References

- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [FSD with Next.js Guide](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
