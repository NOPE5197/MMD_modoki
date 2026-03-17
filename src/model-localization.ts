import type { KeyframeTrack, ModelInfo, UiLocale } from "./types";

const trimNonEmpty = (value: string | null | undefined): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

export const resolveModelName = (info: ModelInfo, locale: UiLocale): string => {
    if (locale === "en") {
        const englishName = trimNonEmpty(info.nameEn);
        if (englishName) return englishName;
    }
    return info.name;
};

export const resolveBoneName = (info: ModelInfo, boneName: string, locale: UiLocale): string => {
    if (locale === "en") {
        const englishName = trimNonEmpty(info.boneNameEnMap?.[boneName]);
        if (englishName) return englishName;
    }
    return boneName;
};

export const resolveMorphName = (info: ModelInfo, morphName: string, locale: UiLocale): string => {
    if (locale === "en") {
        const englishName = trimNonEmpty(info.morphNameEnMap?.[morphName]);
        if (englishName) return englishName;
    }
    return morphName;
};

export const resolveMorphFrameName = (info: ModelInfo, frameName: string, locale: UiLocale): string => {
    if (locale === "en") {
        const englishName = trimNonEmpty(info.morphDisplayFrameNameEnMap?.[frameName]);
        if (englishName) return englishName;
    }
    return frameName;
};

export const resolveTrackLabel = (
    track: KeyframeTrack,
    info: ModelInfo | null,
    locale: UiLocale,
): string => {
    if (!info) return track.name;
    if (track.category === "morph") return resolveMorphName(info, track.name, locale);
    if (track.category === "camera") return track.name;
    return resolveBoneName(info, track.name, locale);
};
