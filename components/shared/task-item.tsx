
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TaskProps {
    task: {
        id: string
        title: string
        state: string
    }
}

export function TaskItem({ task }: TaskProps) {
    return (
        <Card className="mb-2">
            <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium">{task.title}</span>
                <Badge variant={task.state === 'UNCLARIFIED' ? 'secondary' : 'default'}>
                    {task.state}
                </Badge>
            </CardContent>
        </Card>
    )
}
