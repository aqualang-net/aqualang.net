<script lang="ts">
    import { afterUpdate, getContext } from "svelte";
    import type { WritingSettings } from "../conlang";
    import { key } from "./popupmanager";
    import Hint from "./Hint.svelte";
    import OrientatedText from "./OrientatedText.svelte";

    type Text = {
        text: string;
        selected: boolean;
        hint?: number;
        static?: boolean;
    };

    const { addPopup, getPos, removePopup } = getContext(key);

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

    export let punctuation = " .,?!";
    export let prefix = "-";
    export let suffix = "-";
    export let separator = " ... ";
    export let detectAffix = false;
    export let toLowercase = true;
    export let locale = "en-US";

    export let edit = true;
    export let showHints = false;
    export let allowFull = true;
    export let expandSmallSpans = true;

    export let text: Text[];

    let paragraph: Element;
    let popup: number = -1;
    let hoverHint = -1;
    let selectedHint = -1;

    let selectingIndex = -1;
    let selectingSubIndex = -1;

    let popupDirty = false;

    afterUpdate(() => {
        if (popupDirty) {
            recalculatePopup();
            popupDirty = false;
        }
    });

    function getIndex(e: Element): number {
        if (e.previousElementSibling !== null)
            return getIndex(e.previousElementSibling) + 1;
        return 0;
    }

    function getType(char: string) {
        if (char.trim() === "") return 0;
        else if (punctuation.includes(char)) return 1;
        return 2;
    }

    function split(text: string) {
        let type = -1;
        const texts = [];
        for (let s of text.split("")) {
            const t = getType(s);
            if (t !== type) {
                type = t;
                texts.push(s);
            } else {
                texts[texts.length - 1] += s;
            }
        }
        return texts;
    }

    function getOffset(index: number, subindex: number) {
        const things = split(text[index].text);
        const first = things.splice(0, subindex);
        return [first.join("").length, things[0].length];
    }

    function deselectHint() {
        selectedHint = -1;
        removePopup(popup);
        popup = -1;
    }

    function mouseUp(e: Event) {
        if (edit && (selectingIndex === -1 || selectingSubIndex === -1)) {
            deselectHint();
            deselectAll();
            return;
        }

        // Check if we started from a selectable span
        const selection = getSelection();
        if (!selection?.getParentElement()?.classList.contains("selecting")) {
            e.stopImmediatePropagation();

            if (hoverHint === -1) {
                deselectHint();
            }

            deselectAll();
            return;
        }

        // We're inside!
        e.stopImmediatePropagation();
        deselectHint();

        if (!edit) {
            return;
        }

        // Get index and positions within span
        const subIndex = getIndex(selection.getParentElement());
        const index = getIndex(selection.getParentElement().parentElement);
        const [offset, size] = getOffset(index, subIndex);

        let start = selection.anchorOffset + offset;
        let end = selection.focusOffset + offset;

        if (!selection?.getParentElement()?.classList.contains("word")) {
            start = end;
        } else if (start > end) {
            const tmp = end;
            end = start;
            start = tmp;
        }

        if (start === end) {
            // Encapsulate substring
            start = offset;
            end = offset + size;
        }

        if (text[index].selected) {
            // Enlarge to adjacent spaces
            while (start > 0 && text[index].text.substr(start - 1, 1) === " ")
                start--;
            while (
                end < text[index].text.length &&
                text[index].text.substr(end, 1) === " "
            )
                end++;
        } else {
            // Enlarge to adjacent space if that space is at the start or end
            if (start > 0 && text[index].text.substr(0, start).trim() === "")
                start = 0;
            if (
                end < text[index].text.length &&
                text[index].text.substr(end).trim() == ""
            )
                end = text[index].text.length;
        }

        select(index, start, end, !text[index].selected);
        selection.deselect();
        return;
    }

    function getSelection() {
        const d: any = document;

        var selection =
            "getSelection" in window
                ? window.getSelection()
                : "selection" in d
                ? d.selection
                : null;

        return {
            deselect: function () {
                if ("removeAllRanges" in selection) selection.removeAllRanges();
                else if ("empty" in selection) selection.empty();
            },
            getParentElement: function (): Element | null {
                if ("anchorNode" in selection && selection.anchorNode !== null)
                    return selection.anchorNode.parentElement;
                else if ("createRange" in selection)
                    return selection.createRange().parentElement();
                else return null;
            },
            anchorOffset: selection.anchorOffset as number,
            focusOffset: selection.focusOffset as number,
        };
    }

    function cleanup() {
        for (let i = 0; i < text.length; i++) {
            if (text[i].text.length === 0) {
                text.splice(i, 1);
                i--;
            } else if (
                i > 0 &&
                text[i].selected === text[i - 1].selected &&
                text[i].hint === undefined &&
                text[i - 1].hint === undefined &&
                !text[i].static &&
                !text[i - 1].static
            ) {
                const t = text.splice(i, 1)[0].text;
                text[i - 1].text += t;
                i--;
            }
        }

        // Publish
        text = text;
    }

    function deselectAll() {
        selectingIndex = -1;
        selectingSubIndex = -1;
        for (let t of text) t.selected = false;
        cleanup();
    }

    function select(
        index: number,
        start: number,
        end: number,
        select: boolean
    ) {
        // Insert
        const t = text[index];
        text.splice(
            index,
            1,
            {
                text: t.text.substring(0, start),
                selected: t.selected,
            },
            {
                text: t.text.substring(start, end),
                selected: select,
            },
            {
                text: t.text.substring(end),
                selected: t.selected,
            }
        );

        // Cleanup
        cleanup();
        popupDirty = true;
    }

    function mouseDown(e: MouseEvent) {
        selectingSubIndex = getIndex(e.target as Element);
        selectingIndex = getIndex((e.target as Element).parentElement);
        if (e.detail > 1) {
            e.preventDefault();
        }
    }

    // Hints
    function mouseEnter(e: MouseEvent) {
        const index = getIndex((e.target as Element).parentElement);
        if (text[index].hint === undefined) return;
        hoverHint = text[index].hint;
    }

    function mouseLeave() {
        hoverHint = -1;
    }

    function mouseClick() {
        if (selectingIndex !== -1 && text[selectingIndex].hint !== hoverHint) {
            selectingIndex = -1;
            selectingSubIndex = -1;
            return;
        }

        selectingIndex = -1;
        selectingSubIndex = -1;

        if (hoverHint === -1) return;
        if (selectedHint === hoverHint) {
            selectedHint = -1;
            removePopup(popup);
        } else {
            getSelection().deselect();
            deselectAll();
            selectedHint = hoverHint;
            recalculatePopup();
        }
    }

    function recalculatePopup() {
        removePopup(popup);
        popup = -1;

        let index = -1;
        for (let i = text.length - 1; i >= 0; i--) {
            if (text[i].hint === selectedHint || text[i].selected) {
                index = i;
                break;
            }
        }

        if (index === -1) return;

        const nth: any =
            paragraph.children[index].children[
                paragraph.children[index].children.length - 1
            ];

        let [x, y] = getPos(nth);

        if (settings.horizontal) {
            x += nth.offsetWidth / 2;
            y += nth.offsetHeight;
        } else {
            y += nth.offsetHeight / 2;
            if (settings.ltr) x += nth.offsetWidth;
        }

        popup = addPopup({
            settings: {
                px: x,
                py: y,
                rotation: settings.horizontal ? 0 : settings.ltr ? 3 : 1,
                reverseSnap: settings.horizontal && !settings.ltr,
            },
            content: Hint,
            contentprops: {
                settings: settings,
                hintSettings: hintSettings,
                key: getText(),
            },
        });
    }

    function getText() {
        let answer = "";

        for (const t of text) {
            if (t.hint === selectedHint || t.selected) {
                if (answer.length > 0) answer += "\nd";
                answer += t.text;
            }
        }

        return answer;
    }
