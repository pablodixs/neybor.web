'use client'

import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react'

type ToastKind = 'success' | 'error'

interface ToastItem {
    id: number
    kind: ToastKind
    message: string
}

interface ToastContextValue {
    show: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION_MS = 3500

/** Avisos curtos de confirmação ("Link copiado", "Post publicado"), no estilo do Digg. */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const nextId = useRef(0)

    const show = useCallback((message: string, kind: ToastKind = 'success') => {
        const id = nextId.current++
        setToasts((current) => [...current.slice(-2), { id, kind, message }])
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id))
        }, DURATION_MS)
    }, [])

    const value = useMemo(() => ({ show }), [show])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                className="fixed z-50 inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6 flex flex-col items-center gap-2 px-4 pointer-events-none"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg border text-sm font-semibold bg-white ${toast.kind === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-700'}`}
                    >
                        {toast.kind === 'success' ? (
                            <CheckCircleIcon size={20} weight="fill" className="text-green-600" />
                        ) : (
                            <WarningCircleIcon size={20} weight="fill" className="text-red-600" />
                        )}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast precisa estar dentro de <ToastProvider>')
    }
    return context
}
