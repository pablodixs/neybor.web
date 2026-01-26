import { WarningIcon } from '@phosphor-icons/react/dist/ssr'

export function AlertLabel() {
    return (
        <div className="flex bg-orange-50 p-4 rounded-xl items-center gap-2 mb-2">
            <WarningIcon weight="bold" className="text-xl text-orange-600" />{' '}
            <strong className="text-orange-600 font-semibold text-lg">
                Alerta de Segurança
            </strong>
        </div>
    )
}
