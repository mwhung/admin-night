import { AdminModeWorkflow } from '@/components/features/session/admin-mode-workflow'

interface SessionSummaryPageProps {
    params: Promise<{
        sessionId: string
    }>
}

export default async function SessionSummaryPage({ params }: SessionSummaryPageProps) {
    const { sessionId } = await params
    return <AdminModeWorkflow view="summary" sessionId={sessionId} />
}
