interface CircularProgressIndicatorProps {
    value: number
    showPercentage?: boolean
    size?: number
}

export const CircularProgressIndicator = ({
    value,
    showPercentage = false,
    size = 100,
}: CircularProgressIndicatorProps) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference
    const strokeWidth = size / 2

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                    className="text-gray-100 stroke-current"
                    strokeWidth={strokeWidth}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                />
                {/* Progresso */}
                <circle
                    className="text-green-600 stroke-current transition-all duration-500 ease-out"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            {showPercentage && (
                <div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold text-gray-700"
                    style={{ fontSize: size / 5 }}
                >
                    {value}%
                </div>
            )}
        </div>
    )
}