</script>

<OrientatedText {settings}>
    <span
        class="hinted"
        class:edit
        class:showHints
        class:vert={!settings.horizontal}
        class:pad={!settings.upright || settings.horizontal}
        on:mousedown={edit ? mouseDown : undefined}
        on:click={mouseClick}
        on:mouseup={edit ? mouseUp : undefined}
        bind:this={paragraph}
    >
        {#each text as text, index}
            <span
                class:selected={text.selected}
                class:hint={text.hint !== undefined}
                class:hover={text.hint === hoverHint}
                class:active={text.hint === selectedHint}
                class:static={text.static}
            >
                {#each text.hint !== undefined || text.static ? [text.text] : split(text.text) as subtext, subindex}
                    <span
                        on:mouseenter={mouseEnter}
                        on:mouseleave={mouseLeave}
                        class:selecting={text.hint === undefined &&
                            !text.static &&
                            selectingIndex === index &&
                            selectingSubIndex === subindex}
                        class:word={subtext.trim() !== ""}
                        class:span={subtext.length === 1 &&
                            punctuation.includes(subtext) &&
                            expandSmallSpans}
                        >{#if subtext.trim() === ""}&#8203;{:else}{subtext}{/if}</span
                    >{/each}</span
            >{/each}
    </span>
</OrientatedText>

<svelte:window on:resize={recalculatePopup} on:mouseup={mouseUp} />

<style type="text/scss">
    .pad:not(.vert) .span {
        padding-left: 0.15em;
        padding-right: 0.15em;
    }

    .vert.pad .span {
        padding-top: 0.15em;
        padding-bottom: 0.15em;
    }

    .vert > span > :not(.word) {
        // Doing this instead of an actual space character so Safari is happy
        // We should probably do a "space size" setting for conlang fonts
        padding-top: 1em;

        &::after {
            // Break point
            content: "";
            display: inline-block;
        }
    }

    .hinted {
        // Regular css
        color: white;
        margin: 0;

        // Selection
        &.edit {
            user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;

            &:not(:active) > :not(.hint):not(.static) {
                &.selected > :hover {
                    cursor: pointer;
                    background-color: #00659b;
                }
                &:not(.selected) {
                    > .word:hover,
                    > :only-child:hover {
                        background-color: #133a50;
                        cursor: pointer;
                    }
                }
            }

            &:hover > :not(.hint):not(.static) {
                .word.selecting,
                :only-child.selecting,
                &.selected > .selecting {
                    user-select: text;
                    -moz-user-select: text;
                    -webkit-user-select: text;
                    -ms-user-select: text;
                }

                &.selected > :active {
                    background-color: #00659b;
                }

                &:not(.selected) {
                    > .word:active,
                    > :only-child:active {
                        background-color: #133a50;
                    }
                }
            }

            > :not(.hint):not(.static) {
                border-radius: 0.2em;

                > span {
                    border-radius: 0.2em;
                }

                &.selected {
                    color: white;
                    background-color: #007ac0;
                }

                &:not(.selected) > ::selection {
                    color: white;
                    background-color: #007ac0;
                }

                &.selected > ::selection {
                    color: white;
                    background-color: #133a50;
                }
            }
        }

        // Hint
        &.showHints > .hint,
        &.edit > .hint {
            border-bottom: 2px solid;
        }

        &.showHints.vert > .hint,
        &.edit.vert > .hint {
            border-radius: 0.2em;
            border: 1px solid;
        }

        > .hint {
            &.hover {
                cursor: pointer;
                color: lightgray;
            }

            &.active {
                color: yellow;

                &.hover {
                    color: gold;
                }
            }
        }
    }
</style>
