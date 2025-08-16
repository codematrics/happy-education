import Link from "next/link";
import { Button } from "../ui/button";

const ContactLink = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-5"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of successful students who have transformed their
            careers with our courses. Sign up today and get access to our entire
            course library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth"
              asChild
            >
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-smooth"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactLink;
