'use client';
import {RiCopyrightLine, RiFacebookCircleLine, RiInstagramLine, RiTiktokLine} from "@remixicon/react";
import {Link} from "@nextui-org/react";
import {useLanguage} from "@/contexts/LanguageContext";

export default function Footer() {
  const { data } = useLanguage();
  const footer = data.footer;
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="lg:grid lg:px-4 grid-cols-2 bg-default-100 m-4 rounded-lg border-medium border-default-200">
      <div className="lg:flex flex-col items-start w-full px-4 py-2 mx-auto space-y-3 overflow-hidden">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link href="/#About" color="foreground">{footer?.about}</Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/#Contact" color="foreground">{footer?.contact}</Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/privacy" color="foreground">{footer?.privacy}</Link>
          </div>
        </nav>
        <div className="flex justify-center mt-8 space-x-6 lg:hidden">
          <SocialLinks/>
        </div>
        <p className="mt-8 text-base leading-6 text-center text-gray-400 flex items-center justify-center">
          <RiCopyrightLine size={16} className="mr-1"/> {currentYear} CarMitsu. {footer?.rights}.
        </p>
      </div>
      <div className="max-lg:hidden flex items-center space-x-4 px-4 justify-end">
        <SocialLinks/>
      </div>
    </footer>
  );
}

function SocialLinks() {
  return (
    <>
      <a href="https://www.facebook.com/people/CarMitsu-Serwis/100092731188594/">
        <span className="sr-only">Facebook</span>
        <RiFacebookCircleLine size={24} className="transition-colors hover:text-gray-400"/>
      </a>
      <a href="https://www.instagram.com/carmitsu.pl/">
        <span className="sr-only">Instagram</span>
        <RiInstagramLine size={24} className="transition-colors hover:text-gray-400"/>
      </a>
      <a href="https://www.tiktok.com/@carmitsu_serwis">
        <span className="sr-only">TikTok</span>
        <RiTiktokLine size={24} className="transition-colors hover:text-gray-400"/>
      </a>
    </>
  )
}
