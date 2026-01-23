export default function UserPage({ params }: { params: { user: string } }) {
    return <div>User Page for {params.user}</div>
}
