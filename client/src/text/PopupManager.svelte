<script lang="ts">
    import { setContext } from "svelte";
    import { key } from "./popupmanager";
    import type { PopupSettings } from "./popupmanager";
    import Popup from "./Popup.svelte";

    let popups: PopupSettings[] = [];

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
    });
</script>

<div class="popupable">
    <slot />
    {#each popups as popup}
        <Popup {...popup.settings}>
            <svelte:component
                this={popup.content}
                {...popup.contentprops}
            /></Popup
        >
    {/each}
</div>

<style lang="scss">
    .popupable {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
</style>
