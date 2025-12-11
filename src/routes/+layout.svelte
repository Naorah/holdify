<!--
	Layout principal de l'application Holdify
	Inclut les styles Tailwind CSS et le favicon
-->

<script lang="ts">
	import favicon from '$lib/assets/favicon_white.png';
	import '../styles/tailwind.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children()}
