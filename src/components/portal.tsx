'use client'

import { motion } from 'motion/react'
import { ReactNode, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
    isOpen: boolean
    onClose?: () => void
    closeOnEsc?: boolean
    closeOnOutsideClick?: boolean
    overlayClassName?: string
    containerId?: string
    children: ReactNode
}

export function Portal({
    isOpen,
    onClose,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    overlayClassName,
    containerId = 'portal-root',
    children,
}: PortalProps) {
    const container = useMemo(() => {
        if (typeof document === 'undefined') return null

        const existing = document.getElementById(containerId)
        if (existing) return existing

        const el = document.createElement('div')
        el.id = containerId
        document.body.appendChild(el)
        return el
    }, [containerId])

    useEffect(() => {
        if (!isOpen || !closeOnEsc) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose?.()
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, closeOnEsc, onClose])

    useEffect(() => {
        if (!isOpen) return
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [isOpen])

    if (!isOpen || !container) return null

    const handleOverlayClick = () => {
        if (closeOnOutsideClick) {
            onClose?.()
        }
    }

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${overlayClassName ?? ''}`.trim()}
            onClick={handleOverlayClick}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                onClick={(event) => event.stopPropagation()}
                className="relative min-w-80 rounded-4xl bg-white p-6 shadow-xl"
            >
                {children}
            </motion.div>
        </motion.div>,
        container,
    )
}
