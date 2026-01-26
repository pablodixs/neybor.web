import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export function MyNeighborhoodAlerts() {
    return (
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto mb-4">
            <section className="flex items-center gap-2">
                <div className="aspect-square w-12 bg-gray-800 rounded-full"></div>
                <div className="flex flex-col">
                    <strong className="font-semibold text-neutral-700 leading-tight">
                        Samambaia
                    </strong>
                    <span className="leading-tight text-neutral-500 text-sm font-medium">
                        Brasília
                    </span>
                </div>
            </section>
            <section className="mt-4 pt-3 border-t border-neutral-100 text-neutral-600 leading-tight">
                <Link
                    href={'#'}
                    className="flex items-center justify-between font-semibold hover:text-green-600 transition"
                >
                    Ver alertas{' '}
                    <ArrowRightIcon className="text-lg" weight="bold" />
                </Link>
            </section>
        </div>
    )
}
