export type WritingSettings = {
    horizontal: boolean,

    // Both
    fontltr: boolean,
    ltr: boolean,

    // Vertical
    upright?: boolean,
}

export type HintSettings = {
    punctuation: string,
    prefix: string,
    suffix: string,
    separator: string,
    detectAffix: boolean,
}
