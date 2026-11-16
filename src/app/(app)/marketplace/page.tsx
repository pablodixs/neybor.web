import { redirect } from 'next/navigation'

// A Feira do Bairro substituiu a antiga tela vazia do marketplace.
export default function MarketplacePage() {
    redirect('/feira')
}
