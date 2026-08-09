<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import DayColumn from './DayColumn.svelte'

    type Props = {
        sessions: StudySessionWithDetails[]
        from: string
        to: string
    }

    let { sessions, from, to }: Props = $props()

    const today = new Date().toISOString().split('T')[0]

    const days = $derived(() => {
        const result: string[] = []
        const start = new Date(from)
        const end = new Date(to)

        const current = new Date(start)
        while (current <= end) {
            result.push(current.toISOString().split('T')[0])
            current.setDate(current.getDate() + 1)
        }

        return result
    })

    function getSessionsForDay(date: string): StudySessionWithDetails[] {
        return sessions.filter(s => s.date === date)
    }
</script>

<div class="grid gap-4" style="grid-template-columns: repeat({Math.min(days().length, 7)}, minmax(0, 1fr))">
    {#each days().slice(0, 7) as date (date)}
        <DayColumn
            {date}
            sessions={getSessionsForDay(date)}
            isToday={date === today}
        />
    {/each}
</div>