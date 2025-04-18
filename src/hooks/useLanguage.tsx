
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, section?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    try {
      // Split the key by dots to handle nested properties
      const parts = key.split('.');
      let result: any = translations[language];
      
      // Navigate through the object based on the key parts
      for (const part of parts) {
        if (result && result[part] !== undefined) {
          result = result[part];
        } else {
          return key; // Return the key if the translation is not found
        }
      }
      
      // Make sure we're returning a string
      return typeof result === 'string' ? result : key;
    } catch (e) {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
