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
        getPopup(index: number): HTMLElement {
            return container.children[index].children[0].children[1].children[0]
                .children[0] as HTMLElement;
        },
    });
</script>

<div class="popupable">
    <slot />
    <div bind:this={container}>
        {#each popups as popup, index (popup.contentprops)}
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
