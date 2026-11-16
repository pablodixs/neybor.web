import type { Icon } from '@phosphor-icons/react'

/**
 * Pino do Neybor: gota verde da marca com o símbolo do app (ou o ícone da
 * categoria do alerta) num círculo branco. SVG puro, sem imagem externa.
 */
export function NeyborPin({
    size = 44,
    icon: CategoryIcon,
    className = '',
}: {
    size?: number
    icon?: Icon
    className?: string
}) {
    const height = (size * 56) / 44
    return (
        <span
            className={`relative inline-block ${className}`}
            style={{ width: size, height }}
        >
            <svg
                width={size}
                height={height}
                viewBox="0 0 44 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
            >
                <path
                    d="M22 55C22 55 41 35.6 41 21.5C41 10.73 32.49 2 22 2C11.51 2 3 10.73 3 21.5C3 35.6 22 55 22 55Z"
                    fill="#00A63E"
                    stroke="white"
                    strokeWidth="3"
                />
                <circle cx="22" cy="21.5" r="13" fill="white" />
                {!CategoryIcon && (
                    // símbolo do Neybor (telhado + "n"), mesmo desenho do logo
                    <g transform="translate(13.6 11.5) scale(0.62)">
                        <path
                            d="M13.4649 16.7892C12.3716 16.7892 11.4696 17.0625 10.759 17.6092C10.0483 18.1285 9.52898 18.8255 9.20098 19.7002C8.87298 20.5475 8.70899 21.5041 8.70899 22.5701V32H2.88705V21.8731C2.88705 19.9052 3.26972 18.1148 4.03504 16.5022C4.8277 14.8622 6.00302 13.5639 7.561 12.6072C9.11898 11.6232 11.087 11.1313 13.4649 11.1313C15.8429 11.1313 17.8109 11.6232 19.3689 12.6072C20.9542 13.5639 22.1432 14.8485 22.9358 16.4612C23.7285 18.0738 24.1248 19.8778 24.1248 21.8731V32H18.3029V22.5701C18.3029 21.5315 18.1252 20.5748 17.7699 19.7002C17.4145 18.8255 16.8816 18.1285 16.1709 17.6092C15.4876 17.0625 14.5856 16.7892 13.4649 16.7892Z"
                            fill="#00A63E"
                        />
                        <path
                            d="M26.6916 7.70492L24.1291 12.1434L13.3454 5.91653L2.56247 12.1434L0 7.70492L13.3454 0L26.6916 7.70492Z"
                            fill="#00A63E"
                        />
                    </g>
                )}
            </svg>
            {CategoryIcon && (
                <CategoryIcon
                    weight="bold"
                    aria-hidden="true"
                    className="absolute text-green-600"
                    style={{
                        width: size * 0.4,
                        height: size * 0.4,
                        left: size * 0.3,
                        // centro do círculo branco: (22, 21.5) no viewBox 44x56
                        top: (size * 21.5) / 44 - size * 0.2,
                    }}
                />
            )}
        </span>
    )
}
