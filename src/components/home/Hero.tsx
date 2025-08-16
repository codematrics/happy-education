import HeroImage from "@/../public/hero.png";
import { Award, Play, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const Hero = () => {
  return (
    <section className="relative py-12 overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Learn Without
                <span className="block bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Unlock your potential with our comprehensive courses designed by
                industry experts. Start your learning journey today and
                transform your career.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
                >
                  View Trending Courses
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-smooth group"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-card rounded-2xl p-8 shadow-strong">
              <Image
                src={HeroImage}
                alt="Students learning"
                className="w-full h-80 object-cover rounded-xl"
              />
              <div className="absolute -top-4 -right-4 bg-warning text-warning-foreground p-4 rounded-xl shadow-medium">
                <Award className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-medium">
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
