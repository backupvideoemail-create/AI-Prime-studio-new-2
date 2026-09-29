import { useState, useEffect, createContext, useContext } from 'react';
import { en } from './en';
import { hi } from './hi';
import { LanguageCode } from '../types';

export type Translation = typeof en;

const translations: Record<LanguageCode, Translation> = {
  en,
  hi,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translation;
  hasChosenLanguage: boolean;
  setHasChosenLanguage: (chosen: boolean) => void;
}

const STORAGE_LANG_KEY = 'jrr_ai_studio_language';
const STORAGE_CHOSEN_KEY = 'jrr_ai_studio_lang_selected';

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
  hasChosenLanguage: false,
  setHasChosenLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const getInitialLanguage = (): { lang: LanguageCode; hasChosen: boolean } => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null;
    const chosen = localStorage.getItem(STORAGE_CHOSEN_KEY) === 'true';
    if (saved === 'hi' || saved === 'en') {
      return { lang: saved, hasChosen: chosen };
    }
  } catch (e) {
    // Fallback if localStorage is restricted
  }
  return { lang: 'en', hasChosen: false };
};

export { translations };
