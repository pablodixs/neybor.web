export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="bg-neutral-100 flex justify-center items-center h-screen">
            {children}
        </main>
    )
}
