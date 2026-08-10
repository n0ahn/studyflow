<script lang="ts">
    import type { PlannedVsActualPoint } from '$lib/stats/types'

    type Props = {
        points: PlannedVsActualPoint[]
    }

    let { points }: Props = $props()

    function formatWeekLabel(weekStart: string): string {
        return new Date(weekStart).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    }

    const maxMinutes = $derived(Math.max(...points.map(p => Math.max(p.plannedMinutes, p.actualMinutes)), 1))

    const totalPlanned = $derived(points.reduce((sum, p) => sum + p.plannedMinutes, 0))
    const totalActual = $derived(points.reduce((sum, p) => sum + p.actualMinutes, 0))
    const overallPercent = $derived(totalPlanned === 0 ? 0 : Math.round((totalActual / totalPlanned) * 100))
</script>

<div class="col-span-12 card p-7">
    <div class="flex items-baseline justify-between mb-1">
        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Planning vs. werkelijkheid</p>
        {#if points.length > 0}
            <p class="text-xs font-semibold" style="color: oklch(from var(--accent) calc(l * 1.15) c h);">{overallPercent}% van plan gehaald</p>
        {/if}
    </div>

    {#if points.length === 0}
        <p class="text-sm text-muted-foreground py-10 text-center">Nog geen data.</p>
    {:else}
        <div class="flex items-end gap-3 mt-6 h-36">
            {#each points as p (p.weekStart)}
                {@const plannedHeight = (p.plannedMinutes / maxMinutes) * 100}
                {@const actualHeight = (p.actualMinutes / maxMinutes) * 100}
                {@const met = p.plannedMinutes === 0 ? true : p.actualMinutes >= p.plannedMinutes}
                <div class="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                    <div class="relative w-full h-full flex items-end justify-center">
                        <div
                            class="absolute bottom-0 w-full max-w-8 rounded-md border border-dashed border-white/15"
                            style="height: {plannedHeight}%;"
                        ></div>
                        <div
                            class="absolute bottom-0 w-full max-w-8 rounded-md transition-all duration-300 group-hover:brightness-110"
                            style="height: {actualHeight}%; background: {met
                                ? 'linear-gradient(180deg, oklch(0.7 0.16 155), oklch(0.6 0.18 155))'
                                : 'linear-gradient(180deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent))'};
                                box-shadow: 0 0 12px {met ? 'oklch(0.65 0.17 155 / 40%)' : 'oklch(from var(--accent) l c h / 40%)'};"
                        ></div>
                    </div>
                    <span class="text-[10px] text-muted-foreground">{formatWeekLabel(p.weekStart)}</span>
                </div>
            {/each}
        </div>

        <div class="flex items-center gap-5 mt-5 pt-4 border-t border-border">
            <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-sm border border-dashed border-white/25"></div>
                <span class="text-[11px] text-muted-foreground">Gepland</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-sm" style="background: oklch(0.6 0.18 155);"></div>
                <span class="text-[11px] text-muted-foreground">Gehaald</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-sm" style="background: var(--accent);"></div>
                <span class="text-[11px] text-muted-foreground">Onder plan</span>
            </div>
        </div>
    {/if}
</div>