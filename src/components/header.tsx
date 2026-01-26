import {
    BellIcon,
    ChatsCircleIcon,
    HouseIcon,
    MapTrifoldIcon,
} from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export function Header() {
    return (
        <header className="border-b border-neutral-100 h-14 fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg z-10">
            <div className="max-w-7xl mx-auto h-full grid-cols-3 grid items-center">
                <div className="flex justify-between items-center w-80">
                    <Link
                        href={'/feed'}
                        className="text-2xl p-2 text-neutral-700 rounded-full cursor-pointer transition-all hover:bg-green-50 hover:text-green-600"
                        aria-label="Feed"
                    >
                        <HouseIcon weight="regular" />
                    </Link>
                    <button
                        aria-label="Map"
                        className="text-2xl p-2 text-neutral-700 rounded-full cursor-pointer transition-all hover:bg-green-50 hover:text-green-600"
                    >
                        <MapTrifoldIcon weight="regular" />
                    </button>
                    <button
                        aria-label="Chats"
                        className="text-2xl p-2 text-neutral-700 rounded-full cursor-pointer transition-all hover:bg-green-50 hover:text-green-600"
                    >
                        <ChatsCircleIcon weight="regular" />
                    </button>
                    <button
                        aria-label="Notifications"
                        className="text-2xl p-2 text-neutral-700 rounded-full cursor-pointer transition-all hover:bg-green-50 hover:text-green-600"
                    >
                        <BellIcon weight="regular" />
                    </button>
                </div>
                <div className="w-full flex justify-center">
                    <Link href={'/feed'} aria-label="Neybor Home">
                        <svg
                            width="27"
                            height="32"
                            viewBox="0 0 27 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.4649 16.7892C12.3716 16.7892 11.4696 17.0625 10.759 17.6092C10.0483 18.1285 9.52898 18.8255 9.20098 19.7002C8.87298 20.5475 8.70899 21.5041 8.70899 22.5701V32H2.88705V21.8731C2.88705 19.9052 3.26972 18.1148 4.03504 16.5022C4.8277 14.8622 6.00302 13.5639 7.561 12.6072C9.11898 11.6232 11.087 11.1313 13.4649 11.1313C15.8429 11.1313 17.8109 11.6232 19.3689 12.6072C20.9542 13.5639 22.1432 14.8485 22.9358 16.4612C23.7285 18.0738 24.1248 19.8778 24.1248 21.8731V32H18.3029V22.5701C18.3029 21.5315 18.1252 20.5748 17.7699 19.7002C17.4145 18.8255 16.8816 18.1285 16.1709 17.6092C15.4876 17.0625 14.5856 16.7892 13.4649 16.7892Z"
                                fill="#00A63E"
                            />
                            <path
                                d="M26.6916 7.70492L24.1291 12.1434L13.3454 5.91653L2.56247 12.1434L0 7.70492L13.3454 0L26.6916 7.70492Z"
                                fill="#00A63E"
                            />
                        </svg>
                    </Link>
                </div>
                <div className="w-80 ml-auto">
                    <input
                        className="rounded-full w-full px-4 py-1 border-2 border-neutral-100"
                        type="search"
                        placeholder="Buscar"
                        aria-label="Search"
                    />
                </div>
            </div>
        </header>
    )
}
