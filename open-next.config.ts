import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Sem cache incremental: o app não usa ISR/revalidate (páginas dinâmicas são
// renderizadas a cada request e as estáticas já vão como assets). Se um dia
// precisar de ISR, habilite o R2 e use o r2-incremental-cache:
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig()
