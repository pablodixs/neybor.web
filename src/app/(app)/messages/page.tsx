import { redirect } from 'next/navigation'

// As conversas vivem dentro da Feira do Bairro.
export default function MessagesPage() {
    redirect('/feira/conversas')
}
