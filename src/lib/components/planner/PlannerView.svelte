<script lang="ts">
    import type { StudySessionWithDetails, ExamWithSubject, TaskWithSubject } from '$lib/types'
    import DayColumn from './DayColumn.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import RefreshCw from '@lucide/svelte/icons/refresh-cw'
    import CalendarDays from '@lucide/svelte/icons/calendar-days'
    import CalendarRange from '@lucide/svelte/icons/calendar-range'
    import ChevronLeft from '@lucide/svelte/icons/chevron-left'
    import ChevronRight from '@lucide/svelte/icons/chevron-right'
    import { enhance } from '$app/forms'
    import { invalidateAll } from '$app/navigation'

    type Deadline = { date: string; label: string; color: string; type: 'exam' | 'task' }

    type Props = {
        sessions: StudySessionWithDetails[]
        exams: ExamWithSubject[]
        tasks: TaskWithSubject[]
        from: string
        to: string
        today: string
    }

    let { sessions, exams, tasks, from, to, today }: Props = $props()

    type ViewMode = 'week' | 'month'
    let viewMode = $state<ViewMode>('week')
    let weekOffset = $state(0) // 0 = huidige week

    let isReplanning = $state(false)
    let summaryMessage = $state<string | null>(null)
    let warnings = $state<string[]>([])

    // Bereken maandag van de huidige week op basis van `from` (server geeft al maandag terug)
    function addUTCDays(dateStr: string, days: number): string {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const d = new Date(dateStr + 'T12:00:00Z')
        d.setUTCDate(d.getUTCDate() + days)
        return d.toISOString().split('T')[0]
    }

    function getMondayOfWeek(offset: number): string {
        return addUTCDays(from, offset * 7)
    }

    // Week-view: 7 dagen vanaf maandag van de geselecteerde week
    const weekDays = $derived(() => {
        const monday = getMondayOfWeek(weekOffset)
        return Array.from({ length: 7 }, (_, i) => addUTCDays(monday, i))
    })

    // Maand-view: kalendermaand van de eerste dag van de geselecteerde week
    const monthDays = $derived(() => {
        const monday = getMondayOfWeek(weekOffset)
        const refDate = new Date(monday + 'T12:00:00Z')
        const year = refDate.getUTCFullYear()
        const month = refDate.getUTCMonth()

        // Eerste dag van de maand
        const firstOfMonth = new Date(Date.UTC(year, month, 1))
        // Laatste dag van de maand
        const lastOfMonth = new Date(Date.UTC(year, month + 1, 0))

        // Begin op maandag vóór of op de eerste dag
        const firstUTCDay = firstOfMonth.getUTCDay()
        const startOffset = firstUTCDay === 0 ? -6 : 1 - firstUTCDay
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const start = new Date(firstOfMonth)
        start.setUTCDate(firstOfMonth.getUTCDate() + startOffset)

        // Eindig op zondag na of op de laatste dag
        const lastUTCDay = lastOfMonth.getUTCDay()
        const endOffset = lastUTCDay === 0 ? 0 : 7 - lastUTCDay
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const end = new Date(lastOfMonth)
        end.setUTCDate(lastOfMonth.getUTCDate() + endOffset)

        const days: string[] = []
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const cur = new Date(start)
        while (cur <= end) {
            days.push(cur.toISOString().split('T')[0])
            cur.setUTCDate(cur.getUTCDate() + 1)
        }
        return days
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const activeDays = $derived(() => viewMode === 'week' ? weekDays() : monthDays())

    // Deadlines uit exams en tasks
    const deadlines = $derived((): Deadline[] => [
        ...exams.map(e => ({
            date: e.exam_date,
            label: e.name,
            color: e.subject.color,
            type: 'exam' as const
        })),
        ...tasks.map(t => ({
            date: t.deadline,
            label: t.title,
            color: t.subject.color,
            type: 'task' as const
        }))
    ])

    function getSessionsForDay(date: string): StudySessionWithDetails[] {
        return sessions.filter(s => s.date === date)
    }

    function getDeadlinesForDay(date: string): Deadline[] {
        return deadlines().filter(d => d.date === date)
    }

    // Label voor week-navigatie
    const weekLabel = $derived(() => {
        const days = weekDays()
        const first = new Date(days[0] + 'T12:00:00Z')
        const last = new Date(days[6] + 'T12:00:00Z')
        const firstStr = first.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
        const lastStr = last.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
        return `${firstStr} – ${lastStr}`
    })

    const monthLabel = $derived(() => {
        const monday = getMondayOfWeek(weekOffset)
        const d = new Date(monday + 'T12:00:00Z')
        return d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    })

    // Controleer of datum buiten de geladen range valt
    function isOutOfRange(date: string): boolean {
        return date < from || date > to
    }
</script>

<div class="flex flex-col gap-3">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
            <!-- Week/maand toggle -->
            <div class="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                    onclick={() => viewMode = 'week'}
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                        {viewMode === 'week' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'}"
                >
                    <CalendarDays size={12} />
                    Week
                </button>
                <button
                    onclick={() => viewMode = 'month'}
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                        {viewMode === 'month' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'}"
                >
                    <CalendarRange size={12} />
                    Maand
                </button>
            </div>

            <!-- Navigatie -->
            <div class="flex items-center gap-1">
                <button
                    onclick={() => weekOffset--}
                    class="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <span class="text-sm text-muted-foreground min-w-36 text-center">
                    {viewMode === 'week' ? weekLabel() : monthLabel()}
                </span>
                <button
                    onclick={() => weekOffset++}
                    class="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {#if weekOffset !== 0}
                <button
                    onclick={() => weekOffset = 0}
                    class="text-xs text-accent hover:underline"
                >
                    Vandaag
                </button>
            {/if}
        </div>

        <!-- Herplan knop -->
        <form
            method="POST"
            action="?/replan"
            use:enhance={() => {
                isReplanning = true
                summaryMessage = null
                warnings = []
                return async ({ result }) => {
                    isReplanning = false
                    if (result.type === 'success' && result.data?.compressResult) {
                        const { sessionsCreated, warnings: newWarnings } = result.data.compressResult as {
                            sessionsCreated: number
                            warnings: string[]
                        }
                        warnings = newWarnings
                        summaryMessage = newWarnings.length > 0
                            ? `${sessionsCreated} sessies herverdeeld, maar ${newWarnings.length} item(s) passen nog niet volledig.`
                            : `${sessionsCreated} sessies herverdeeld. Alles past weer binnen de planning.`
                        await invalidateAll()
                    } else {
                        summaryMessage = 'Herplannen is niet gelukt, probeer het opnieuw.'
                    }
                }
            }}
        >
            <Button type="submit" variant="secondary" size="sm" disabled={isReplanning}>
                <RefreshCw size={14} class={isReplanning ? 'animate-spin' : ''} />
                {isReplanning ? 'Herplannen...' : 'Herplan'}
            </Button>
        </form>
    </div>

    {#if summaryMessage}
        <p class="text-sm text-muted-foreground">{summaryMessage}</p>
    {/if}

    {#if warnings.length > 0}
        <div class="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 flex flex-col gap-1">
            <p class="text-sm font-medium text-amber-400">Niet alles kon ingepland worden</p>
            {#each warnings as warning (warning)}
                <p class="text-xs text-amber-400/60">{warning}</p>
            {/each}
        </div>
    {/if}

    <!-- Weekdagen header voor maand-view -->
    {#if viewMode === 'month'}
        <div class="grid grid-cols-7 gap-1">
            {#each ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'] as day (day)}
                <div class="text-xs font-semibold text-muted-foreground text-center pb-1">{day}</div>
            {/each}
        </div>
    {/if}

    <!-- Kalender grid -->
    {#if sessions.length === 0 && viewMode === 'week' && weekOffset === 0}
        <div class="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <div class="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <span class="text-2xl">📅</span>
            </div>
            <div>
                <p class="text-sm font-semibold text-foreground">Geen sessies gepland</p>
                <p class="text-sm text-muted-foreground mt-1">Voeg toetsen of taken toe, of klik op Herplan om een planning te genereren.</p>
            </div>
        </div>
    {:else if viewMode === 'week'}
        <div class="grid gap-3" style="grid-template-columns: repeat(7, minmax(0, 1fr))">
            {#each weekDays() as date (date)}
                <DayColumn
                    {date}
                    sessions={getSessionsForDay(date)}
                    deadlines={getDeadlinesForDay(date)}
                    isToday={date === today}
                    dimmed={false}
                />
            {/each}
        </div>
    {:else}
        <div class="grid grid-cols-7 gap-1">
            {#each monthDays() as date (date)}
                {@const refMonday = getMondayOfWeek(weekOffset)}
                {@const refDate = new Date(refMonday + 'T12:00:00Z')}
                {@const currentMonth = refDate.getUTCMonth()}
                {@const cellMonth = new Date(date + 'T12:00:00Z').getUTCMonth()}
                <DayColumn
                    {date}
                    sessions={getSessionsForDay(date)}
                    deadlines={getDeadlinesForDay(date)}
                    isToday={date === today}
                    compact={true}
                    dimmed={cellMonth !== currentMonth || isOutOfRange(date)}
                />
            {/each}
        </div>
    {/if}
</div>