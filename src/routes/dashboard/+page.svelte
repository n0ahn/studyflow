<script lang="ts">
    import { getAuthContext } from '$lib/stores'
    import type { PageData } from './$types'
    import Calendar from '@lucide/svelte/icons/calendar'
    import CheckSquare from '@lucide/svelte/icons/check-square-2'
    import Clock from '@lucide/svelte/icons/clock'
    import BookOpen from '@lucide/svelte/icons/book-open'

    let { data }: { data: PageData } = $props()
    const auth = getAuthContext()

    const greeting = $derived(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Goedemorgen'
        if (hour < 18) return 'Goedemiddag'
        return 'Goedenavond'
    })

    const weekHours = $derived(() => Math.round(data.weekMinutes / 60 * 10) / 10)

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('nl-NL', {
            weekday: 'short', day: 'numeric', month: 'short'
        })
    }

    function daysUntil(dateStr: string) {
        const diff = new Date(dateStr).getTime() - new Date().getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Vandaag'
        if (days === 1) return 'Morgen'
        return `${days} dagen`
    }

    function daysUntilColor(dateStr: string) {
        const diff = new Date(dateStr).getTime() - new Date().getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (days <= 3) return 'text-destructive'
        if (days <= 7) return 'text-warning'
        return 'text-muted-foreground'
    }

    const priorityColor = {
        high: 'text-destructive',
        medium: 'text-warning',
        low: 'text-muted-foreground'
    }

    const priorityLabel = {
        high: 'Hoog',
        medium: 'Gemiddeld',
        low: 'Laag'
    }
</script>

<div class="flex flex-col gap-8 max-w-5xl">

    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold">
            {greeting()} 👋
        </h1>
        <p class="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4">
        <div class="card flex flex-col gap-1">
            <div class="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span class="text-xs">Studietijd deze week</span>
            </div>
            <p class="text-2xl font-bold">{weekHours()}u</p>
        </div>

        <div class="card flex flex-col gap-1">
            <div class="flex items-center gap-2 text-muted-foreground">
                <CheckSquare size={14} />
                <span class="text-xs">Openstaande taken</span>
            </div>
            <p class="text-2xl font-bold">{data.totalTasks}</p>
        </div>

        <div class="card flex flex-col gap-1">
            <div class="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span class="text-xs">Sessies vandaag</span>
            </div>
            <p class="text-2xl font-bold">{data.todaySessions.length}</p>
        </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-2 gap-6">

        <!-- Vandaag -->
        <div class="card flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <Calendar size={15} class="text-accent" />
                <h2 class="text-sm font-semibold">Vandaag</h2>
            </div>

            {#if data.todaySessions.length === 0}
                <p class="text-sm text-muted-foreground">Geen sessies gepland voor vandaag.</p>
            {:else}
                <div class="flex flex-col gap-2">
                    {#each data.todaySessions as session}
                        <div class="flex items-center gap-3 py-2 border-b border-border last:border-0">
                            <div
                                class="w-2 h-2 rounded-full shrink-0"
                                style="background-color: {session.subject.color}"
                            ></div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">
                                    {session.exam?.name ?? session.task?.title ?? session.subject.name}
                                </p>
                                <p class="text-xs text-muted-foreground">{session.subject.name}</p>
                            </div>
                            <span class="text-xs text-muted-foreground shrink-0">
                                {session.planned_duration}m
                            </span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Komende toetsen -->
        <div class="card flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <BookOpen size={15} class="text-accent" />
                <h2 class="text-sm font-semibold">Komende toetsen</h2>
            </div>

            {#if data.upcomingExams.length === 0}
                <p class="text-sm text-muted-foreground">Geen toetsen gepland.</p>
            {:else}
                <div class="flex flex-col gap-2">
                    {#each data.upcomingExams as exam}
                        <div class="flex items-center gap-3 py-2 border-b border-border last:border-0">
                            <div
                                class="w-2 h-2 rounded-full shrink-0"
                                style="background-color: {exam.subject.color}"
                            ></div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">{exam.name}</p>
                                <p class="text-xs text-muted-foreground">{exam.subject.name}</p>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-xs font-medium {daysUntilColor(exam.exam_date)}">
                                    {daysUntil(exam.exam_date)}
                                </p>
                                <p class="text-xs text-muted-foreground">{formatDate(exam.exam_date)}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Prioriteiten -->
        <div class="card flex flex-col gap-4 col-span-2">
            <div class="flex items-center gap-2">
                <CheckSquare size={15} class="text-accent" />
                <h2 class="text-sm font-semibold">Prioriteiten</h2>
            </div>

            {#if data.priorityTasks.length === 0}
                <p class="text-sm text-muted-foreground">Geen openstaande taken.</p>
            {:else}
                <div class="grid grid-cols-2 gap-2">
                    {#each data.priorityTasks as task}
                        <div class="flex items-center gap-3 py-2 border-b border-border last:border-0">
                            <div
                                class="w-2 h-2 rounded-full shrink-0"
                                style="background-color: {task.subject.color}"
                            ></div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">{task.title}</p>
                                <p class="text-xs text-muted-foreground">{task.subject.name}</p>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-xs font-medium {priorityColor[task.priority]}">
                                    {priorityLabel[task.priority]}
                                </p>
                                <p class="text-xs {daysUntilColor(task.deadline)}">
                                    {daysUntil(task.deadline)}
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>