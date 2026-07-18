# QRMenu Admin Design System

This file is the source of truth for the administration portal. Page-specific files under `pages/` may override it.

## Product direction

- Professional, content-dense restaurant operations interface.
- shadcn/ui base-nova components with Lucide icons.
- Group navigation by functionality: overview, menu management, availability, restaurant, and access/security.
- Every master-data module follows List → Search/Filter → Create → Edit → Status actions.
- Variance 3/10, motion 2/10, density 7/10.

## Color and type

- Neutral white/zinc surfaces keep dense data readable.
- Primary: accessible restaurant green (`oklch(0.46 0.14 151)`).
- Active: emerald; warning/sold out: amber; destructive/missing: red.
- English: Noto Sans. Khmer: Noto Sans Khmer.
- Body text is at least 14px in dense tables and 16px in forms/customer-facing content.

## Layout

- Collapsible desktop sidebar; mobile navigation uses a Sheet.
- Sticky header with sidebar trigger, breadcrumb, and global search affordance.
- Page header contains title, short description, and one primary Create action.
- Search and common filters stay visible; advanced filters move to a Sheet.
- Tables use semantic markup and horizontal containment on small screens.
- Complex create/edit flows use full pages, not oversized dialogs.

## Interaction rules

- Minimum 44px touch target for primary mobile actions and form controls.
- Visible keyboard focus and 4.5:1 text contrast.
- 150–200ms transitions; respect reduced motion.
- Loading, empty, no-results, error, and success states are required.
- Destructive actions require AlertDialog confirmation.
- Dialogs are for focused decisions; Sheets are for navigation and filters.
- Search/filter state will be synchronized to URL parameters when APIs are connected.

## Component mapping

- Sidebar, Breadcrumb: application navigation.
- TanStack Table + shadcn Table: admin lists.
- TanStack Query: interactive admin server state only.
- TanStack Form + Zod: multilingual and schedule editors.
- Badge: availability and translation status.
- Sonner: save/error feedback.
- Skeleton: loading state.

## Avoid

- TanStack Router or TanStack Start inside Next.js.
- Emoji icons, hover-only actions, placeholder-only labels, invisible focus rings.
- Decorative animation, oversized marketing typography, or large hero sections in admin.
- Using color alone to communicate status.
