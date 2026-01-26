import { ReactNode } from 'react'

export const metadata = {
    title: 'Neybor',
}

export default function Layout({ children }: { children: ReactNode }) {
    return <>{children}</>
}
