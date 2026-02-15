import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Carga los archivos desde /public/locales
  .use(Backend)
  // Detecta el idioma del navegador
  .use(LanguageDetector)
  // Pasa la instancia a react
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', 
    debug: true, 
    
    interpolation: {
      escapeValue: false, 
    },
    
    // Esta es la parte clave: le dice dónde buscar en la carpeta public
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    }
  });

export default i18n;