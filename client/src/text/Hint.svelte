<script lang="ts">
    import type { WritingSettings } from "../conlang";
    import OrientatedText from "./OrientatedText.svelte";
    import HintedText from "./HintedText.svelte";

    type Text = {
        text: string;
        selected: false;
        static?: boolean;
    };

    export let settings: WritingSettings = {
        horizontal: true,
        ltr: true,
        fontltr: true,
    };

    export let hintSettings: WritingSettings = {
        horizontal: true,
        ltr: true,
        fontltr: true,
    };

    export let prefix = "-";
    export let suffix = "-";
    export let separator = " ... ";

    export let key: string;
    export let hints = ["loop", "ben lopend(e)"];

    function getContent(): Text[] {
        const texts: Text[] = [];
        let current = "";
        for (let i = 0; i < key.length; i++) {
            if (i < key.length - 1) {
                const chars = key.substr(i, 2);
                switch (chars) {
                    case "\np":
                        if (current != "") {
                            texts.push({ text: current, selected: false });
                        }
                        current = "";
                        texts.push({
                            text: prefix,
                            selected: false,
                            static: true,
                        });
                        i++;
                        break;
                    case "\ns":
                        if (current != "") {
                            texts.push({ text: current, selected: false });
                        }
                        current = "";
                        texts.push({
                            text: suffix,
                            selected: false,
                            static: true,
                        });
                        i++;
                        break;
                    case "\nd":
                        if (current != "") {
                            texts.push({ text: current, selected: false });
                        }
                        current = "";
                        texts.push({
                            text: separator,
                            selected: false,
                            static: true,
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
        if (current != "") {
            texts.push({ text: current, selected: false });
        }
        return texts;
    }
</script>

<div class="flex" class:vert={!settings.horizontal} class:rtl={!settings.ltr}>
    <div
        class="text"
        class:vert={!settings.horizontal}
        class:rtl={!settings.ltr}
    >
        <p>
            <HintedText
                {settings}
                {hintSettings}
                showHints={true}
                allowFull={false}
                text={getContent()}
            />
        </p>
    </div>
    <div
        class="hints"
        class:vert={!hintSettings.horizontal}
        class:rtl={!hintSettings.ltr}
    >
        {#each hints as hint}
            <div
                class:vert={!hintSettings.horizontal}
                class:rtl={!hintSettings.ltr}
            >
                <p>
                    <OrientatedText settings={hintSettings}>
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
