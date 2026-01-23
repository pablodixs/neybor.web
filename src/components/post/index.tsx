import {
    ChatCircleIcon,
    CityIcon,
    DotsThreeIcon,
    GlobeSimpleIcon,
    HeartIcon,
    WarehouseIcon,
} from '@phosphor-icons/react/dist/ssr'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

interface Author {
    id: number
    displayName: string
    handle: string
    avatarUrl: string
}

export interface PostProps {
    id: number
    author: Author
    content: string
    createdAt: string
    latitude: number
    longitude: number
    type: 'GENERAL' | 'EVENT' | 'ALERT'
    visibility: 'NEIGHBORHOOD' | 'PUBLIC' | 'PRIVATE'
}

interface PostComponentProps {
    data: PostProps
}

export function Post({ data }: PostComponentProps) {
    return (
        <div className="w-full border border-neutral-100 rounded-2xl p-4 bg-white mb-4">
            <header className="flex justify-between items-start">
                <Link
                    className="flex gap-2 items-center"
                    href={`/${data.author.handle}`}
                >
                    <Image
                        className="rounded-full aspect-square object-cover w-9 h-9 mb-1"
                        src={
                            data.author.avatarUrl ||
                            '/images/default-avatar.png'
                        }
                        alt={data.author.displayName || 'User avatar'}
                        width={36}
                        height={36}
                    />
                    <div className="flex flex-col gap-2">
                        <strong className="flex font-semibold leading-3">
                            {data.author.displayName}
                        </strong>
                        <div className="font-medium text-sm text-neutral-500 leading-2 flex gap-1">
                            <p>Brasília</p>
                        </div>
                    </div>
                </Link>
                <div className="flex gap-2 items-center">
                    <div className="font-medium text-sm text-neutral-500">
                        {data.visibility === 'PUBLIC' ? (
                            <GlobeSimpleIcon size={16} />
                        ) : data.visibility === 'NEIGHBORHOOD' ? (
                            <CityIcon size={16} />
                        ) : (
                            <WarehouseIcon size={16} />
                        )}
                    </div>
                    <p
                        className='className="font-medium text-sm text-neutral-500'
                        title={new Date(data.createdAt).toLocaleString('pt-BR')}
                    >
                        {formatDistanceToNow(new Date(data.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                        })}
                    </p>
                    <button className="p-1 rounded-full cursor-pointer hover:bg-neutral-100">
                        <DotsThreeIcon weight="bold" size={16} />
                    </button>
                </div>
            </header>
            <section className="my-4 font-medium text-neutral-700 leading-6">
                <p>{data.content}</p>
            </section>
            <footer className="flex gap-4 text-neutral-500 items-center -m-2">
                <button className="text-lg cursor-pointer hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                    <HeartIcon weight="bold" />
                </button>
                <button className="text-lg cursor-pointer hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors">
                    <ChatCircleIcon weight="bold" />
                </button>
            </footer>
        </div>
    )
}
