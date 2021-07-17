<script lang="ts">
	import type { HintSettings, WritingSettings } from '../conlang';
	import OrientatedText from './OrientatedText.svelte';
	import HintedText from './HintedText.svelte';
	// import UUID from "../util/uuid.js";

	type Text = {
		text: string;
		selected: false;
		static?: boolean;
	};

	export let writing: WritingSettings = {
		horizontal: true,
		ltr: true,
		fontltr: true
	};

	export let hintWriting: WritingSettings = {
		horizontal: true,
		ltr: true,
		fontltr: true
	};

	export let hintSettings: HintSettings = {
		punctuation: '.,?!',
		prefix: '-',
		suffix: '-',
		separator: ' ... ',
		detectAffix: true
	};

	export let key: string;
	export let hints = ['loop', 'ben lopend(e)'];
	export let edit = true;

	const hintedid = '1'; // UUID.generate();
	const hintsid = '2'; //UUID.generate();

	function getContent(): Text[] {
		const texts: Text[] = [];
		let current = '';
		for (let i = 0; i < key.length; i++) {
			if (i < key.length - 1) {
				const chars = key.substr(i, 2);
				switch (chars) {
					case '\np':
						if (current != '') {
							texts.push({ text: current, selected: false });
						}
						current = '';
						texts.push({
							text: hintSettings.prefix,
							selected: false,
							static: true
						});
						i++;
						break;
					case '\ns':
						if (current != '') {
							texts.push({ text: current, selected: false });
						}
						current = '';
						texts.push({
							text: hintSettings.suffix,
							selected: false,
							static: true
						});
						i++;
						break;
					case '\nd':
						if (current != '') {
							texts.push({ text: current, selected: false });
						}
						current = '';
						texts.push({
							text: hintSettings.separator,
							selected: false,
							static: true
						});
						i++;
						break;
					default:
						current += key.substr(i, 1);
						break;
				}
			} else {
				current += key.substr(i, 1);
			}
		}
		if (current != '') {
			texts.push({ text: current, selected: false });
		}
		return texts;
	}
</script>

<div
	role="dialog"
	aria-labelledby={hintedid}
	aria-describedby={hintsid}
	class="flex"
	class:vert={!writing.horizontal}
	class:rtl={!writing.ltr}
>
	<div id={hintedid} class="text" class:vert={!writing.horizontal} class:rtl={!writing.ltr}>
		<p>
			<HintedText {writing} {hintWriting} showHints={true} text={getContent()} {edit} />
		</p>
	</div>
	<div id={hintsid} class="hints" class:vert={!hintWriting.horizontal} class:rtl={!hintWriting.ltr}>
		{#each hints as hint}
			<div class:vert={!hintWriting.horizontal} class:rtl={!hintWriting.ltr}>
				<p>
					<OrientatedText writing={hintWriting}>
						{hint}
					</OrientatedText>
				</p>
			</div>
		{/each}
	</div>
</div>

<!-- Add buttons here -->
<style lang="scss">
	p {
		margin: 0;
		white-space: nowrap;
	}

	.flex {
		display: flex;
		flex-direction: column;

		&.vert {
			flex-direction: row;

			&.rtl {
				flex-direction: row-reverse;
			}
		}

		> div {
			text-align: center;
			display: flex;
			align-items: center;
			flex-direction: column;
		}

		> .text {
			justify-content: center;
		}
	}

	.hints.vert {
		flex-direction: row;
		&.rtl {
			flex-direction: row-reverse;
		}
	}

	.text,
	.hints > div {
		padding: 0.5em;
	}

	.hints > div {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hints > :not(.vert) {
		width: 100%;
		min-height: 1em;

		> p {
			min-height: 1em;
		}
	}

	.hints > .vert {
		height: 100%;
		min-width: 1em; // Do this so firefox is happy
		width: 100%;

		> p {
			min-width: 1em;
		}
	}

	.text {
		background-color: #666;

		&.vert {
			min-width: 1em; // Do this so firefox is happy

			> p {
				min-width: 1em;
			}
		}
	}

	.flex .vert:not(:last-child) {
		&.rtl {
			border-left: 2px solid #666;
		}

		&:not(.rtl) {
			border-right: 2px solid #666;
		}
	}

	.flex div:not(.vert):not(:last-child) {
		border-bottom: 2px solid #666;
	}
</style>
