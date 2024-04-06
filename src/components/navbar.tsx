'use client'
import {Lang} from "@/utils/language";
import React, {useState} from "react";
import {
  Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, Button, Dropdown,
  DropdownTrigger, DropdownMenu, DropdownItem,
} from "@nextui-org/react";

export default function Navigation({navbar, language}: Lang) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [selectedLanguage] = useState(language);

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarBrand>
          <a href="/">
            <h1 className="text-3xl">CarMitsu</h1>
          </a>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#" className="font-medium">
            {navbar?.home}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#About" className="font-medium">
            {navbar?.about}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#Contact" className="font-medium">
            {navbar?.contact}
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <Dropdown>
          <DropdownTrigger>
            <Button className="flex items-center" variant="flat" color="primary">
              <span className="sr-only">Change language</span>
              {selectedLanguage &&
                  <img src={`/flags/${selectedLanguage}.svg`} alt={`${selectedLanguage} Flag`} className="h-4 mr-1"/>}
              {selectedLanguage && navbar?.languageList[selectedLanguage] &&
                  <span className="font-medium">{navbar.languageList[selectedLanguage][0]}</span>}
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            {Object.keys(navbar?.languageList || {})
              .sort((a, b) => (a === selectedLanguage ? -1 : 0))
              .map(lang => (
                <DropdownItem key={lang} startContent={<img src={`/flags/${lang}.svg`} alt={`${lang} Flag`} className="h-4 mr-1"/>}>
                  <a href={navbar?.languageList[lang][1]} className="flex items-center">
                    {navbar?.languageList[lang][0]}
                  </a>
                </DropdownItem>
              ))}
          </DropdownMenu>
        </Dropdown>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <Link color="foreground" href="#" className="text-xl">
            {navbar?.home}
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="#About" className="text-xl">
            {navbar?.about}
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="#Contact" className="text-xl">
            {navbar?.contact}
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}