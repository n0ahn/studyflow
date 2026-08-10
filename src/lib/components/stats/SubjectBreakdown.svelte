<script lang="ts">
    import type { SubjectBreakdownEntry } from '$lib/stats/types'

    type Props = {
        entries: SubjectBreakdownEntry[]
    }

    let { entries }: Props = $props()

    function formatMinutes(m: number): string {
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u ${rem}m`
    }
</script>

<div class="col-span-5 card p-7">
    <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Studietijd per vak</p>

    {#if entries.length === 0}
        <p class="text-sm text-muted-foreground py-10 text-center">Nog geen voltooide sessies.</p>
    {:else}
        <div class="flex flex-col">
            {#each entries as entry, i (entry.subjectId)}
                <div class="flex items-center gap-3.5 py-3.5 {i !== entries.length - 1 ? 'border-b border-border' : ''}">
                    <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {entry.subjectColor};"></div>

                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-foreground truncate">{entry.subjectName}</p>
                        <p class="text-[11.5px] text-muted-foreground mt-0.5">
                            {entry.sessionCount} {entry.sessionCount === 1 ? 'sessie' : 'sessies'}
                            {#if entry.averageDifficulty !== null}
                                · gem. moeilijkheid {entry.averageDifficulty}
                            {/if}
                        </p>
                    </div>

                    <div class="w-24 h-1.5 rounded-full bg-white/6 overflow-hidden shrink-0">
                        <div
                            class="h-full rounded-full"
                            style="width: {Math.round(entry.shareOfTotal * 100)}%; background-color: {entry.subjectColor};"
                        ></div>
                    </div>

                    <span class="text-sm font-light text-foreground w-14 text-right shrink-0">{formatMinutes(entry.totalMinutes)}</span>
                </div>
            {/each}
        </div>
    {/if}
</div>