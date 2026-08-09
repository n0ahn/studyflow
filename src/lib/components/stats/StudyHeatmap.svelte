<script lang="ts">
    import type { HeatmapDay } from '$lib/stats/types'

    type Props = {
        days: HeatmapDay[]
    }

    let { days }: Props = $props()

    const MONTH_NAMES = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
    const DAY_LABELS = ['', 'Ma', '', 'Wo', '', 'Vr', '']

    const weeks = $derived.by(() => {
        if (days.length === 0) return []

        const firstDate = new Date(days[0].date)
        const firstDow = firstDate.getDay()
        const mondayOffset = firstDow === 0 ? 6 : firstDow - 1
        const padded: (HeatmapDay | null)[] = [...Array(mondayOffset).fill(null), ...days]

        const result: (HeatmapDay | null)[][] = []
        for (let i = 0; i < padded.length; i += 7) {
            result.push(padded.slice(i, i + 7))
        }
        return result
    })

    const monthLabels = $derived.by(() => {
        const labels: { weekIndex: number; label: string }[] = []
        let lastMonth = -1
        weeks.forEach((week, i) => {
            const firstRealDay = week.find(d => d !== null)
            if (!firstRealDay) return
            const month = new Date(firstRealDay.date).getMonth()
            if (month !== lastMonth) {
                labels.push({ weekIndex: i, label: MONTH_NAMES[month] })
                lastMonth = month
            }
        })
        return labels
    })

    const levelStyles: Record<number, string> = {
        0: 'background: oklch(1 0 0 / 4%);',
        1: 'background: oklch(0.66 0.2 275 / 22%);',
        2: 'background: oklch(0.66 0.2 275 / 45%);',
        3: 'background: oklch(0.66 0.2 275 / 70%);',
        4: 'background: oklch(0.72 0.2 275); box-shadow: 0 0 8px oklch(0.66 0.2 275 / 70%);'
    }

    function formatTooltip(day: HeatmapDay): string {
        const date = new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
        if (day.minutes === 0) return `${date} — geen activiteit`
        const h = Math.floor(day.minutes / 60)
        const m = day.minutes % 60
        const duration = h === 0 ? `${m}m` : m === 0 ? `${h}u` : `${h}u ${m}m`
        return `${date} — ${duration}`
    }

    let hoveredDay = $state<HeatmapDay | null>(null)
</script>

<div class="flex flex-col gap-3">
    <div class="relative overflow-x-auto">
        <div class="inline-flex flex-col gap-2 min-w-full">
            <div class="flex gap-1 pl-6 relative h-4">
                {#each monthLabels as { weekIndex, label } (weekIndex)}
                    <span
                        class="absolute text-[11px] text-muted-foreground"
                        style="left: calc({weekIndex} * (14px + 4px) + 24px);"
                    >
                        {label}
                    </span>
                {/each}
            </div>

            <div class="flex gap-1">
                <div class="flex flex-col gap-1 pr-1 shrink-0">
                    {#each DAY_LABELS as label, i (i)}
                        <span class="text-[10px] text-muted-foreground h-3.5 leading-3.5 w-5 text-right">{label}</span>
                    {/each}
                </div>

                {#each weeks as week, weekIndex (week[0]?.date ?? weekIndex)}
                    <div class="flex flex-col gap-1">
                        {#each week as day, dayIndex (day?.date ?? dayIndex)}
                            {#if day}
                                <div
                                    role="img"
                                    aria-label={formatTooltip(day)}
                                    class="w-3.5 h-3.5 rounded-[3px] transition-transform duration-150 hover:scale-125 cursor-default"
                                    style={levelStyles[day.level]}
                                    onmouseenter={() => hoveredDay = day}
                                    onmouseleave={() => hoveredDay = null}
                                ></div>
                            {:else}
                                <div class="w-3.5 h-3.5"></div>
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="flex items-center justify-between">
        <p class="text-xs text-muted-foreground h-4">
            {hoveredDay ? formatTooltip(hoveredDay) : ''}
        </p>
        <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Minder</span>
            {#each [0, 1, 2, 3, 4] as level (level)}
                <div class="w-2.5 h-2.5 rounded-xs" style={levelStyles[level]}></div>
            {/each}
            <span>Meer</span>
        </div>
    </div>
</div>