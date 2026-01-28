import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importamos los JSONs que acabamos de crear
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(initReactI18next) // Pasamos i18n a React
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: 'es', // Idioma por defecto (puedes cambiarlo a 'en' para probar)
    fallbackLng: 'en', // Si falla el español, usa inglés
    interpolation: {
      escapeValue: false // React ya protege contra ataques XSS
    }
  });

export default i18n;