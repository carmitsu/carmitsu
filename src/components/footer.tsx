'use client';
import {Lang} from "@/utils/language";
import {RiCopyrightLine, RiFacebookCircleLine, RiInstagramLine, RiTiktokLine} from "@remixicon/react";
import {Link} from "@nextui-org/react";

export default function Footer({footer}: Lang) {
  const currentYear = new Date().getFullYear();
  return (
    // <footer className="rounded-lg m-4 bg-default-100 border-medium border-default-200">
    //   <div className="grid grid-cols-1 sm:grid-cols-2 max-sm:justify-items-center max-sm:space-y-2 max-sm:space-y-reverse p-1 px-2">
    //     <div className=" max-sm:space-y-reverse space-y-1 max-sm:grid justify-items-center">
    //       <span className="text-sm sm:text-center flex items-center"><RiCopyrightLine size={16}
    //                                                                                   className="mr-1"/> {currentYear} CarMitsu. {footer?.rights}.</span>
    //       <ul className="flex flex-wrap items-center text-sm font-medium space-x-6 max-sm:order-first">
    //         <li>
    //           <a href="/#About" className="hover:underline">{footer?.about}</a>
    //         </li>
    //         <li>
    //           <a href="/#Contact" className="hover:underline">{footer?.contact}</a>
    //         </li>
    //         <li>
    //           <a href="/privacy" className="hover:underline">{footer?.privacy}</a>
    //         </li>
    //       </ul>
    //     </div>
    //     <div className="flex justify-end items-center max-sm:order-first">
    //       <a href="https://" target="_blank" className="me-2"><RiFacebookLine size={24}/></a>
    //       <a href="https://" target="_blank" className="me-2"><RiInstagramLine size={24}/></a>
    //       <a href="https://" target="_blank"><RiTiktokLine size={24}/></a>
    //     </div>
    //   </div>
    // </footer>
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