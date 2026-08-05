<script lang="ts">
    import './layout.css'
    import { setAuthContext } from '$lib/stores'
    import type { LayoutData } from './$types'

    let { data, children } = $props<{ data: LayoutData, children: any }>()

    setAuthContext(() => data.session)
</script>

{@render children()}