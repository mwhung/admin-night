import { Card, CardContent } from '@/components/ui/card'

export default function SessionLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background-warm to-background px-4 py-8">
            <div className="mx-auto grid h-[calc(100dvh-10rem)] w-full max-w-5xl grid-rows-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-3 lg:h-[min(66dvh,500px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:grid-rows-1 lg:gap-4">
                <Card className="h-full overflow-hidden border-border/70 bg-card/85">
                    <CardContent className="flex h-full items-center justify-center">
                        <div className="h-40 w-40 rounded-full border border-primary/20 bg-primary/5 animate-pulse" />
                    </CardContent>
                </Card>
                <Card className="h-full overflow-hidden border-border/70 bg-card/85">
                    <CardContent className="space-y-3 p-6">
                        <div className="h-4 w-32 rounded bg-muted/80 animate-pulse" />
                        <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
                        <div className="h-3 w-10/12 rounded bg-muted/60 animate-pulse" />
                        <div className="h-3 w-11/12 rounded bg-muted/60 animate-pulse" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
