export function PostSkeleton() {
    return (
        <div aria-hidden="true" className="border-b border-neutral-100 py-5 motion-safe:animate-pulse">
            <div className="flex items-center gap-2">
                <div className="size-6 shrink-0 rounded-full bg-neutral-100" />
                <div className="h-3 w-28 rounded-full bg-neutral-100" />
                <div className="ml-auto h-3 w-12 rounded-full bg-neutral-100" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3.5 w-11/12 rounded-full bg-neutral-100" />
                <div className="h-3.5 w-2/3 rounded-full bg-neutral-100" />
            </div>
            <div className="mt-5 flex gap-5">
                <div className="h-4 w-10 rounded-full bg-neutral-100" />
                <div className="h-4 w-10 rounded-full bg-neutral-100" />
            </div>
        </div>
    )
}
