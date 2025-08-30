"use client";

import Logo from "@/../public/logo/logo.png";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AppFooter = () => {
  const pathName = usePathname();
  const showMap = pathName !== "/contact";
  return (
    <footer className="bg-card border-t border-border">
      {showMap && (
        <div className="w-full overflow-hidden px-4 pt-12">
          <iframe
            className="w-full h-50 rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14678.071183989867!2d72.64091005289413!3d23.11474141574521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e81c03ae1b4d7%3A0x7aed3a98cfd3654d!2sHappy%20Education!5e0!3m2!1sen!2sin!4v1755353717459!5m2!1sen!2sin"
            loading="lazy"
          ></iframe>
        </div>
      )}
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
            <p className="text-muted-foreground">
              गुणवत्तापूर्ण शिक्षा और नवाचारी कोर्स के साथ शिक्षार्थियों को
              सशक्त बनाना।
            </p>
            <div className="flex space-x-4">
              <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth cursor-pointer">
                <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth cursor-pointer">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth cursor-pointer">
                <Instagram className="w-4 h-4 text-muted-foreground hover:text-primary transition-smooth" />
              </div>
              <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth cursor-pointer">
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary transition-smooth" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">त्वरित लिंक</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                होम
              </Link>
              <Link
                href="/courses"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                कोर्स
              </Link>
              <Link
                href="/testimonials"
                className="block text-muted-foreground hover:text-primary transition-smooth"
              >
                प्रशंसापत्र
              </Link>
              <Link
                href="/contact"
                className="block text-muted-foreground hover:text-primary transition-smooth"
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
                <span className="text-muted-foreground">
                  info@eduplatform.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <span className="text-muted-foreground">
                    123 एजुकेशन स्ट्रीट, लर्निंग सिटी
                  </span>
                </div>
                {/* Responsive Google Map */}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Happy Education. सर्वाधिकार सुरक्षित।
            </p>
            <div className="text-muted-foreground text-sm mt-2 md:mt-0 flex gap-[1ch]">
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
