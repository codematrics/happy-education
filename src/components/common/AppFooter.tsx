"use client";

import Logo from "@/../public/logo/logo.png";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AppFooter = () => {
  const pathName = usePathname();
  const eventPage = pathName.includes("/event/");

  return (
    <footer
      className={`${
        eventPage ? "bg-[#0eff094a]" : "bg-background/80"
      } border-t border-border text-black pb-[64px]`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="rounded-xl">
                <Image
                  src={Logo}
                  alt="Happy-Education"
                  className="w-9 h-9 text-white"
                />
              </div>
              <span className="text-xl font-bold">Happy Education</span>
            </Link>
            <p>
              गुणवत्तापूर्ण शिक्षा और नवाचारी कोर्स के साथ शिक्षार्थियों को
              सशक्त बनाना।
            </p>
            <div className="flex space-x-4">
              <div className="p-2 rounded-lg bg-white hover:bg-secondary transition-smooth cursor-pointer">
                <Facebook className="w-4 h-4 text-black hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-white hover:bg-secondary transition-smooth cursor-pointer">
                <Twitter className="w-4 h-4 text-black hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-white hover:bg-secondary transition-smooth cursor-pointer">
                <Instagram className="w-4 h-4 text-black hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-white hover:bg-secondary transition-smooth cursor-pointer">
                <Linkedin className="w-4 h-4 text-black hover:text-primary transition-smooth" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">त्वरित लिंक</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block hover:text-primary transition-smooth"
              >
                होम
              </Link>
              <Link
                href="/courses"
                className="block hover:text-primary transition-smooth"
              >
                कोर्स
              </Link>
              <Link
                href="/testimonials"
                className="block hover:text-primary transition-smooth"
              >
                प्रशंसापत्र
              </Link>
              <Link
                href="/contact"
                className="block hover:text-primary transition-smooth"
              >
                संपर्क करें
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">संपर्क जानकारी</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>happyeducation9379@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 9327454267</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 7567801007</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2024 Happy Education. सर्वाधिकार सुरक्षित।
            </p>
            <div className="text-sm mt-2 md:mt-0 flex gap-[1ch]">
              <p className="">डिज़ाइन और विकास द्वारा</p>
              <Link
                href="https://www.codematrics.com/"
                className="text-primary hover:underline"
              >
                CodeMatrics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
