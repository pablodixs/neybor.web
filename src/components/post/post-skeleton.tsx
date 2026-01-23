import { ChatCircleIcon, HeartIcon } from '@phosphor-icons/react/dist/ssr'

export function PostSkeleton() {
    return (
        <div className="border border-neutral-100 rounded-xl p-4 mb-4">
            <svg
                role="img"
                width="576"
                height="124"
                aria-labelledby="loading-aria"
                viewBox="0 0 576 124"
                preserveAspectRatio="none"
            >
                <title id="loading-aria">Loading...</title>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    clipPath="url(#clip-path)"
                    style={{ fill: 'url(#fill)' }}
                ></rect>
                <defs>
                    <clipPath id="clip-path">
                        <rect
                            x="48"
                            y="8"
                            rx="3"
                            ry="3"
                            width="88"
                            height="6"
                        />
                        <rect
                            x="48"
                            y="26"
                            rx="3"
                            ry="3"
                            width="52"
                            height="6"
                        />
                        <rect
                            x="0"
                            y="56"
                            rx="3"
                            ry="3"
                            width="410"
                            height="6"
                        />
                        <rect
                            x="0"
                            y="72"
                            rx="3"
                            ry="3"
                            width="380"
                            height="6"
                        />
                        <rect
                            x="0"
                            y="88"
                            rx="3"
                            ry="3"
                            width="178"
                            height="6"
                        />
                        <circle cx="20" cy="20" r="20" />
                    </clipPath>
                    <linearGradient id="fill">
                        <stop
                            offset="0.599964"
                            stopColor="#f3f3f3"
                            stopOpacity="1"
                        >
                            <animate
                                attributeName="offset"
                                values="-2; -2; 1"
                                keyTimes="0; 0.25; 1"
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                        <stop
                            offset="1.59996"
                            stopColor="#ecebeb"
                            stopOpacity="1"
                        >
                            <animate
                                attributeName="offset"
                                values="-1; -1; 2"
                                keyTimes="0; 0.25; 1"
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                        <stop
                            offset="2.59996"
                            stopColor="#f3f3f3"
                            stopOpacity="1"
                        >
                            <animate
                                attributeName="offset"
                                values="0; 0; 3"
                                keyTimes="0; 0.25; 1"
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                    </linearGradient>
                </defs>
            </svg>
            <footer className="flex gap-4 text-neutral-500 items-center -m-2">
                <div className="text-lg p-2 rounded-full ">
                    <HeartIcon weight="bold" />
                </div>
                <div className="text-lg p-2 rounded-full ">
                    <ChatCircleIcon weight="bold" />
                </div>
            </footer>
        </div>
    )
}
