import React from "react";
import {useTranslation} from "react-i18next";
import {LANGUAGE_TRANSLATIONS, LANGUAGES} from "src/i18n";

const LanguageSelector: React.FC = () => {
  const {i18n} = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    if (typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={i18n.language}
        onChange={handleChange}
        className="h-9 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-pointer shadow-xs focus:ring-1 focus:ring-teal-500 pr-7"
        aria-label="Select language"
      >
        {LANGUAGES.map((language) => (
          <option
            key={language}
            value={language}
            className="text-black dark:text-white dark:bg-gray-800"
          >
            {LANGUAGE_TRANSLATIONS[language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
