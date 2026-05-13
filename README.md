# GinProjectReactFrontEnd

Production-style React frontend for the companion Go/Gin grocery API at `C:\git\GinProjectAPI`.

The app uses Vite, React Router, TanStack Query, Tailwind CSS, and JWT bearer authentication. It integrates with the backend routes:

```text
POST   /v1/auth/register
POST   /v1/auth/login
GET    /v1/products
GET    /v1/products/{id}
POST   /v1/products
PUT    /v1/products/{id}
DELETE /v1/products/{id}
GET    /v1/cart
PUT    /v1/cart/items/{productID}
DELETE /v1/cart/items/{productID}
DELETE /v1/cart
GET    /health/ready
```

## Run Locally

Start the API first:

```powershell
cd C:\git\GinProjectAPI
go run ./cmd/api
```

Install and run the frontend:

```powershell
cd C:\git\GinProjectReactFrontEnd
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/v1` and `/health` to `http://localhost:8080`, so local development does not need CORS changes.

Optional environment:

```powershell
Copy-Item .env.example .env
```

`VITE_API_BASE_URL` can point at a remote API. Leave it empty for same-origin/proxied requests.

## Architecture

```text
src/api                typed API clients for the Go routes
src/app                app composition, providers, routing
src/components         reusable layout and UI components
src/features/auth      JWT session storage, auth context, protected routes
src/features/cart      checkout workflow helpers
src/lib                formatting, environment, error helpers
src/pages              route-level screens
```

Key choices:

- `src/api/http.ts` owns fetch, JSON serialization, error parsing, and `Authorization: Bearer <token>` attachment.
- API modules expose domain-focused functions such as `productsApi.list` and `cartApi.setItem`.
- Query keys live beside API modules so cache invalidation is consistent.
- `AuthProvider` stores the JWT response in `localStorage`, rejects expired sessions, and clears the TanStack Query cache on logout.
- `ProtectedRoute` guards product writes and cart routes using React Router nested routing.
- `/products` is the customer shopping catalog; `/manage/store` is the protected inventory-management context.
- Route pages orchestrate UI state; reusable components stay presentational.

## Why These Technologies

- Vite: fast dev server, simple production build, environment variable support, and an easy dev proxy for the Go API.
- React Router: declarative nested routes, redirects after login, and protected route composition.
- TanStack Query: server-state cache, loading/error flags, retries, refetching, mutation handling, and targeted invalidation.
- Tailwind CSS: small design system directly in components, responsive layout utilities, and production CSS purging.
- JWT authentication: stateless bearer auth that matches the Gin middleware and works naturally across container replicas.

## Auth Flow

1. User registers or logs in.
2. The API returns `{ user, token: { access_token, token_type, expires_at } }`.
3. The frontend saves the session in `localStorage`.
4. `apiRequest` attaches `Authorization: Bearer <access_token>` for protected calls.
5. `ProtectedRoute` blocks protected screens when no valid session exists.
6. A `401` clears the stored session so stale tokens do not keep being reused.

Tradeoff: `localStorage` is simple and interview-friendly, but it is exposed to XSS. For higher-security production systems, prefer HttpOnly, Secure, SameSite cookies with CSRF protection, or pair short-lived access tokens with refresh-token rotation.

## Loading And Error States

TanStack Query supplies `isLoading`, `isError`, and mutation states. The UI includes:

- skeleton-style loading blocks,
- API error alerts using the backend `{ error, message }` shape,
- empty product/cart states,
- disabled actions for unauthenticated users or out-of-stock products.
- toast notifications for add-to-cart and checkout completion.

## Checkout Flow

The current Go API does not expose a dedicated checkout route, so this frontend demo checks out by:

1. Reading the current cart.
2. Fetching each product.
3. Updating product stock through `PUT /v1/products/{id}`.
4. Clearing the cart through `DELETE /v1/cart`.
5. Showing a purchase-completed message.

Tradeoff: this is fine for demonstrating frontend orchestration, but production checkout should be a backend transaction so stock changes, payment state, and cart clearing succeed or fail atomically.

## Cloud-Native Concepts

- Stateless frontend: the built SPA is static files, so it can run behind a CDN, Nginx, Azure Static Web Apps, S3/CloudFront, or any static host.
- Stateless API auth: JWTs allow multiple API replicas to validate tokens without sticky sessions.
- Health checks: `/health/ready` is surfaced in the header and can also be used by load balancers.
- Configuration via environment: `VITE_API_BASE_URL` is injected at build time; runtime container config is handled by Nginx/proxy setup.
- Horizontal scaling: static frontend replicas are easy to scale; backend rate limiting may need Redis or another distributed limiter when the API has multiple replicas.
- Observability: frontend deployments usually add error tracking, web vitals, request IDs, and structured API logs correlation.

## Docker And Deployment

The Dockerfile is a multi-stage frontend image:

1. `node:22-alpine` installs dependencies and runs `npm run build`.
2. `nginx:1.27-alpine` serves the generated `dist` directory.
3. `nginx.conf` uses `try_files` so React Router deep links work.
4. The Nginx config proxies `/v1` and `/health` to an `api:8080` service on the same Docker network.

Build:

```powershell
docker build -t gin-grocery-frontend .
```

The Docker build uses `npm ci`, which installs from `package-lock.json` for reproducible CI builds.

Run when the API container is reachable as `api`:

```powershell
docker run --rm -p 8081:80 gin-grocery-frontend
```

Alternative production patterns:

- Serve the SPA from a CDN and set `VITE_API_BASE_URL=https://api.example.com`.
- Put both frontend and API behind the same reverse proxy and keep API calls same-origin.
- Use Azure Container Apps, App Service, Static Web Apps, or Blob Storage plus CDN depending on operational needs.

## Interview Notes

Topics worth being ready to explain:

- Client state vs server state: auth/session is client state; products/cart fetched from the API are server state managed by TanStack Query.
- Cache invalidation: product mutations invalidate `productKeys.all`; cart mutations update or invalidate `cartKeys.current`.
- Protected routing is UX protection, not security. The backend bearer-token middleware is the real enforcement point.
- Money uses integer cents because the API stores `price_cents`, avoiding floating-point currency bugs.
- Dev proxy avoids browser CORS locally; production can use same-origin reverse proxying or explicit API CORS policy.
- Static frontend images are immutable build artifacts. Promote the same image through environments when possible.
- Build-time env vars in Vite are embedded into JS. Do not put secrets in `VITE_*` variables.
- For larger systems, add refresh tokens, role-based authorization, form libraries, schema validation, automated tests, and generated API types from OpenAPI.

## Verification

Run when Node/npm are available:

```powershell
npm install
npm run lint
npm run build
npm run test
```

On managed Windows machines where Node does not trust the system certificate store, run commands with:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
```
