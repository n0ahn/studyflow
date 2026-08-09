<script lang="ts">
    import { invalidateAll } from '$app/navigation'
    import { supabase } from '$lib/supabase'
    import Modal from '$lib/components/ui/Modal.svelte'
    import EmptyState from '$lib/components/ui/EmptyState.svelte'
    import ExamForm from '$lib/components/exams/ExamForm.svelte'
    import ExamCard from '$lib/components/exams/ExamCard.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import { createExam, updateExam, deleteExam } from '$lib/services/exams'
    import type { ExamWithSubject } from '$lib/types'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    let modalOpen = $state(false)
    let editing = $state<ExamWithSubject | null>(null)
    let loading = $state(false)
    let error = $state<string | null>(null)

    function openCreate() {
        if (data.subjects.length === 0) {
            error = 'Maak eerst een vak aan voordat je een toets toevoegt.'
            return
        }
        editing = null
        modalOpen = true
    }

    function openEdit(exam: ExamWithSubject) {
        editing = exam
        modalOpen = true
    }

    function closeModal() {
        modalOpen = false
        editing = null
        error = null
    }

    async function handleSubmit(formData: any) {
        loading = true
        error = null

        try {
            if (editing) {
                await updateExam(supabase, editing.id, formData)
            } else {
                await createExam(supabase, formData)
            }
            await invalidateAll()
            closeModal()
        } catch (e: any) {
            error = e.message
        } finally {
            loading = false
        }
    }

    async function handleDelete(exam: ExamWithSubject) {
        const confirmed = confirm(`"${exam.name}" verwijderen?`)
        if (!confirmed) return

        try {
            await deleteExam(supabase, exam.id)
            await invalidateAll()
        } catch (e: any) {
            error = e.message
        }
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">Toetsen</h1>
            <p class="text-muted-foreground text-sm">{data.exams.length} toetsen</p>
        </div>
        <Button onclick={openCreate}>+ Toets toevoegen</Button>
    </div>

    {#if error}
        <p class="text-destructive text-sm">{error}</p>
    {/if}

    {#if data.exams.length === 0}
        <EmptyState
            icon="📝"
            title="Nog geen toetsen"
            description="Voeg je eerste toets toe om een studieschema te laten maken."
            actionLabel="Toets toevoegen"
            onaction={openCreate}
        />
    {:else}
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {#each data.exams as exam (exam.id)}
                <ExamCard exam={exam} onedit={openEdit} ondelete={handleDelete} />
            {/each}
        </div>
    {/if}
</div>

<Modal
    open={modalOpen}
    title={editing ? 'Toets bewerken' : 'Toets toevoegen'}
    onclose={closeModal}
>
    <ExamForm
        initial={editing ?? {}}
        subjects={data.subjects}
        onsubmit={handleSubmit}
        {loading}
    />
</Modal>