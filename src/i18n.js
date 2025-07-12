import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import ko from './locales/ko/translation.json';

i18n
  .use(LanguageDetector) // 브라우저 언어 감지
  .use(initReactI18next) // i18n을 react-i18next에 전달
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    fallbackLng: 'ko', // 기본 언어 설정
    debug: true,
    interpolation: {
      escapeValue: false, // React는 이미 XSS 방어 기능이 있으므로 false로 설정
    },
  });

export default i18n;