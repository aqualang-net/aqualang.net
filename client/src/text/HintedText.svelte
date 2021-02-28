<script lang="ts">
    import { getContext, tick } from "svelte";
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

    const { addPopup, getPos, removePopup, focusPopup, contains } = getContext(
        key
    );

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

    let paragraph: HTMLElement;
    let popup: number = -1;

    let hoverHint = -1;
    let selectedHint = -1;

    let selectingIndex = -1;
    let selectingSubIndex = -1;

    let lastOffset = -1;

    // Component selection
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
        const texts: string[] = [];
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

    function mouseUp(e: Event) {
        // Check if we started from a selectable span
        const selection = getSelection();
        if (!selection?.getParentElement()?.classList.contains("selecting")) {
            deletePopup();
            deselectText();
            return;
        }

        // We're inside!
        e.stopImmediatePropagation();
        deletePopup();

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

    function deselectText() {
        selectingIndex = -1;
        selectingSubIndex = -1;
        for (let t of text) t.selected = false;
        cleanup();
    }

    async function select(
        index: number,
        start: number,
        end: number,
        select: boolean
    ) {
        const s = start;
        const lengthBefore = text
            .slice(0, index)
            .map((t) => t.text)
            .join("").length;

        // Alter selection to include/exclude spaces
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

        await tick();

        focus(lengthBefore + s);
        recalculatePopup();
    }

    function mouseDown(e: MouseEvent) {
        selectingSubIndex = getIndex(e.target as Element);
        selectingIndex = getIndex((e.target as Element).parentElement);
        if (e.detail > 1) {
            e.preventDefault();
        }
    }

    function keydown(e: KeyboardEvent) {
        if (e.code === "Space" || e.code === "Enter") {
            const element = document.activeElement;
            if (element.parentElement.parentElement === paragraph) {
                e.preventDefault();
            }
        }
    }

    function focus(offset: number) {
        lastOffset = offset;

        // Calculate word to focus right now
        let seen = 0;
        for (let i = 0; i < text.length; i++) {
            const s = split(text[i].text);
            for (let j = 0; j < s.length; j++) {
                seen += s[j].length;
                if (seen > offset) {
                    (paragraph.children[i].children[j] as HTMLElement).focus();
                    return;
                }
            }
        }
    }

    async function keyup(e: KeyboardEvent) {
        if (e.code === "Space") {
            // Select text without hint
            const element = document.activeElement;
            if (element.parentElement.parentElement !== paragraph) {
                return;
            }

            const subIndex = getIndex(element);
            const index = getIndex(element.parentElement);

            // Ignore text with hint
            if (text[index].hint !== undefined) {
                return;
            }

            // Ignore whitespace
            const s = split(text[index].text);

            if (
                !(
                    s[subIndex].trim() !== "" ||
                    text[index].selected ||
                    s.length === 1
                )
            ) {
                return;
            }

            // Select text
            const [offset, size] = getOffset(index, subIndex);
            select(index, offset, offset + size, !text[index].selected);
        } else if (e.code === "Enter") {
            // Select or create hint
            const element = document.activeElement;
            if (element.parentElement.parentElement !== paragraph) {
                return;
            }

            const index = getIndex(element.parentElement);
            if (text[index].hint !== undefined) {
                selectHint(index);
                await tick();
            }

            if (popup !== -1) {
                focusPopup(popup);
            }
        }
    }

    function windowUp(e: MouseEvent) {
        if (
            paragraph.contains(e.target as Element) ||
            contains(popup, e.target as Element)
        ) {
            return;
        }

        deletePopup();
        deselectText();
    }

    // Hints
    function selectHint(index: number) {
        if (selectedHint === index) {
            selectedHint = -1;
            removePopup(popup);
            popup = -1;
        } else {
            getSelection().deselect();
            deselectText();
            selectedHint = index;
            recalculatePopup();
        }
    }

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
        selectHint(hoverHint);
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

        const t = getText();

        popup = addPopup({
            settings: {
                px: x,
                py: y,
                rotation: settings.horizontal ? 0 : settings.ltr ? 3 : 1,
                reverseSnap: settings.horizontal && !settings.ltr,
                onescape: async () => {
                    if (popup === -1) return;

                    popup = -1;
                    selectedHint = -1;
                    deselectText();
                    getSelection().deselect();

                    await tick();

                    focus(lastOffset);
                },
            },
            key: t,
            content: Hint,
            contentprops: {
                settings: settings,
                hintSettings: hintSettings,
                key: t,
                edit: edit,
            },
        });
    }

    function deletePopup() {
        selectedHint = -1;
        removePopup(popup);
        popup = -1;
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
        on:keydown={keydown}
        on:keyup={keyup}
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
                {#each text.hint !== undefined || text.static || !edit ? [text.text] : split(text.text) as subtext, subindex}
                    <span
                        role={text.hint !== undefined
                            ? "link"
                            : edit && !text.static
                            ? "checkbox"
                            : undefined}
                        aria-checked={!edit ||
                        text.hint !== undefined ||
                        text.static
                            ? undefined
                            : text.selected
                            ? true
                            : false}
                        aria-disabled={!edit ||
                        text.hint !== undefined ||
                        text.static ||
                        subtext.trim() !== "" ||
                        text.selected ||
                        split(text.text).length === 1
                            ? undefined
                            : true}
                        tabindex={(edit || text.hint !== undefined) &&
                        !text.static
                            ? 0
                            : undefined}
                        on:mouseenter={mouseEnter}
                        on:mouseleave={mouseLeave}
                        class:selecting={text.hint === undefined &&
                            !text.static &&
                            selectingIndex === index &&
                            selectingSubIndex === subindex}
                        class:word={subtext.trim() !== ""}
                        class:span={edit &&
                            subtext.length === 1 &&
                            punctuation.includes(subtext) &&
                            expandSmallSpans}
                        >{#if settings.upright && !settings.horizontal && subtext.trim() === ""}{" "}<wbr
                            />{:else}{subtext}{/if}</span
                    >{/each}</span
            >{/each}
    </span>
</OrientatedText>

<svelte:window on:resize={recalculatePopup} on:mouseup={windowUp} />

<style type="text/scss">
    .pad:not(.vert) .span {
        padding-left: 0.15em;
        padding-right: 0.15em;
    }

    .vert.pad .span {
        padding-top: 0.15em;
        padding-bottom: 0.15em;
    }

    .vert:not(.pad) > span > :not(.word) {
        // Do this to make Safari happy
        padding-top: 1em;
        letter-spacing: -1em;
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
