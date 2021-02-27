<script lang="ts">
    import { setContext, getContext } from "svelte";
    import { afterUpdate } from "svelte";
    import { key } from "./popupmanager";
    import type { PopupSettings } from "./popupmanager";

    const { addPopup, removePopup, getPopup } = getContext(key);

    setContext(key, {
        addPopup(settings: PopupSettings) {
            settings.settings.px = px;
            settings.settings.py = py;
            settings.settings.rotation = rotation;
            settings.settings.reverseSnap = reverseSnap;
            const c: any = content;
            switch (rotation) {
                case 0:
                    settings.settings.py +=
                        c.scrollHeight + c.parentElement.offsetTop - 2;
                    break;
                case 1:
                    settings.settings.px -=
                        c.scrollWidth - c.parentElement.offsetLeft + 2;
                    break;
                case 2:
                    settings.settings.py -=
                        c.scrollHeight - c.parentElement.offsetTop + 2;
                    break;
                case 3:
                    settings.settings.px +=
                        c.scrollWidth + c.parentElement.offsetLeft - 2;
                    break;
            }
            return addPopup(settings);
        },
        getPos() {
            return [0, 0];
        },
        removePopup: removePopup,
        getPopup: getPopup,
    });

    export let px: number = 0;
    export let py: number = 0;
    export let rotation: number = 0; // clockwise, 90 degree intervals
    export let reverseSnap = false;
    export let index: number;
    export let onescape = () => {};

    let box: Element;
    let content: Element;

    afterUpdate(() => {
        box.setAttribute("style", `left:${px}px;top:${py}px;`);

        if (rotation === 0 || rotation === 2) {
            let absx = px - content.scrollWidth / 2;
            if (reverseSnap) {
                absx += content.scrollWidth;
                if (absx > box.parentElement.clientWidth) {
                    content.setAttribute(
                        "style",
                        `left:${box.parentElement.clientWidth - absx}px`
                    );
                    return;
                }
            }
            if (absx < 0) {
                content.setAttribute("style", `left:${-absx}px`);
                return;
            }
            if (!reverseSnap) {
                absx += content.scrollWidth;
                if (absx > box.parentElement.clientWidth) {
                    content.setAttribute(
                        "style",
                        `left:${box.parentElement.clientWidth - absx}px`
                    );
                    return;
                }
            }
        } else {
            let absy = py - content.scrollHeight / 2;
            if (reverseSnap) {
                absy += content.scrollHeight;
                if (absy > box.parentElement.clientHeight) {
                    content.setAttribute(
                        "style",
                        `top:${box.parentElement.clientHeight - absy}px`
                    );
                    return;
                }
            }
            if (absy < 0) {
                content.setAttribute("style", `top:${-absy}px`);
                return;
            }
            if (!reverseSnap) {
                absy += content.scrollHeight;
                if (absy > box.parentElement.clientHeight) {
                    content.setAttribute(
                        "style",
                        `top:${box.parentElement.clientHeight - absy}px`
                    );
                    return;
                }
            }
        }
    });

    function keyup(e: KeyboardEvent) {
        if (e.code === "Escape") {
            removePopup(index);
            onescape();
        }
    }
</script>

<div
    class="popover-box"
    class:deg0={rotation === 0}
    class:deg90={rotation === 1}
    class:deg180={rotation === 2}
    class:deg270={rotation === 3}
    bind:this={box}
    on:keyup={keyup}
    on:mouseup={(e) => e.stopImmediatePropagation()}
>
    <div class="block">
        <div class="popover-arrow" />
        <div class="popover-content" bind:this={content}>
            <div class="hint-border">
                <slot />
            </div>
        </div>
    </div>
</div>

<style type="text/scss">
    .popover-box {
        font-size: 0.75em;

        position: absolute;
        color: white;

        pointer-events: none;

        cursor: initial;
        user-select: text;
        -moz-user-select: text;
        -webkit-user-select: text;
        -ms-user-select: text;

        clear: both;
    }

    .popover-content {
        position: relative;
    }

    .deg0 .block {
        transform: translateX(-50%);
    }

    .deg270 .block {
        transform: translateY(-50%);
    }

    .deg180 .block {
        transform: translate(-50%, -100%);
    }

    .deg90 .block {
        transform: translate(-100%, -50%);
    }

    .hint-border {
        border-radius: 10px;
        overflow: hidden;

        width: max-content;
        height: max-content;
        border: 2px solid #666;
        background-color: #444;
    }

    .block {
        position: absolute;
    }

    .deg0 .block {
        top: 0.707106781187em;
    }

    .deg90 .block {
        left: -0.707106781187em;
    }

    .deg180 .block {
        top: -0.707106781187em;
    }

    .deg270 .block {
        left: 0.707106781187em;
    }

    .popover-arrow {
        position: absolute;
        width: 1em;
        height: 1em;
        transform: rotate(45deg);
        background-color: #666;
        left: -0.5em;
        top: -0.5em;
    }

    .deg0 .popover-arrow {
        left: calc(50% - 0.5em);
    }

    .deg90 .popover-arrow {
        left: calc(100% - 0.5em);
        top: calc(50% - 0.5em);
    }

    .deg180 .popover-arrow {
        left: calc(50% - 0.5em);
        top: calc(100% - 0.5em);
    }

    .deg270 .popover-arrow {
        top: calc(50% - 0.5em);
    }

    .block > div {
        pointer-events: all;
    }
</style>
