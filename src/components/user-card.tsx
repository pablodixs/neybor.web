import Image from 'next/image'
import Link from 'next/link'
import { SealCheckIcon, SealWarningIcon } from '@phosphor-icons/react/dist/ssr'

import { Author } from './post'

export function UserCard({ author }: { author: Author }) {
    return (
        <Link className="flex gap-2 items-center" href={`/${author.handle}`}>
            <Image
                className="rounded-full aspect-square object-cover w-9 h-9 mb-1"
                src={author.avatarUrl || '/images/default-avatar.png'}
                alt={author.displayName || 'User avatar'}
                width={36}
                height={36}
            />
            <div className="flex flex-col gap-2">
                <strong className="flex font-semibold leading-3 items-center gap-1">
                    {author.displayName}
                    {author.isVerified ? (
                        <SealCheckIcon
                            weight="fill"
                            className="text-green-500"
                        />
                    ) : (
                        <SealWarningIcon className="text-neutral-500" />
                    )}
                </strong>
                <div className="font-medium text-sm text-neutral-500 leading-2 flex gap-1">
                    <p>{author.neighborhood}</p>
                </div>
            </div>
        </Link>
    )
}
