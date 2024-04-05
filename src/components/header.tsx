'use client'
import {Lang} from "@/utils/language";
import {useState} from 'react'

export default function Navigation({navbar, language}: Lang) {
  const [Menu, setMenu] = useState(false);
  const [LangMenu, setLangMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const renderLanguages = () => {
    if (!navbar || !navbar.language) {
      return null;
    }

    const languages = Object.keys(navbar.language);
    const sortedLanguages = [selectedLanguage, ...languages.filter(lang => lang !== selectedLanguage)];

    return sortedLanguages.map(lang => (
      <a href={navbar.language[lang][1]}
         key={lang}
         className="flex py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 items-center"
      >
        <img src={`/flags/${lang}.svg`} alt={`${lang} Flag`} className="h-4 mr-1"/>
        {navbar.language[lang][0]}
      </a>
    ));
  }

  return (
    <nav className="bg-white w-fullborder-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">CarMitsu</span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <div>
            <button
              type="button"
              className="inline-flex items-center p-2 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => setLangMenu(!LangMenu)}
            >
              <span className="sr-only">Change language</span>
              <img src={`/flags/${selectedLanguage}.svg`} alt={`${selectedLanguage} Flag`} className="h-4 mr-1"/>
              <span className="font-medium">{navbar?.language[selectedLanguage][0]}</span>
            </button>
            <div
              className={`flex flex-col justify-center p-4 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 rtl:space-x-reverse absolute right-0 w-44 ${LangMenu ? '' : 'hidden'}`}>
              {renderLanguages()}
            </div>
          </div>
          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-sticky"
            aria-expanded={Menu}
            onClick={() => setMenu(!Menu)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>
        <div
          className={`items-center z-10 justify-between w-full md:flex md:w-auto md:order-1 ${Menu ? '' : 'hidden'}`}>
          <ul
            className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white max-md:absolute max-md:right-0 max-md:w-full">
            <li>
              <a href="#"
                 className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">{navbar?.home}</a>
            </li>
            <li>
              <a href="#"
                 className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">{navbar?.about}</a>
            </li>
            <li>
              <a href="#"
                 className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">{navbar?.contact}</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}