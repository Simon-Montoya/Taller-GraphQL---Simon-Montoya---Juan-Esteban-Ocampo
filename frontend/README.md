# Afirmative Pill frontend

React + Vite with Apollo Client 4. All server communication uses GraphQL at
`http://localhost:4000/graphql`. The existing backend, CQRS commands/queries,
Supabase persistence, and DataLoader are unchanged.

## Run

From the repository root, start the configured backend:

```powershell
cd backend
npm install
npm run dev
```

In another terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev -- --host localhost --port 5173 --strictPort
```

Open http://localhost:5173. Port 5173 matches the backend CORS configuration.
The backend requires its existing Supabase environment configuration.

## Checks

```powershell
cd frontend
npm run build
npm run lint
```

## Workshop walkthrough

1. Browse the catalog and search by name, active ingredient, or category.
   After 350 ms, `Catalog(search)` requests only id, name, presentation, price,
   and requiresPrescription. Search runs on the backend.
2. Open details: `MedicationDetail(id)` requests the full medication fields.
3. Add items to the cart, adjust quantities, remove items, or clear the cart.
4. Prescription items require a reference. `CreateOrder(input)` submits only
   medication IDs, quantities, and the reference. The server determines the
   final price, availability, and business validation.
5. Successful checkout clears the cart and opens an order URL. Save its ID or
   bookmark the URL. `TrackOrder(id)` reads nested items and medication fields.
6. Pending orders expose Validate prescription and Cancel; approved orders
   expose Dispatch and Cancel. Dispatched/cancelled orders have no mutation
   actions. Commands update Apollo normalized entities and re-read the order.
7. Inspect GraphQL requests in browser developer tools to compare selections.

The cart is in-memory UI state and resets on reload. Hash routes support direct
links and browser back/forward without adding a routing dependency. There are
no REST calls, direct Supabase connections, subscriptions, or mock records.
Prices retain the existing dollar notation because the schema has no currency
code. Demo commands perform real backend writes; use workshop records.
