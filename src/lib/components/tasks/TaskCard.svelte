<script lang="ts">
    import type { TaskWithSubject } from '$lib/types'
    import Pencil from '@lucide/svelte/icons/pencil'
    import Trash2 from '@lucide/svelte/icons/trash-2'
    import Clock from '@lucide/svelte/icons/clock'

    type Props = {
        task: TaskWithSubject
        onedit: (task: TaskWithSubject) => void
        ondelete: (task: TaskWithSubject) => void
    }

    let { task, onedit, ondelete }: Props = $props()

    const priorityConfig = {
        high:   { label: 'Hoog',     class: 'bg-red-500/10 text-red-400',     dot: 'bg-red-400' },
        medium: { label: 'Gemiddeld', class: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
        low:    { label: 'Laag',     class: 'bg-secondary text-muted-foreground', dot: 'bg-muted-foreground' }
    }

    const daysUntil = $derived(() => {
        const diff = new Date(task.deadline).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

    const daysLabel = $derived(() => {
        const d = daysUntil()
        if (d === 0) return 'Vandaag'
        if (d < 0) return 'Verlopen'
        if (d === 1) return 'Morgen'
        return `${d} dagen`
    })

    const urgencyClass = $derived(() => {
        const d = daysUntil()
        if (d < 0) return 'text-muted-foreground line-through'
        if (d <= 3) return 'text-destructive font-semibold'
        if (d <= 7) return 'text-amber-400 font-medium'
        return 'text-muted-foreground'
    })

    const hours = $derived(() => Math.round(task.estimated_time / 60 * 10) / 10)
    const priority = $derived(() => priorityConfig[task.priority])
</script>

<div class="card group flex flex-col gap-3 hover:border-white/10 transition-all duration-200">
    <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
            <div
                class="w-2 h-2 rounded-full shrink-0 mt-0.5"
                style="background-color: {task.subject.color}"
            ></div>
            <div class="min-w-0">
                <p class="font-semibold text-foreground text-sm truncate">{task.title}</p>
                <p class="text-xs text-muted-foreground">{task.subject.name}</p>
            </div>
        </div>

        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
                onclick={() => onedit(task)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
                <Pencil size={13} />
            </button>
            <button
                onclick={() => ondelete(task)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
                <Trash2 size={13} />
            </button>
        </div>
    </div>

    <div class="flex items-center justify-between">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium {priority().class}">
            {priority().label}
        </span>
        <span class="text-xs {urgencyClass()}">{daysLabel()}</span>
    </div>

    <div class="flex items-center justify-between pt-1 border-t border-border">
        <div class="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span class="text-xs">{hours()}u geschat</span>
        </div>
        <span class="text-xs font-medium text-foreground">
            {new Date(task.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
        </span>
    </div>
</div>