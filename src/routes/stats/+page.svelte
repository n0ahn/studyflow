<script lang="ts">
    import HeroSummary from '$lib/components/stats/HeroSummary.svelte'
    import StreakCard from '$lib/components/stats/StreakCard.svelte'
    import StatCard from '$lib/components/stats/StatCard.svelte'
    import StudyHeatmap from '$lib/components/stats/StudyHeatmap.svelte'
    import InsightsFeed from '$lib/components/stats/InsightsFeed.svelte'
    import ConsistencyRing from '$lib/components/stats/ConsistencyRing.svelte'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    function formatMinutes(m: number): string {
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u ${rem}m`
    }
</script>

<div class="flex flex-col gap-5 max-w-310">
    <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Statistieken</h1>
        <p class="text-sm text-muted-foreground mt-1">Laatste 6 maanden</p>
    </div>

    <div class="grid grid-cols-12 gap-4">
        <HeroSummary summary={data.weekSummary} />
        <StreakCard
            currentStreak={data.weekSummary.currentStreak}
            longestStreak={data.weekSummary.longestStreak}
        />

        <StatCard value={formatMinutes(data.coreStats.averageSessionMinutes)} label="Gem. sessieduur" />
        <StatCard value={`${data.coreStats.completedSessionCount}`} label="Sessies voltooid" />
        <StatCard value={`${data.coreStats.planAdherencePercent}%`} label="Plan gehaald" />

        <div class="col-span-7 card p-7">
            <div class="flex items-baseline justify-between mb-5">
                <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Studieactiviteit</p>
                <p class="text-xs font-semibold text-[oklch(0.78_0.14_275)]">{data.heatmap.length} dagen</p>
            </div>
            <StudyHeatmap days={data.heatmap} />
        </div>
        <ConsistencyRing percent={data.weekSummary.consistencyPercent} />

        <InsightsFeed insights={data.insights} />
    </div>
</div>