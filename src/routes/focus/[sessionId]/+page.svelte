<script lang="ts">
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { supabase } from '$lib/supabase'
    import { updateSession } from '$lib/services/sessions'
    import FocusTimer from '$lib/components/focus/FocusTimer.svelte'
    import FocusChecklist from '$lib/components/focus/FocusChecklist.svelte'
    import FocusNotes from '$lib/components/focus/FocusNotes.svelte'
    import X from '@lucide/svelte/icons/x'
    import type { ChecklistItem } from '$lib/types'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    const session = $derived(data.session)

    let checklist = $derived.by<ChecklistItem[]>(() => data.session.checklist ?? [])

    async function handleChecklistChange(updated: ChecklistItem[]) {
        checklist = updated
        try {
            await updateSession(supabase, session.id, { checklist: updated })
        } catch (e) {
            console.error(e)
        }
    }

    function handleExit() {
        goto(resolve('/planner'))
    }
</script>

<div class="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
    <!-- Ambient achtergrondgloed -->
    <div
        class="pointer-events-none absolute inset-0"
        style="background:
            radial-gradient(ellipse 1100px 750px at 50% 38%, oklch(from var(--accent) l c h / 14%), transparent 62%),
            radial-gradient(ellipse 800px 600px at 50% 100%, oklch(from var(--accent) l c h / 8%), transparent 60%);"
    ></div>

    <!-- Topbar -->
    <div class="relative z-10 flex items-center justify-between px-8 py-7">
        <div class="flex items-center gap-2.5">
            <div
                class="w-2 h-2 rounded-full shrink-0"
                style="background-color: {session.subject.color}; box-shadow: 0 0 12px {session.subject.color};"
            ></div>
            <span class="text-sm text-muted-foreground tracking-wide">{session.subject.name}</span>
        </div>
        <button
            onclick={handleExit}
            class="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-white/6"
            aria-label="Focus mode verlaten"
        >
            <X size={18} />
        </button>
    </div>

    <!-- Hoofdinhoud: timer echt gecentreerd op het scherm, checklist en notities als losse panelen ernaast -->
    <div class="relative z-10 flex-1 flex items-center justify-center px-10">
        <div class="relative w-full max-w-350 flex items-center justify-center">
            <!-- Timer -->
            <FocusTimer {session} />

            <!-- Checklist: absoluut links van de timer -->
            <div class="absolute hidden lg:block" style="right: calc(50% + 260px);">
                <FocusChecklist {checklist} onchange={handleChecklistChange} />
            </div>

            <!-- Notities: absoluut rechts van de timer -->
            <div class="absolute hidden lg:block" style="left: calc(50% + 260px);">
                <FocusNotes sessionId={session.id} notes={session.notes} />
            </div>
        </div>
    </div>
</div>