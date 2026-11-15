'use client'

import { AnimatePresence } from 'motion/react'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react'

import { NewPostDialog } from './new-post-dialog'

interface ComposeContextValue {
    openCompose: () => void
}

const ComposeContext = createContext<ComposeContextValue | null>(null)

/**
 * Mantém o diálogo de novo post num lugar só, para que tanto a coluna
 * lateral (desktop) quanto a barra inferior (celular) consigam abri-lo.
 */
export function ComposeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const openCompose = useCallback(() => setIsOpen(true), [])

    return (
        <ComposeContext.Provider value={{ openCompose }}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <NewPostDialog
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
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
