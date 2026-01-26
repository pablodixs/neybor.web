'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
    children: ReactNode
    content: string
    placement?: TooltipPlacement
    delay?: number
}

const placementConfig = {
    top: {
        initial: { opacity: 0, scale: 0.2 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.2 },
        className: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        originStyle: { transformOrigin: 'center bottom' },
    },
    bottom: {
        initial: { opacity: 0, scale: 0.2 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.2 },
        className: 'top-full mt-2 left-1/2 -translate-x-1/2',
        originStyle: { transformOrigin: 'center top' },
    },
    left: {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 8 },
        className: 'right-full mr-2 top-1/2 -translate-y-1/2',
        originStyle: { transformOrigin: 'right center' },
    },
    right: {
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -8 },
        className: 'left-full ml-2 top-1/2 -translate-y-1/2',
        originStyle: { transformOrigin: 'left center' },
    },
}

export function Tooltip({
    children,
    content,
    placement = 'top',
    delay = 200,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [tooltipId] = useState(
        () => `tooltip-${Math.random().toString(36).slice(2, 9)}`,
    )
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)
    const delayTimer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (delayTimer.current) {
                clearTimeout(delayTimer.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!isVisible || !triggerRef.current) return

        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect()
            if (!rect) return

            const offset = 8 // gap between trigger and tooltip
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            let top = 0
            let left = 0

            switch (placement) {
                case 'top':
                    top = rect.top - offset
                    left = centerX
                    break
                case 'bottom':
                    top = rect.bottom + offset
                    left = centerX
                    break
                case 'left':
                    top = centerY
                    left = rect.left - offset
                    break
                case 'right':
                    top = centerY
                    left = rect.right + offset
                    break
            }

            setTooltipPosition((prev) => {
                if (prev.top === top && prev.left === left) return prev
                return { top, left }
            })
        }

        updatePosition()
        const resizeObserver = new ResizeObserver(updatePosition)
        resizeObserver.observe(triggerRef.current)
        window.addEventListener('scroll', updatePosition, { capture: true })
        window.addEventListener('resize', updatePosition)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('scroll', updatePosition, {
                capture: true,
            })
            window.removeEventListener('resize', updatePosition)
        }
    }, [isVisible, placement])

    const handleMouseEnter = () => {
        delayTimer.current = setTimeout(() => {
            setIsVisible(true)
        }, delay)
    }

    const handleMouseLeave = () => {
        if (delayTimer.current) {
            clearTimeout(delayTimer.current)
        }
        setIsVisible(false)
    }

    const handleFocus = () => {
        setIsVisible(true)
    }

    const handleBlur = () => {
        setIsVisible(false)
    }

    const config = placementConfig[placement]

    return (
        <div
            ref={triggerRef}
            className="inline-block w-fit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <div aria-describedby={tooltipId} role="button" tabIndex={0}>
                {children}
            </div>

            {typeof window !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isVisible && (
                            <div
                                className="fixed z-50 pointer-events-none"
                                style={{
                                    top: `${tooltipPosition.top}px`,
                                    left: `${tooltipPosition.left}px`,
                                    transform:
                                        placement === 'top'
                                            ? 'translateX(-50%) translateY(-100%)'
                                            : placement === 'bottom'
                                              ? 'translateX(-50%)'
                                              : placement === 'left'
                                                ? 'translateY(-50%) translateX(-100%)'
                                                : 'translateY(-50%)',
                                }}
                            >
                                <motion.div
                                    id={tooltipId}
                                    role="tooltip"
                                    initial={config.initial}
                                    animate={config.animate}
                                    exit={config.exit}
                                    style={config.originStyle}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className="whitespace-nowrap font-semibold bg-neutral-100/80 backdrop-blur-sm text-neutral-900 inset-shadow-xs px-3 py-1.5 rounded-full text-sm shadow-lg"
                                >
                                    {content}
                                    <div
                                        className={`rounded-xs absolute w-2 h-2 bg-neutral-100/80 backdrop-blur-sm ${
                                            placement === 'top' &&
                                            'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45'
                                        } ${
                                            placement === 'bottom' &&
                                            'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
                                        } ${
                                            placement === 'left' &&
                                            'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45'
                                        } ${
                                            placement === 'right' &&
                                            'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45'
                                        }`}
                                    />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    )
}
