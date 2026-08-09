<script lang="ts">
    import { supabase } from '$lib/supabase'
    import { updateSession } from '$lib/services/sessions'

    type Props = {
        sessionId: string
        notes: string | null
    }

    let { sessionId, notes: initialNotes }: Props = $props()

    let notes = $state('')
    let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle')
    let saveTimeout: ReturnType<typeof setTimeout> | null = null

    $effect(() => {
        const nextNotes = initialNotes ?? ''
        if (notes !== nextNotes) {
            notes = nextNotes
        }
    })

    function handleInput() {
        saveStatus = 'saving'
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(async () => {
            try {
                await updateSession(supabase, sessionId, { notes: notes.trim() || null })
                saveStatus = 'saved'
            } catch (e) {
                console.error(e)
                saveStatus = 'idle'
            }
        }, 600)
    }
</script>

<div class="flex flex-col w-95 gap-4.5">
    <div class="flex items-center justify-center pl-1">
        <p class="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground m-0">Notities</p>
        <p class="text-[11px] text-muted-foreground/50 m-0">
            {#if saveStatus === 'saving'}Opslaan...{/if}
            {#if saveStatus === 'saved'}Opgeslagen{/if}
        </p>
    </div>

    <textarea
        bind:value={notes}
        oninput={handleInput}
        placeholder="Aantekeningen tijdens deze sessie..."
        class="w-full h-140 resize-none bg-transparent border-none outline-none text-sm text-foreground
            placeholder:text-muted-foreground/40 rounded-3xl p-5 overflow-y-auto"
        style="background: oklch(1 0 0 / 2.5%); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid oklch(1 0 0 / 6%);"
    ></textarea>
</div>