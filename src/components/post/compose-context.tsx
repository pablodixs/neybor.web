'use client'

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react'

import { ComposeType, NewPostDialog } from './new-post-dialog'

interface ComposeContextValue {
    openCompose: (type?: ComposeType) => void
}

const ComposeContext = createContext<ComposeContextValue | null>(null)

/**
 * Mantém o diálogo de novo post num lugar só, para que tanto o cabeçalho
 * (desktop) quanto a barra inferior (celular) consigam abri-lo.
 */
export function ComposeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [type, setType] = useState<ComposeType>('GENERAL')
    const openCompose = useCallback((nextType: ComposeType = 'GENERAL') => {
        setType(nextType)
        setIsOpen(true)
    }, [])

    return (
        <ComposeContext.Provider value={{ openCompose }}>
            {children}
            {isOpen && (
                <NewPostDialog
                    initialType={type}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </ComposeContext.Provider>
    )
}

export function useCompose() {
    const context = useContext(ComposeContext)
    if (!context) {
        throw new Error('useCompose precisa estar dentro de <ComposeProvider>')
    }
    return context
}
