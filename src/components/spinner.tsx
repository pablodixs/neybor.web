interface SpinnerProps {
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'tint' | 'white'
}

export function Spinner({
    title = 'Carregando...',
    size = 'md',
    color = 'tint',
}: SpinnerProps) {
    const sizeMap = {
        sm: 18,
        md: 24,
        lg: 32,
        xl: 48,
    }

    const dimension = sizeMap[size] || sizeMap.md

    return (
        <>
            <svg
                className={`${color === 'tint' ? 'stroke-green-600' : 'stroke-white'} mx-auto my-2`}
                width={dimension}
                height={dimension}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g>
                    <circle
                        cx="12"
                        cy="12"
                        r="9.5"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                    >
                        <animate
                            attributeName="stroke-dasharray"
                            dur="1.5s"
                            calcMode="spline"
                            values="0 150;42 150;42 150;42 150"
                            keyTimes="0;0.475;0.95;1"
                            keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            dur="1.5s"
                            calcMode="spline"
                            values="0;-16;-59;-59"
                            keyTimes="0;0.475;0.95;1"
                            keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        dur="2s"
                        values="0 12 12;360 12 12"
                        repeatCount="indefinite"
                    />
                </g>
            </svg>
            <span className="sr-only">{title}</span>
        </>
    )
}
