<script lang="ts">
    import type { UserSettings, AvailableTime } from '$lib/types'
    import Button from '$lib/components/ui/Button.svelte'

    type Props = {
        initial?: UserSettings | null
        onsubmit: (data: Partial<UserSettings>) => void
        loading?: boolean
    }

    let { initial = null, onsubmit, loading = false }: Props = $props()

    const days: { key: keyof AvailableTime; label: string; short: string }[] = [
        { key: 'monday',    label: 'Maandag',    short: 'Ma' },
        { key: 'tuesday',   label: 'Dinsdag',    short: 'Di' },
        { key: 'wednesday', label: 'Woensdag',   short: 'Wo' },
        { key: 'thursday',  label: 'Donderdag',  short: 'Do' },
        { key: 'friday',    label: 'Vrijdag',    short: 'Vr' },
        { key: 'saturday',  label: 'Zaterdag',   short: 'Za' },
        { key: 'sunday',    label: 'Zondag',     short: 'Zo' },
    ]

    const timeOptions = [
        { label: 'Vrij', value: 0 },
        { label: '30m',  value: 30 },
        { label: '1u',   value: 60 },
        { label: '1.5u', value: 90 },
        { label: '2u',   value: 120 },
        { label: '3u',   value: 180 },
        { label: '4u',   value: 240 },
        { label: '6u',   value: 360 },
        { label: '8u',   value: 480 },
    ]

    const sessionOptions = [15, 25, 30, 45, 50, 60, 90, 120]
    const breakOptions = [5, 10, 15, 20, 30]
    const horizonOptions = [
        { label: '1 week',   value: 7 },
        { label: '2 weken',  value: 14 },
        { label: '3 weken',  value: 21 },
        { label: '1 maand',  value: 30 },
        { label: '2 maanden', value: 60 },
    ]

    let available_time = $state<AvailableTime>({
        monday: 60, tuesday: 60, wednesday: 60,
        thursday: 60, friday: 60, saturday: 120, sunday: 120,
    })

    let session_duration = $state(50)
    let break_duration = $state(10)
    let planning_horizon = $state(14)

    $effect(() => {
        if (initial) {
            available_time = { ...initial.available_time }
            session_duration = initial.session_duration
            break_duration = initial.break_duration
            planning_horizon = initial.planning_horizon
        }
    })

    function handleSubmit() {
        onsubmit({ available_time, session_duration, break_duration, planning_horizon })
    }
</script>

<div class="flex flex-col gap-8">

    <!-- Beschikbare tijd per dag -->
    <div class="flex flex-col gap-4">
        <div>
            <p class="text-sm font-medium text-foreground">Beschikbare tijd per dag</p>
            <p class="text-xs text-muted-foreground mt-0.5">Hoeveel tijd kun je elke dag studeren?</p>
        </div>

        <div class="flex flex-col gap-2">
            {#each days as day}
                <div class="flex items-center gap-3">
                    <span class="text-sm text-muted-foreground w-20 shrink-0">{day.label}</span>
                    <div class="flex gap-1.5 flex-wrap flex-1">
                        {#each timeOptions as option}
                            <button
                                onclick={() => available_time[day.key] = option.value}
                                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150
                                    {available_time[day.key] === option.value
                                        ? 'bg-accent text-white'
                                        : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                            >
                                {option.label}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Sessieduur -->
    <div class="flex flex-col gap-4">
        <div>
            <p class="text-sm font-medium text-foreground">Sessieduur</p>
            <p class="text-xs text-muted-foreground mt-0.5">Hoe lang duurt een studiesessie?</p>
        </div>

        <div class="flex gap-2 flex-wrap">
            {#each sessionOptions as option}
                <button
                    onclick={() => session_duration = option}
                    class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                        {session_duration === option
                            ? 'bg-accent text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                >
                    {option < 60 ? `${option}m` : `${option / 60}u`}
                </button>
            {/each}
        </div>
    </div>

    <!-- Pauze -->
    <div class="flex flex-col gap-4">
        <div>
            <p class="text-sm font-medium text-foreground">Pauze tussen sessies</p>
            <p class="text-xs text-muted-foreground mt-0.5">Hoeveel pauze neem je tussen sessies?</p>
        </div>

        <div class="flex gap-2 flex-wrap">
            {#each breakOptions as option}
                <button
                    onclick={() => break_duration = option}
                    class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                        {break_duration === option
                            ? 'bg-accent text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                >
                    {option}m
                </button>
            {/each}
        </div>
    </div>

    <!-- Planning horizon -->
    <div class="flex flex-col gap-4">
        <div>
            <p class="text-sm font-medium text-foreground">Vooruit plannen</p>
            <p class="text-xs text-muted-foreground mt-0.5">Hoe ver vooruit moet de planner plannen?</p>
        </div>

        <div class="flex gap-2 flex-wrap">
            {#each horizonOptions as option}
                <button
                    onclick={() => planning_horizon = option.value}
                    class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                        {planning_horizon === option.value
                            ? 'bg-accent text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                >
                    {option.label}
                </button>
            {/each}
        </div>
    </div>

    <Button onclick={handleSubmit} disabled={loading}>
        {loading ? 'Opslaan...' : 'Instellingen opslaan'}
    </Button>
</div>