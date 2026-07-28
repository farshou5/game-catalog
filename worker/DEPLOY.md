# Deploying joystick-favs

One-time (needs `CLOUDFLARE_API_TOKEN` env var with "Edit Cloudflare Workers" template):

```bash
cd worker
npx wrangler@latest kv namespace create FAVS_KV   # copy the id into wrangler.toml
npx wrangler@latest deploy                        # prints the workers.dev URL
```

Then replace `__SYNC_URL__` in `index.html`, `assets.html`, `joystick.html` with the
printed URL (no trailing slash) and push.

Endpoints: `GET /state` returns the saved favorites/ratings JSON;
`POST /sync` overwrites it (validated shape, 64KB cap). CORS is limited to
`https://farshou5.github.io` and `http://localhost:8931`.
