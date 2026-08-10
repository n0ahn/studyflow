<script lang="ts">
    import { SvelteDate } from 'svelte/reactivity'
    import type { ExamProgressEntry } from '$lib/stats/types'

    type Props = {
        entries: ExamProgressEntry[]
    }

    let { entries }: Props = $props()

    function formatMinutes(m: number): string {
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u ${rem}m`
    }

    function daysUntil(dateStr: string): number {
        const today = new SvelteDate()
        today.setHours(0, 0, 0, 0)

        const diff = new SvelteDate(dateStr).getTime() - today.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    function formatDaysUntil(dateStr: string): string {
        const days = daysUntil(dateStr)
        if (days === 0) return 'vandaag'
        if (days === 1) return 'morgen'
        if (days < 0) return 'verlopen'
        return `over ${days} dagen`
    }

    const sorted = $derived([...entries].sort((a, b) => a.examDate.localeCompare(b.examDate)))
</script>

<div class="col-span-7 card p-7">
    <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Voortgang per toets</p>

    {#if sorted.length === 0}
        <p class="text-sm text-muted-foreground py-10 text-center">Geen aankomende toetsen.</p>
    {:else}
        <div class="flex flex-col">
            {#each sorted as exam, i (exam.examId)}
                {@const percent = Math.round(exam.progressFraction * 100)}
                <div class="py-4 {i !== sorted.length - 1 ? 'border-b border-border' : ''}">
                    <div class="flex items-center justify-between mb-2.5">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-2 h-2 rounded-full shrink-0" style="background-color: {exam.subjectColor};"></div>
                            <p class="text-sm font-medium text-foreground truncate">{exam.examName}</p>
                        </div>
                        <span class="text-[11.5px] text-muted-foreground shrink-0 ml-3">{formatDaysUntil(exam.examDate)}</span>
                    </div>

                    <div class="h-2 rounded-full bg-white/6 overflow-hidden">
                        <div
                            class="h-full rounded-full transition-all duration-500"
                            style="width: {percent}%; background: linear-gradient(90deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent)); box-shadow: 0 0 8px oklch(from var(--accent) l c h / 50%);"
                        ></div>
                    </div>

                    <div class="flex items-center justify-between mt-2">
                        <span class="text-[11.5px] text-muted-foreground">
                            {formatMinutes(exam.completedMinutes)} van {formatMinutes(exam.estimatedMinutes)}
                        </span>
                        <span class="text-[11.5px] font-semibold" style="color: oklch(from var(--accent) calc(l * 1.15) c h);">{percent}%</span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>