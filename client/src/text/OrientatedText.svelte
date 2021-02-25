<script lang="ts">
    import type { WritingSettings } from "../conlang";

    export let settings: WritingSettings = {
        horizontal: true,
        ltr: true,
        fontltr: true,
    };

    export let inline = true;
</script>

{#if inline}
    <span
        class:rtl={!settings.ltr}
        class:fontrtl={!settings.fontltr}
        class:vertical={!settings.horizontal}
        class:upright={!settings.horizontal && settings.upright}
        class:forceDir={settings.horizontal &&
            settings.fontltr !== settings.ltr}
    >
        <slot />
    </span>
{:else}
    <div
        class:rtl={!settings.ltr}
        class:fontrtl={!settings.fontltr}
        class:vertical={!settings.horizontal}
        class:upright={!settings.horizontal && settings.upright}
        class:forceDir={settings.horizontal &&
            settings.fontltr !== settings.ltr}
    >
        <slot />
    </div>
{/if}

<style lang="scss">
    div,
    span {
        direction: ltr;

        // Text orientation
        &.forceDir {
            unicode-bidi: bidi-override;
            -moz-unicode-bidi: bidi-override;
            -ms-unicode-bidi: bidi-override;
            -webkit-unicode-bidi: bidi-override;
        }

        &.rtl {
            direction: rtl;
        }

        &.vertical {
            -ms-writing-mode: tb-lr;
            -webkit-writing-mode: vertical-lr;
            -moz-writing-mode: vertical-lr;
            -ms-writing-mode: vertical-lr;
            writing-mode: vertical-lr;

            &.upright {
                unicode-bidi: bidi-override;
                -moz-unicode-bidi: bidi-override;
                -ms-unicode-bidi: bidi-override;
                -webkit-unicode-bidi: bidi-override;

                -webkit-text-orientation: upright;
                -moz-text-orientation: upright;
                -ms-text-orientation: upright;
                text-orientation: upright;
                text-orientation: -webkit-upright;

                -moz-font-feature-settings: "vchw", "vpal";
                -webkit-font-feature-settings: "vchw", "vpal";
                font-feature-settings: "vchw", "vpal";
            }

            direction: ltr;

            &.fontrtl {
                direction: rtl;
            }

            &.rtl {
                -ms-writing-mode: tb-rl;
                -webkit-writing-mode: vertical-rl;
                -moz-writing-mode: vertical-rl;
                -ms-writing-mode: vertical-rl;
                writing-mode: vertical-rl;
            }
        }
    }
</style>
