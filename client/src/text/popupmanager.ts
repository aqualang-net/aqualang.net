import type { SvelteComponent } from "svelte";

type PopupSettings = {
    settings: {
        px: number,
        py: number,
        rotation: number,
        reverseSnap?: boolean,
        onescape: () => void
    },
    key: any,
    content: SvelteComponent,
    contentprops: any
}

const key = {};

export { key };
export type { PopupSettings };
