export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="bg-neutral-100 flex justify-center items-center min-h-dvh px-4 py-6">
            {children}
        </main>
    )
}
