<script lang="ts">
    import type { WeekSummary } from '$lib/stats/types'

    type Props = {
        summary: WeekSummary
    }

    let { summary }: Props = $props()

    function formatDuration(minutes: number): { value: string; unit: string } {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h === 0) return { value: `${m}`, unit: 'm' }
        return { value: `${h}`, unit: m === 0 ? 'u' : `u ${m}m` }
    }

    const formatted = $derived(formatDuration(summary.minutesThisWeek))
</script>

<div class="relative col-span-8 rounded-3xl p-7 flex flex-col justify-center overflow-hidden border border-[oklch(0.66_0.2_275/14%)] bg-linear-to-br from-[oklch(0.66_0.2_275/10%)] to-[oklch(0.58_0.22_275/3%)]">
    <div class="pointer-events-none absolute -top-24 -right-16 size-85 rounded-full bg-[radial-gradient(circle,oklch(0.66_0.2_275/35%),transparent_70%)] blur-3xl"></div>

    <p class="relative text-[11.5px] font-bold uppercase tracking-widest text-[oklch(0.78_0.14_275)]">
        Deze week gestudeerd
    </p>
    <p class="relative flex items-baseline gap-3 mt-2.5 leading-none">
        <span class="text-7xl font-extralight tracking-tight text-foreground">{formatted.value}</span>
        <span class="text-xl text-muted-foreground">{formatted.unit}</span>
    </p>

    {#if summary.trendPercent !== null}
        <p class="relative flex items-center gap-1.5 mt-3.5 text-sm font-semibold {summary.trendPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}">
            <span>{summary.trendPercent >= 0 ? '↑' : '↓'}</span>
            {Math.abs(summary.trendPercent)}% {summary.trendPercent >= 0 ? 'meer' : 'minder'} dan vorige week
        </p>
    {/if}
</div>