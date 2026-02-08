import { AdminModeWorkflow } from '@/components/features/session/admin-mode-workflow'

interface SessionPageProps {
    params: Promise<{
        sessionId: string
    }>
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { sessionId } = await params
    return <AdminModeWorkflow view="session" sessionId={sessionId} />
}
