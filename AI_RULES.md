# Dracindo AI Development Rules

## Tech Stack
*   **React 19**: Core UI framework using functional components and modern hooks.
*   **TypeScript**: Strict typing for all components, services, and data structures.
*   **Tailwind CSS 4**: Utility-first styling with a custom theme defined in `index.css`.
*   **Supabase**: Backend-as-a-Service for Authentication, Site Settings, and Analytics.
*   **Express.js**: Custom server for production hosting and dynamic sitemap generation.
*   **Vite**: High-performance build tool and development environment.
*   **DramaBox API**: External content provider for drama metadata and video streams.
*   **Netlify Functions**: Serverless execution for dynamic XML sitemap delivery.

## Library & Implementation Rules

### 1. Styling & UI
*   **Tailwind CSS**: Use Tailwind utility classes for all styling. Avoid writing raw CSS.
*   **Icons**: Use **Font Awesome 6** classes (e.g., `<i className="fas fa-play"></i>`) as the primary icon library.
*   **Glassmorphism**: Utilize the `.glass` and `.glass-light` utility classes for premium frosted-glass effects.
*   **Animations**: Use Tailwind's `animate-fade-in` and `transition-all` for smooth UI interactions.

### 2. Data Fetching & State
*   **Drama Content**: Always use the `dramaApi` service in `services/apiService.ts` for content related to dramas.
*   **Backend Services**: Use the `supabase` client for user authentication, site-wide settings, and page view analytics.
*   **Types**: Reference `types.ts` for all interfaces. Do not define local interfaces for shared data models.

### 3. Routing & Navigation
*   **State-Based Routing**: Follow the existing pattern in `App.tsx`. Use the `ViewMode` enum and the `navigate()` function which syncs with `window.history`.
*   **Path Syncing**: Ensure any new view is added to the `syncPathToState` logic to support deep-linking and browser back/forward buttons.

### 4. Component Architecture
*   **Atomic Design**: Keep components small and focused. Place reusable UI elements in `src/components/` and major views in their own files.
*   **Lazy Loading**: Use `React.lazy` and `Suspense` for all major view components to optimize initial bundle size.

### 5. SEO & Metadata
*   **Dynamic SEO**: Update document titles and meta tags within `App.tsx` using the established `useEffect` patterns.
*   **JSON-LD**: Inject structured data (Schema.org) for `VideoObject` and `TVSeries` when in Playing or Detail views.
*   **Sitemaps**: Keywords injected via the Admin Dashboard must be synced to `site_settings` in Supabase to be reflected in the dynamic sitemap.

### 6. Internationalization
*   **Translations**: Use the `translations.ts` dictionary. Access strings via the `t()` helper function provided in components.