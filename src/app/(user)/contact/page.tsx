import InquiryForm from "@/components/inquiry/InquiryForm";
import { Mail, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-dvh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our courses? Need technical support? We're here
            to help! Send us a message and we'll respond as quickly as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="">
            <div className="bg-card rounded-2xl p-8 shadow-soft border">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

              <InquiryForm />

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By submitting this form, you agree to our privacy policy and
                  terms of service. We'll never share your information with
                  third parties.
                </p>
              </div>
            </div>
          </div>
          {/* Contact Information */}
          <div className="space-y-8 px-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6 grid grid-cols-2 lg:grid-cols-1">
                <div className="flex items-start space-x-4 rounded-2xl p-4 shadow-soft border">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-muted-foreground">
                      info@eduplatform.com
                    </p>
                    <p className="text-muted-foreground">
                      support@eduplatform.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-2xl p-4 shadow-soft border">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">
                      Mon-Sun 9AM-10PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <h2 className="text-2xl font-bold mb-6 text-center">Find Us</h2>
            <div className="mb-6 text-center">
              <p className="text-muted-foreground mb-2">
                Visit our office at 123 Education Street, Learning City, LC
                12345
              </p>
              <p className="text-sm text-muted-foreground">
                Open Monday to Friday, 9:00 AM - 6:00 PM EST
              </p>
            </div>
            <iframe
              className="w-full h-96 shadow-md rounded-lg"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14678.071183989867!2d72.64091005289413!3d23.11474141574521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e81c03ae1b4d7%3A0x7aed3a98cfd3654d!2sHappy%20Education!5e0!3m2!1sen!2sin!4v1755353717459!5m2!1sen!2sin"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
