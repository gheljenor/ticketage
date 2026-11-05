import { EXHIBITION_STATUS_LABELS, type ExhibitionStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ExhibitionStatusBadge({ status, className }: { status: ExhibitionStatus; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        status === 'draft' && 'border-border bg-muted text-muted-foreground',
        status === 'open' && 'border-emerald-600/40 bg-emerald-50 text-emerald-700',
        status === 'closed' && 'border-amber-600/40 bg-amber-50 text-amber-700',
        status === 'running' && 'border-sky-600/40 bg-sky-50 text-sky-700',
        status === 'finished' && 'border-border bg-muted text-muted-foreground',
        className,
      )}
    >
      {EXHIBITION_STATUS_LABELS[status]}
    </Badge>
  )
}
