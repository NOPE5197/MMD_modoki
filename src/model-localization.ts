import { getLocale } from "./i18n";
import type { KeyframeTrack, ModelInfo, UiLocale } from "./types";

export type ModelLocaleSetting = "global" | UiLocale;

const STORAGE_KEY_BONE = "mmd.model.locale.bone";
const STORAGE_KEY_MORPH = "mmd.model.locale.morph";
const DEFAULT_LOCALE: UiLocale = "ja";

let localizationInitialized = false;
let currentGlobalLocale: UiLocale = DEFAULT_LOCALE;
let currentBoneSetting: ModelLocaleSetting = "global";
let currentMorphSetting: ModelLocaleSetting = "global";

const trimNonEmpty = (value: string | null | undefined): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const reverseLookup = (map: Record<string, string> | undefined, value: string): string | null => {
    if (!map) return null;
    for (const [key, mapped] of Object.entries(map)) {
        if (mapped === value) return key;
    }
    return null;
};

const isLocale = (value: string | null | undefined): value is UiLocale => value === "ja" || value === "en";

const isLocaleSetting = (value: string | null | undefined): value is ModelLocaleSetting => {
    if (value === "global") return true;
    return isLocale(value);
};

const ensureLocalizationInitialized = (): void => {
    if (localizationInitialized) return;
    const storedBone = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_BONE) : null;
    const storedMorph = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_MORPH) : null;

    currentGlobalLocale = getLocale();
    currentBoneSetting = isLocaleSetting(storedBone) ? storedBone : "global";
    currentMorphSetting = isLocaleSetting(storedMorph) ? storedMorph : "global";
    localizationInitialized = true;
};

const emitModelLocaleChanged = (scope: "global" | "bone" | "morph"): void => {
    if (typeof document === "undefined") return;
    document.dispatchEvent(
        new CustomEvent("app:model-locale-changed", {
            detail: { scope },
        }),
    );
};

export const initializeModelLocalization = (): void => {
    ensureLocalizationInitialized();
};

export const getModelLocale = (): UiLocale => {
    ensureLocalizationInitialized();
    return currentGlobalLocale;
};

export const getBoneLocaleSetting = (): ModelLocaleSetting => {
    ensureLocalizationInitialized();
    return currentBoneSetting;
};

export const getMorphLocaleSetting = (): ModelLocaleSetting => {
    ensureLocalizationInitialized();
    return currentMorphSetting;
};

export const getBoneLocale = (): UiLocale => {
    ensureLocalizationInitialized();
    return currentBoneSetting === "global" ? currentGlobalLocale : currentBoneSetting;
};

export const getMorphLocale = (): UiLocale => {
    ensureLocalizationInitialized();
    return currentMorphSetting === "global" ? currentGlobalLocale : currentMorphSetting;
};

export const setModelLocale = (
    locale: UiLocale,
    options?: { persist?: boolean; emitEvent?: boolean },
): void => {
    ensureLocalizationInitialized();
    if (!isLocale(locale)) return;
    const emitEvent = options?.emitEvent ?? true;
    const changed = currentGlobalLocale !== locale;
    currentGlobalLocale = locale;
    if (emitEvent && changed) emitModelLocaleChanged("global");
};

export const setBoneLocaleSetting = (
    setting: ModelLocaleSetting,
    options?: { persist?: boolean; emitEvent?: boolean },
): void => {
    ensureLocalizationInitialized();
    if (!isLocaleSetting(setting)) return;
    const persist = options?.persist ?? true;
    const emitEvent = options?.emitEvent ?? true;
    const changed = currentBoneSetting !== setting;
    currentBoneSetting = setting;
    if (persist && typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_BONE, setting);
    }
    if (emitEvent && changed) emitModelLocaleChanged("bone");
};

export const setMorphLocaleSetting = (
    setting: ModelLocaleSetting,
    options?: { persist?: boolean; emitEvent?: boolean },
): void => {
    ensureLocalizationInitialized();
    if (!isLocaleSetting(setting)) return;
    const persist = options?.persist ?? true;
    const emitEvent = options?.emitEvent ?? true;
    const changed = currentMorphSetting !== setting;
    currentMorphSetting = setting;
    if (persist && typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_MORPH, setting);
    }
    if (emitEvent && changed) emitModelLocaleChanged("morph");
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
    if (locale === "ja") {
        const jpName = reverseLookup(info.morphDisplayFrameNameEnMap, frameName);
        if (jpName) return jpName;
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

export const resolveTrackLabelForLocales = (
    track: KeyframeTrack,
    info: ModelInfo | null,
    locales: { bone: UiLocale; morph: UiLocale },
): string => {
    if (!info) return track.name;
    if (track.category === "morph") return resolveMorphName(info, track.name, locales.morph);
    if (track.category === "camera") return track.name;
    return resolveBoneName(info, track.name, locales.bone);
};
