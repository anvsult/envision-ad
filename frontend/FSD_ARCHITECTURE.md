# FSD Architecture - EnVision Ad Frontend

The project follows Feature-Sliced Design (FSD) with Next.js App Router and next-intl for i18n.

## Project Structure

```
frontend/
├── app/                              # Next.js App Router (routes only)
│   ├── [locale]/                     # Internationalized routes
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home route (re-exports from src/pages)
│   │   ├── browse/                   # Browse route
│   │   ├── business/                 # Business route
│   │   ├── dashboard/                # Dashboard route
│   │   └── medias/[id]/              # Media detail route
│   └── ...
├── pages/                            # Documentation only (avoid legacy pages router)
│   └── README.md
├── public/                           # Static assets (images)
├── proxy.ts                          # Local dev proxy setup
├── Dockerfile                        # Container setup
├── eslint.config.mjs                 # Eslint config (includes FSD rules)
├── tsconfig.json                     # TS config with path aliases
├── next.config.ts                    # Next.js config
└── src/                              # FSD layers
    ├── app/                          # App-wide setup
    │   └── providers/                # Global providers (Mantine, theme, i18n, auth)
    ├── pages/                        # Page components (used by App Router)
    │   ├── home/
    │   ├── browse/
    │   ├── dashboard/
    │   ├── business/
    │   └── media-detail/
    ├── widgets/                      # Composite UI blocks
    │   ├── business-dashboard/
    │   └── media-dashboard/
    ├── features/                     # User interactions
    │   ├── business-management/
    │   └── media-management/
    ├── entities/                     # Domain entities
    │   ├── businesses/               # Business domain (API, model, UI)
    │   └── media/                    # Media domain (API, model, UI)
    └── shared/                       # Reusable infrastructure
        ├── ui/                       # UI kit (Header, Footer, Cards, Grid, etc.)
        │   ├── Header/
        │   ├── BrowseActions/
        │   ├── Cards/
        │   ├── Carousel/
        │   ├── Footer/
        │   ├── Grid/
        │   ├── Partners/
        │   └── StatusBadge/
        ├── config/                   # Theme, constants
        ├── api/                      # HTTP client
        ├── i18n/                     # Internationalization helpers (navigation, routing)
        └── auth0/                    # Auth configuration
```

## Layer Responsibilities

- app (`src/app/`): global setup and providers only.
- pages (`src/pages/`): page composition using widgets, features, entities, shared; exported for App Router.
- widgets (`src/widgets/`): composite UI combining features/entities; reusable and self-contained.
- features (`src/features/`): user interactions, forms, modals, hooks.
- entities (`src/entities/`): domain logic, types, and API (businesses, media).
- shared (`src/shared/`): business-agnostic UI and infra (Header, language picker, navigation).

## Next.js App Router

App routes live under `app/[locale]/...` and re-export page components from `src/pages/`.

Example:

```tsx
// app/[locale]/browse/page.tsx
export { BrowsePage as default } from "@/pages/browse";
```

This keeps routing thin and FSD layers clean inside `src/`.

## Import Rules (FSD)

Allowed dependencies (bottom → top):
- app → pages, widgets, features, entities, shared
- pages → widgets, features, entities, shared
- widgets → features, entities, shared
- features → entities, shared
- entities → shared
- shared → none

Avoid cross-layer imports that break hierarchy or create cycles.

## Path Aliases (tsconfig.json)

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/app/*": ["./src/app/*"],
    "@/pages/*": ["./src/pages/*"],
    "@/widgets/*": ["./src/widgets/*"],
    "@/features/*": ["./src/features/*"],
    "@/entities/*": ["./src/entities/*"],
    "@/shared/*": ["./src/shared/*"]
  }
}
```

## Best Practices

- Colocate UI, hooks, and types within each slice.
- Expose public APIs via `index.ts` in each slice.
- Avoid circular dependencies and cross-layer leaks.
- Keep features independent and focused on interactions.
- Maintain entity purity (domain logic only; optional entity-specific UI).
- Ensure shared UI is business-agnostic and reusable.

## FSD Lint & Slice Health

The steiger FSD plugin may report warnings like insignificant slices:
- If a slice has only one reference, consider merging it into the consumer feature.
- If a slice has zero references, remove it or wire it into the app.
- You can suppress specific slices via the plugin config if intentionally isolated.

## Notes

- `src/shared/ui/Header/Header.tsx` implements the top navigation, language picker, and Auth0 user menu; consumed by layouts/pages.
- `src/entities/businesses` and `src/entities/media` contain typed APIs and models (`BusinessService`, `MediaService`, `BusinessTypes`, `MediaTypes`, `MediaAdStatus`).
- `src/shared/i18n` provides `Link` and `usePathname` helpers used across UI.

## References

- Feature-Sliced Design: https://feature-sliced.design/
- FSD with Next.js Guide: https://feature-sliced.design/docs/guides/tech/with-nextjs
- Next.js App Router: https://nextjs.org/docs/app
