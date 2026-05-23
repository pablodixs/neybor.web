import { ReactNode } from 'react'

interface PageContainerProps {
    padding?: 'default' | 'none'
    children: ReactNode
}

export function PageContainer({
    children,
    padding = 'default',
}: PageContainerProps) {
    const paddingClasses = padding === 'default' ? 'p-4' : 'p-0'
    return (
        <div
            className={`${paddingClasses} border border-neutral-100 rounded-2xl bg-white overflow-hidden relative`}
        >
            {children}
        </div>
    )
}
