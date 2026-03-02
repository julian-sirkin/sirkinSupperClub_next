# Addon Ticket Integration Handoff

## Current Status
- Addon sync + persistence are implemented and verified.
- Events are rendering again on `/events`.
- Sync handles mixed data correctly:
  - some tickets with no addons
  - some tickets with shared addon references
- Latest verified behavior for Spring Beer Dinner:
  - 2 new tickets were added in Contentful
  - both linked to the same existing addon
  - sync created ticket rows and reused existing addon row (no duplicate addon entity)

## Business Rules
- Addon purchase is optional.
- Addon must be linked to the selected ticket type.
- `addonQuantity <= ticketQuantity` per ticket line.
- Addon quantity and selection are coupled to the specific ticket line in cart/checkout payload.

## What Is Already Implemented

### Database + Migration
- Added tables:
  - `addons`
  - `ticket_addons`
  - `purchase_item_addons`
- Files:
  - `src/db/schema.ts`
  - `migrations/0002_addons_and_ticket_links.sql`
  - `migrations/meta/_journal.json`

### Migration Tooling
- Added one-time baseline utility and scripts for legacy DBs:
  - `scripts/baseline-drizzle-migrations.mjs`
  - `npm run db:baseline`
  - `npm run db:migrate`
- Docs updated in `README.md`.

### Contentful Query + Parser
- Ticket query fetches `addonCollection` and avoids invalid field requests.
- Parser treats missing addons as `addons: []` (graceful default).
- Files:
  - `src/app/networkCalls/contentful/graphQL/queries/events.ts`
  - `src/app/networkCalls/contentful/contentfulServices.types.ts`
  - `src/app/networkCalls/contentful/parsers/parseEvents.ts`
  - `src/app/networkCalls/contentful/contentfulService.ts`

### Sync Flow
- Sync upserts addons by Contentful ID, links ticket-addon pairs, and removes stale links.
- Added robust logging in sync path for addon mapping diagnostics.
- Files:
  - `src/app/api/utils/syncAllEvents.ts`
  - `src/app/api/utils/dbOperations/processEventTickets.ts`
  - `src/app/api/queries/insert.ts`
  - `src/app/api/queries/select.ts`

### Checkout Validation + Persistence
- Validates addon selection rules before purchase transaction.
- Persists addon selections into `purchase_item_addons`.
- Files:
  - `src/app/helpers/validateAddonSelectionsForPurchase.ts`
  - `src/app/helpers/__tests__/validateAddonSelectionsForPurchase.test.ts`
  - `src/app/api/claimTickets/route.ts`
  - `src/app/api/queries/insert.ts`
  - `src/app/api/queries/select.ts`

### Cart Shape + Totals
- Cart line supports:
  - `selectedAddonContentfulId`
  - `selectedAddonTitle`
  - `selectedAddonPrice`
  - `addonQuantity`
- Total price calculation already includes addon totals.
- Files:
  - `src/store/cartStore.types.ts`
  - `src/store/helpers/updateCart.ts`
  - `src/store/cartStore.ts`
  - `src/types/index.ts`

## What Still Needs To Be Built (Next Session)

## Phase 1 (UI First): Addon UX In Event + Checkout Flow
- Primary goal: expose addon info in UI and allow addon selection per ticket line.
- Target files:
  - `src/app/components/Ticket/Ticket.tsx`
  - `src/app/components/TicketsSection/TicketsSection.tsx`
  - `src/app/components/CheckoutDialog/CheckoutDialog.tsx`
  - `src/store/helpers/updateCart.ts` (already ready for addon fields)
  - `src/store/cartStore.types.ts` (already contains addon fields)
- UI requirements:
  - On ticket card, if `ticket.addons.length > 0`, show addon title + addon price.
  - Add UI controls to:
    - select one addon option for that ticket line (or none)
    - choose addon quantity from `0..ticketQuantity`
  - Ensure total shown in tickets section + checkout reflects addon totals.
  - Ensure checkout summary clearly shows addon breakdown per ticket line.

## Phase 2: Place Orders With Addons End-to-End
- Confirm that checkout request sends addon fields in `purchasedTickets`.
- Validate successful order creation with addon selections.
- Verify DB writes:
  - `purchase_items` has ticket lines
  - `purchase_item_addons` has corresponding addon rows and quantities

## Phase 3 (After UI/Checkout): Admin Display + Refunds
- Display addon purchase details in admin event order views:
  - likely surfaces in:
    - `src/app/components/AdminTicketInfo/AdminTicketInfo.tsx`
    - `src/app/components/AdminEvent/components/EventTicketsList.tsx`
    - `src/app/api/getAdminEvent/route.ts`
    - `src/app/api/queries/select.ts` (admin query expansion needed)
- Refund behavior:
  - Current refund path updates only base ticket quantities in `purchase_items` / `tickets.totalSold`.
  - Need addon-aware refund behavior in:
    - `src/app/api/refundTickets/route.ts`
  - Refund design should enforce addon consistency when reducing ticket quantity.

## Known Technical Notes
- `isAddonTicket` is currently set to `false` in parser for compatibility because Contentful `TicketType` schema does not expose that field now.
- Availability seat math in teaser cards still uses `isAddonTicket`; revisit later if addon-only ticket models are introduced.
- Current addon model assumes addons are linked metadata entities, not standalone ticket inventory rows.

## Verification Commands
```bash
npm run db:baseline
npm run db:migrate
npm test -- validateAddonSelectionsForPurchase.test.ts
curl -X POST http://localhost:3000/api/sync -H "Content-Type: application/json"
```

## Last Verified Runtime Snapshot
- `/api/sync` returned success with event/ticket updates and no errors.
- Addon DB check showed:
  - one addon row
  - three `ticket_addons` links for the Spring Beer Dinner ticket set
