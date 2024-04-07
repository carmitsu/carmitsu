'use client';
import {Lang} from "@/utils/language";

export default function Footer({footer}: Lang) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="rounded-lg m-4 bg-default-100 border-medium border-default-200">
      <div className="w-full p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm sm:text-center ">© {currentYear} CarMitsu. {footer?.rights}.</span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium sm:mt-0">
          <li>
            <a href="/#About" className="hover:underline me-4 md:me-6">{footer?.about}</a>
          </li>
          <li>
            <a href="/#Contact" className="hover:underline me-4 md:me-6">{footer?.contact}</a>
          </li>
          <li>
            <a href="/privacy" className="hover:underline me-4 md:me-6">{footer?.privacy}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}