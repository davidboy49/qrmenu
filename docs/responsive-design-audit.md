# Responsive & visual design audit (Sept 2026)

Method: ran the app locally with the seeded demo restaurant and checked every public and admin route at 375px (phone), 768px (tablet) and 1440px (desktop). An automated check flagged any element that made the page scroll sideways. I then went through the screenshots by eye.

## Before this change

| Width | Pages that scrolled sideways |
| --- | --- |
| 375px | `/admin/restaurants` |
| 768px | **every admin page** (all 11 routes tested) |
| 1440px | none |

After this change, **0 pages** scroll sideways at any of the three widths.

## Fixed in this branch

### Public QR menu (`/menu/{slug}`), the page guests see

1. **Two category menus showing the same thing.** The page had a row of category circles, all with the same chef-hat icon, plus a category bar fixed to the bottom. That bottom bar covered the last row of dishes and the "Powered by" link. Both are replaced by a single sticky category bar under the header. Section scrolling now measures the real height of the sticky area instead of assuming 80px, so headings no longer end up hidden under the header.
2. **Too narrow on desktop.** The content was capped at 672px, with three columns and wide empty margins. The page is now up to 1152px wide, with 2, 3 or 4 columns depending on screen size. Carousel height also adjusts: 176px on phones, 240px on tablets, 288px on desktop.
3. **Cramped header on phones.** The restaurant name was cut down to "Sab…" and buttons were 32px. The "Digital menu" label is now hidden on phones, all buttons are 40px, and the Admin link shows as an icon only.
4. **Keyboard and screen-reader access.** Dish cards were `<article>`s with an `onClick` and JavaScript hover handlers, so a keyboard couldn't reach them. Each card now has a full-size button, focus rings and CSS hover effects. Other fixes:
   - The clear-search button has a label.
   - Icons are hidden from screen readers.
   - Category and slide buttons use `aria-current`.
   - The carousel has ARIA roles.
   - Slide dots have 24px tap areas.
   - The search field uses `type="search"` with 16px text on phones, so iOS no longer zooms in when it's tapped.
5. **Carousel.** It now supports swipe, stops auto-advancing when the OS "reduce motion" setting is on, and pauses when the browser tab is hidden. A manual swipe restarts the timer.
6. **Theme.** It now follows the guest's OS light/dark setting when they haven't chosen one. Reading or writing `localStorage` can no longer crash the page (e.g. Safari private mode).
7. **Item detail sheet.** Uses `dvh` height and adds bottom padding for the iPhone home indicator. The close button is visible on top of photos. Long text scrolls inside the sheet instead of the page behind it.
8. **Bug: item codes changed with the language.** A category without a stored code got its code from the *localized* name. Khmer letters are stripped, so every Khmer-mode item became `CAT-1…n` while staff saw `KHM-1`, `NOO-1`. Codes now come from the English name on the server, the same way the admin does it.

### Admin

9. **Every admin page scrolled sideways on tablets.** At 768px the desktop sidebar leaves about 512px for the page. The header's decorative "Search anything… Ctrl K" button (`min-w-56`, and it did nothing) plus the breadcrumb and "Customer View" didn't fit. Fixes:
   - Removed the non-working search button.
   - On phones the breadcrumb shows only the current page.
   - "Customer view" shows as an icon only on phones and opens in a new tab.
   - Record IDs in the breadcrumb now show as "Edit".
   - `SidebarInset` got `min-w-0`, so wide content can no longer push the whole page sideways.
10. **Menu items table on phones.** The 9-column table showed about 2 columns and needed sideways scrolling. Below `lg` it's now a card list (1 column on phones, 2 on tablets) showing photo, both names, code, status, missing-translation flag, category and prices.
11. **Restaurants page.** Header and row action buttons overflowed on phones. They now stack or wrap in a grid.
12. **Categories list.** Rows squeezed the names into a narrow column. The count, status and Edit button now drop to a second line on small screens.
13. **Create/edit menu item form.** Long media filenames in the photo `<select>` pushed the form wider than the screen on tablets.
14. **Lint errors fixed.** `PriceChip` and `PriceBlock` were components created during render, which `react-hooks/static-components` flags as errors. The menu-items columns `useMemo` was also missing a dependency.

### Global

15. Added `viewport` settings with `viewport-fit=cover` and light/dark `theme-color`. `body` uses `100dvh`. Animations are turned off app-wide when the OS "reduce motion" setting is on.

## Proposed next steps (not done here)

Ordered by impact.

### High

- **Image delivery.** `images.unoptimized: true`, so guests on mobile data download full-size originals from R2 for every dish thumbnail. `wrangler.jsonc` already binds `IMAGES`. Turn on OpenNext's Cloudflare Images loader, or save resized versions (e.g. 320/640/1280px) at upload time. This is the biggest speed win for the public menu.
- **Fonts.** Four Google Font families with many weights load through a `<link>` that blocks rendering. Switch to `next/font/google` (self-hosted, subset, no text flash) and keep only the weights actually used. Kantumruy Pro + Noto Serif Khmer + Cormorant Garamond at 3 or 4 weights is enough.
- **Item codes are calculated in the browser from list order** (`CAT-n`). They change whenever an item is added, reordered or hidden by a schedule. The admin list and public menu also sort differently (admin: `display_order, updated_at DESC`; public: category → schedule → item order), so the same dish can get different numbers. If guests order by code, store a fixed code on each item in the database.
- **Buttons and links that do nothing.** Sidebar links to `/admin/special-dates`, `/admin/roles` and `/admin/audit-log` go to 404 pages. "Dashboard" just redirects to Menu items. "More filters" on Menu items does nothing. Build them or hide them until they exist.

### Medium

- **Gold text contrast on the light theme.** `#C9A96E` on white is about 2.2:1, below the WCAG AA minimum of 4.5:1. It's used for the KHR price, item codes and labels. Add a separate darker gold for text on light surfaces (e.g. `#8A6A2F`, about 5:1) and keep the current gold for backgrounds and fills.
- **Theme flash.** The server always renders the dark theme, then switches after load for light-mode guests. Store the choice in a cookie (read on the server) or set `data-theme` before first paint, and move the `themes` JS object into CSS variables.
- **Dialogs.** Categories and Users build their own `fixed inset-0` overlays with no focus trapping and no Escape to close. Sign-out uses `window.confirm`. `MASTER.md` specifies `Dialog`/`AlertDialog`; use them.
- **Admin dark mode is half done.** `.dark` makes `--primary` grey and `--sidebar-primary` blue, and many admin files hard-code `stone-*` colours. Either finish it (use tokens everywhere) or remove `.dark` so it can't be switched on by accident.
- **Sold-out page.** Written as a single minified line. Toggling has no loading state and reloads the whole list. Use TanStack Query (already installed) with an optimistic update, and add search, since this page is used mid-service on phones.

### Low

- Next 16 warns that `middleware.ts` is deprecated; rename it to `proxy.ts`.
- If a global admin search is wanted, add a real ⌘K command menu (items, categories, pages). Otherwise leave the header as it is now.
- The public menu shows the restaurant name three times at the top (header, welcome slide, photo slide caption). Consider using the welcome slide for a tagline, opening hours or Wi-Fi details instead.
- Dishes without a photo show two-letter initials. A subtle category icon or the restaurant logo would look more polished.
