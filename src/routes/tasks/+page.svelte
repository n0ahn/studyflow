<script lang="ts">
    import { invalidateAll } from '$app/navigation'
    import { supabase } from '$lib/supabase'
    import Modal from '$lib/components/ui/Modal.svelte'
    import EmptyState from '$lib/components/ui/EmptyState.svelte'
    import TaskForm from '$lib/components/tasks/TaskForm.svelte'
    import TaskCard from '$lib/components/tasks/TaskCard.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import { createTask, updateTask, deleteTask } from '$lib/services/tasks'
    import type { TaskWithSubject } from '$lib/types'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    let modalOpen = $state(false)
    let editing = $state<TaskWithSubject | null>(null)
    let loading = $state(false)
    let error = $state<string | null>(null)

    function openCreate() {
        if (data.subjects.length === 0) {
            error = 'Maak eerst een vak aan voordat je een taak toevoegt.'
            return
        }
        editing = null
        modalOpen = true
    }

    function openEdit(task: TaskWithSubject) {
        editing = task
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
                await updateTask(supabase, editing.id, formData)
            } else {
                await createTask(supabase, formData)
            }
            await invalidateAll()
            closeModal()
        } catch (e: any) {
            error = e.message
        } finally {
            loading = false
        }
    }

    async function handleDelete(task: TaskWithSubject) {
        const confirmed = confirm(`"${task.title}" verwijderen?`)
        if (!confirmed) return

        try {
            await deleteTask(supabase, task.id)
            await invalidateAll()
        } catch (e: any) {
            error = e.message
        }
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">Taken</h1>
            <p class="text-muted-foreground text-sm">{data.tasks.length} taken</p>
        </div>
        <Button onclick={openCreate}>+ Taak toevoegen</Button>
    </div>

    {#if error}
        <p class="text-destructive text-sm">{error}</p>
    {/if}

    {#if data.tasks.length === 0}
        <EmptyState
            icon="✅"
            title="Nog geen taken"
            description="Voeg je eerste taak toe om te beginnen."
            actionLabel="Taak toevoegen"
            onaction={openCreate}
        />
    {:else}
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {#each data.tasks as task (task.id)}
                <TaskCard task={task} onedit={openEdit} ondelete={handleDelete} />
            {/each}
        </div>
    {/if}
</div>

<Modal
    open={modalOpen}
    title={editing ? 'Taak bewerken' : 'Taak toevoegen'}
    onclose={closeModal}
>
    <TaskForm
        initial={editing ?? {}}
        subjects={data.subjects}
        onsubmit={handleSubmit}
        {loading}
    />
</Modal>