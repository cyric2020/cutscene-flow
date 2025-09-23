<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.js';
	import { startPaletteInjection, stopPaletteInjection } from '$lib/applyPalette';
  	import { on } from 'svelte/events';

	let current;
	const unsub = theme.subscribe((t) => (current = t));

	function toggle() {
		theme.update((t) => (t === 'light' ? 'dark' : 'light'));
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			startPaletteInjection();
			return () => {
				unsub();
				stopPaletteInjection();
			};
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
