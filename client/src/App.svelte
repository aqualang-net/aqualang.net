<script lang="ts">
	import { initClient } from "@urql/svelte";
	import HintedText from "./text/HintedText.svelte";
	import PopupManager from "./text/PopupManager.svelte";

	initClient({
		url: "http://localhost:3000/graphql",
	});
</script>

<main>
	<PopupManager>
		<p>
			<HintedText
				settings={{
					horizontal: false,
					fontltr: true,
					ltr: true,
					upright: true,
				}}
				text={[
					{
						text: "The quick brown fox jumps over the lazy dog.",
						selected: false,
					},
				]}
			/>
		</p>
	</PopupManager>
</main>

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=Asap&display=swap");

	// START RESET CSS DEFAULTS ON BROWSERS
	:global(html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video) {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 100%;
		font: inherit;
		vertical-align: baseline;
	}
	:global(article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section) {
		display: block;
	}
	:global(body) {
		line-height: 1;
	}
	:global(ol, ul) {
		list-style: none;
	}
	:global(blockquote, q) {
		quotes: none;
	}
	:global(blockquote:before, blockquote:after, q:before, q:after) {
		content: "";
		content: none;
	}
	:global(table) {
		border-collapse: collapse;
		border-spacing: 0;
	}
	// END RESET CSS DEFAULTS ON BROWSERS

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
		// word-wrap: break-word;
		height: 100%;
	}

	p {
		height: 100%;
	}
</style>
