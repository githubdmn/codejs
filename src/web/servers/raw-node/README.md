# raw-node server

A minimal HTTP server built with `node:http`. Responds to any `GET` with
`{ ok: true, path }` and returns `404` for other methods.

Run it: `npx tsx src/web/servers/raw-node/server.ts`

Then: `curl http://localhost:3000/anything`
