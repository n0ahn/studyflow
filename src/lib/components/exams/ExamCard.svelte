<script lang="ts">
    import type { ExamWithSubject } from '$lib/types'
    import Pencil from '@lucide/svelte/icons/pencil'
    import Trash2 from '@lucide/svelte/icons/trash-2'
    import Clock from '@lucide/svelte/icons/clock'

    type Props = {
        exam: ExamWithSubject
        onedit: (exam: ExamWithSubject) => void
        ondelete: (exam: ExamWithSubject) => void
    }

    let { exam, onedit, ondelete }: Props = $props()

    const difficultyLabel = { easy: 'Makkelijk', medium: 'Gemiddeld', hard: 'Moeilijk' }
    const difficultyColor = {
        easy: 'bg-emerald-500/10 text-emerald-400',
        medium: 'bg-amber-500/10 text-amber-400',
        hard: 'bg-red-500/10 text-red-400'
    }

    const daysUntil = $derived(() => {
        const diff = new Date(exam.exam_date).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

    const daysLabel = $derived(() => {
        const d = daysUntil()
        if (d === 0) return 'Vandaag'
        if (d < 0) return 'Voorbij'
        if (d === 1) return 'Morgen'
        return `${d} dagen`
    })

    const urgencyClass = $derived(() => {
        const d = daysUntil()
        if (d < 0) return 'text-muted-foreground'
        if (d <= 3) return 'text-destructive font-semibold'
        if (d <= 7) return 'text-amber-400 font-medium'
        return 'text-muted-foreground'
    })

    const hours = $derived(() => Math.round(exam.estimated_study_time / 60 * 10) / 10)
</script>

<div class="card group flex flex-col gap-3 hover:border-white/10 transition-all duration-200">
    <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
            <div
                class="w-2 h-2 rounded-full shrink-0 mt-0.5"
                style="background-color: {exam.subject.color}"
            ></div>
            <div class="min-w-0">
                <p class="font-semibold text-foreground text-sm truncate">{exam.name}</p>
                <p class="text-xs text-muted-foreground">{exam.subject.name}</p>
            </div>
        </div>

        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
                onclick={() => onedit(exam)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
                <Pencil size={13} />
            </button>
            <button
                onclick={() => ondelete(exam)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
                <Trash2 size={13} />
            </button>
        </div>
    </div>

    <div class="flex items-center justify-between">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium {difficultyColor[exam.difficulty]}">
            {difficultyLabel[exam.difficulty]}
        </span>
        <span class="text-xs {urgencyClass()}">{daysLabel()}</span>
    </div>

    <div class="flex items-center justify-between pt-1 border-t border-border">
        <div class="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span class="text-xs">{hours()}u gepland</span>
        </div>
        <span class="text-xs font-medium text-foreground">
            {new Date(exam.exam_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
        </span>
    </div>
</div>