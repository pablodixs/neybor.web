import { Button } from '../button'
import { MyNeighborhoodAlerts } from './my-neighborhood-alerts'

export function TrailingAside() {
    return (
        <aside className="w-80 shrink-0 sticky top-20 self-start ">
            <MyNeighborhoodAlerts />
            <div className="bg-white border border-neutral-100 p-4 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto mb-4">
                <h2 className="text-xl font-semibold mb-2 text-neutral-700">
                    Convide seus vizinhos!
                </h2>
                <p className="text-neutral-500 mb-4">
                    Convide seus vizinhos para se juntarem ao Neybor e
                    fortalecer a comunidade local.
                </p>
                <Button fullWidth>Obter código de convite</Button>
            </div>
        </aside>
    )
}
