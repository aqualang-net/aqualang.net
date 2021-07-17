<script lang="ts">
	import HintedText from '$lib/text/HintedText.svelte';
	import OrientatedText from '$lib/text/OrientatedText.svelte';
	import PopupManager from '$lib/text/PopupManager.svelte';
</script>

<main>
	<PopupManager>
		<p>
			<HintedText
				writing={{
					horizontal: true,
					fontltr: true,
					ltr: true,
					upright: true
				}}
				text={[
					{
						text: 'The quick brown fox jumps over the lazy dog.',
						selected: false
					}
				]}
				edit={true}
			/>
		</p>
		<OrientatedText
			inline={false}
			writing={{
				horizontal: false,
				fontltr: true,
				ltr: true,
				upright: true
			}}
		>
			<div contenteditable="true">Hello, World!</div>
		</OrientatedText>
	</PopupManager>
</main>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Asap&display=swap');

	:global(html) {
		background-color: #252525;
	}

	:global(body) {
		color: white;
		font-family: Asap, sans-serif;
		font-size: 1.5em;
	}

	main {
		position: relative;
		width: 100%;
		height: 100%;
	}

	p {
		height: 100%;
	}
</style>
