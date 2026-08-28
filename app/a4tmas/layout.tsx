import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Prüfen, ob der User eingeloggt ist
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get('admin-auth')?.value === 'true'

    // Wenn nicht eingeloggt → zur Login-Seite weiterleiten
    if (!isLoggedIn) {
        redirect('/admin-login')
    }

    return <>{children}</>
}