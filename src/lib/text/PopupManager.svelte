<script lang="ts">
    import { setContext } from "svelte";
    import { key } from "./popupmanager";
    import type { PopupSettings } from "./popupmanager";
    import Popup from "./Popup.svelte";

    let popups: PopupSettings[] = [];

    let container: HTMLElement;

    setContext(key, {
        addPopup(settings: PopupSettings) {
            popups.push(settings);
            popups = popups;
            return popups.length - 1;
        },
        removePopup(index: number) {
            if (index === -1) return;
            popups.splice(index);
            popups = popups;
        },
        getPos(e: any): [number, number] {
            let x = 0,
                y = 0;
            while (!e.classList.contains("popupable")) {
                x += e.offsetLeft;
                y += e.offsetTop;
                e = e.offsetParent;
            }
            return [x, y];
        },
        focusPopup(index: number) {
            if (index === -1) return null;

            const popup = container.children[index];
            const focusable = popup.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            focusable?.focus();
        },
        contains(index: number, element: Node) {
            if (index === -1) return false;
            for (let i = index; i < popups.length; i++)
                if (container.children[i].contains(element)) return true;
            return false;
        },
    });
</script>

<div class="popupable">
    <slot />
    <div bind:this={container}>
        {#each popups as popup, index (popup.key)}
            <Popup {...popup.settings} {index}>
                <svelte:component
                    this={popup.content}
                    {...popup.contentprops}
                /></Popup
            >
        {/each}
    </div>
</div>

<style lang="scss">
    .popupable {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
</style>
