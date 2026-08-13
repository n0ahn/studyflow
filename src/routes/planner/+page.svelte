<script lang="ts">
    import PlannerView from '$lib/components/planner/PlannerView.svelte'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    const totalSessions = $derived(() => data.sessions.length)
    const totalMinutes = $derived(() =>
        data.sessions.reduce((sum, s) => sum + s.planned_duration, 0)
    )
    const totalHours = $derived(() => Math.round(totalMinutes() / 60 * 10) / 10)
</script>

<div class="flex flex-col gap-6">
    <div>
        <h1 class="text-2xl font-bold">Planner</h1>
        <p class="text-muted-foreground text-sm mt-0.5">
            {totalSessions()} sessies · {totalHours()}u gepland
        </p>
    </div>

    <PlannerView
        sessions={data.sessions}
        exams={data.exams}
        tasks={data.tasks}
        from={data.from}
        to={data.to}
        today={data.today}
    />
</div>