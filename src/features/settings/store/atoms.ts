import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { AppSettings, Language, Theme } from "@/shared/types/shared.types";

export const appSettingsAtom = atomWithStorage<AppSettings>(
  "todo-app-settings",
  {
    theme: "light",
    language: "ja",
  },
);

export const themeAtom = atom(
  (get) => get(appSettingsAtom).theme,
  (get, set, newTheme: Theme) => {
    const settings = get(appSettingsAtom);
    set(appSettingsAtom, { ...settings, theme: newTheme });
  },
);

export const languageAtom = atom(
  (get) => get(appSettingsAtom).language,
  (get, set, newLanguage: Language) => {
    const settings = get(appSettingsAtom);
    set(appSettingsAtom, { ...settings, language: newLanguage });
  },
);
