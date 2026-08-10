<script lang="ts">
    import type { WeeklyTrendPoint } from '$lib/stats/types'

    type Props = {
        points: WeeklyTrendPoint[]
    }

    let { points }: Props = $props()

    const WIDTH = 560
    const HEIGHT = 160
    const PAD = 8

    function formatMinutes(m: number): string {
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u ${rem}m`
    }

    function formatWeekLabel(weekStart: string): string {
        return new Date(weekStart).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    }

    const maxMinutes = $derived(Math.max(...points.map(p => p.minutes), 1))

    const coords = $derived.by(() => {
        if (points.length === 0) return []
        const stepX = points.length === 1 ? 0 : (WIDTH - PAD * 2) / (points.length - 1)
        return points.map((p, i) => {
            const x = PAD + i * stepX
            const y = PAD + (1 - p.minutes / maxMinutes) * (HEIGHT - PAD * 2)
            return { x, y, point: p }
        })
    })

    const linePath = $derived(
        coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
    )

    const areaPath = $derived(
        coords.length === 0
            ? ''
            : `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${HEIGHT} L${coords[0].x.toFixed(1)},${HEIGHT} Z`
    )

    let hoveredIndex = $state<number | null>(null)
</script>

<div class="col-span-7 card p-7">
    <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">Studietijd per week</p>

    {#if points.length === 0}
        <p class="text-sm text-muted-foreground py-10 text-center">Nog geen data over meerdere weken.</p>
    {:else}
        <div class="relative">
            <svg viewBox="0 0 {WIDTH} {HEIGHT}" class="w-full h-40 overflow-visible">
                <defs>
                    <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.4" />
                        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#trendAreaGradient)" />
                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--accent)"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="filter: drop-shadow(0 0 6px oklch(from var(--accent) l c h / 60%));"
                />
                {#each coords as c, i (c.point.weekStart)}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <circle
                        cx={c.x} cy={c.y}
                        r={hoveredIndex === i ? 5 : 3}
                        fill="var(--card)"
                        stroke="var(--accent)"
                        stroke-width="2"
                        class="transition-all duration-150 cursor-default"
                        onmouseenter={() => hoveredIndex = i}
                        onmouseleave={() => hoveredIndex = null}
                    />
                {/each}
            </svg>

            <div class="flex justify-between mt-2">
                {#each coords as c (c.point.weekStart)}
                    <span class="text-[10px] text-muted-foreground">{formatWeekLabel(c.point.weekStart)}</span>
                {/each}
            </div>
        </div>

        <p class="text-xs text-muted-foreground h-4 mt-3">
            {#if hoveredIndex !== null}
                {formatWeekLabel(coords[hoveredIndex].point.weekStart)} — {formatMinutes(coords[hoveredIndex].point.minutes)}
            {/if}
        </p>
    {/if}
</div>