# QRMenu

Khmer/English restaurant QR menu and administration portal for Cloudflare Workers.

## What is included

- Public, bilingual QR menu at `/menu/{restaurant-slug}`
- Time-based schedules in Cambodia time (`Asia/Phnom_Penh`)
- Menu items, categories, KHR/USD prices, item photos, and R2 media storage
- Immediate sold-out controls per branch
- Staff roles, invites, and audit-event storage
- D1 migrations, local seed data, Cloudflare Worker configuration, and GitHub verification CI

## Run locally

```powershell
npm ci
npx wrangler d1 migrations apply qrmenu-db --local
npm run dev
```

Open `/menu/sabay-kitchen` for the public menu and `/admin/menu-items` for the admin portal.

## Production release

1. Authenticate locally with Cloudflare; never share tokens in chat or commit them.
2. Create resources:

   ```powershell
   npx wrangler d1 create qrmenu-db
   npx wrangler r2 bucket create qrmenu-media
   ```

3. Put the returned D1 database ID in `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
4. Apply all migrations:

   ```powershell
   npx wrangler d1 migrations apply qrmenu-db --remote
   ```

5. In Cloudflare Zero Trust, create an Access application protecting `/admin/*` and `/api/admin/*`, and allow only the restaurant’s staff emails. Do not make admin routes public.
6. Run `npm run deploy`.
7. Optional: attach a custom domain in the Cloudflare dashboard and generate QR codes that point to `/menu/{restaurant-slug}`.

The manual GitHub deployment workflow requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. The normal verification workflow needs no secrets.

### Cloudflare Git integration

For Workers Builds connected directly to GitHub, configure these commands in the Cloudflare dashboard:

```text
Build command:  npm run cf:build
Deploy command: npx wrangler deploy
```

`npm run build` only creates the standard Next.js output. `npm run cf:build` additionally creates the `.open-next` Worker bundle required by Wrangler deployment.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
npx opennextjs-cloudflare build
```

OpenNext’s Windows support is limited; use GitHub Actions/Linux for the closest production-runtime build.
