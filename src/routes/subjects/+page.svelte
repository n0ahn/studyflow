<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SubjectForm from '$lib/components/subjects/SubjectForm.svelte';
	import SubjectCard from '$lib/components/subjects/SubjectCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { createSubject, updateSubject, deleteSubject } from '$lib/services/subjects';
	import type { Subject } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let modalOpen = $state(false);
	let editing = $state<Subject | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	function openCreate() {
		editing = null;
		modalOpen = true;
	}

	function openEdit(subject: Subject) {
		editing = subject;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editing = null;
		error = null;
	}

	async function handleSubmit(formData: {
		name: string;
		color: string;
		teacher: string;
		notes: string;
	}) {
		loading = true;
		error = null;

		try {
			if (editing) {
				await updateSubject(supabase, editing.id, formData);
			} else {
				await createSubject(supabase, formData);
			}
			await invalidateAll();
			closeModal();
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function handleDelete(subject: Subject) {
		const confirmed = confirm(
			`"${subject.name}" verwijderen? Alle bijbehorende toetsen en taken worden ook verwijderd.`
		);
		if (!confirmed) return;

		try {
			await deleteSubject(supabase, subject.id);
			await invalidateAll();
		} catch (e: any) {
			error = e.message;
		}
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Vakken</h1>
			<p class="text-sm text-muted-foreground">{data.subjects.length} vakken</p>
		</div>
		<Button onclick={openCreate}>+ Vak toevoegen</Button>
	</div>

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}

	{#if data.subjects.length === 0}
		<EmptyState
			icon="📚"
			title="Nog geen vakken"
			description="Voeg je eerste vak toe om te beginnen met plannen."
			actionLabel="Vak toevoegen"
			onaction={openCreate}
		/>
	{:else}
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.subjects as subject (subject.id)}
				<SubjectCard {subject} onedit={openEdit} ondelete={handleDelete} />
			{/each}
		</div>
	{/if}
</div>

<Modal open={modalOpen} title={editing ? 'Vak bewerken' : 'Vak toevoegen'} onclose={closeModal}>
	<SubjectForm initial={editing ?? {}} onsubmit={handleSubmit} {loading} />
</Modal>
