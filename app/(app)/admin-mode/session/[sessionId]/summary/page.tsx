import { redirect } from 'next/navigation'

interface SessionSummaryPageProps {
    params: Promise<{
        sessionId: string
    }>
}

export default async function LegacyAdminModeSessionSummaryPage({ params }: SessionSummaryPageProps) {
    const { sessionId } = await params
    redirect(`/sessions/${sessionId}/summary`)
}
