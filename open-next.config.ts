import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

// Cache do Next (páginas pré-renderizadas e route cache) guardado no R2.
// O bucket é preenchido automaticamente pelo `npm run deploy`.
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
})
