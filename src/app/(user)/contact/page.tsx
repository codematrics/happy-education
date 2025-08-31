import InquiryForm from "@/components/inquiry/InquiryForm";
import { Mail, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-dvh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">संपर्क करें</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            हमारे कोर्स के बारे में सवाल हैं? तकनीकी सहायता चाहिए? हम आपकी मदद
            के लिए यहां हैं! हमें संदेश भेजें और हम जल्द से जल्द उत्तर देंगे।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="">
            <div className="bg-card rounded-2xl p-8 shadow-soft border">
              <h2 className="text-2xl font-bold mb-6">हमें संदेश भेजें</h2>

              <InquiryForm />

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  इस फॉर्म को सबमिट करके, आप हमारी गोपनीयता नीति और सेवा की
                  शर्तों से सहमत होते हैं। हम आपकी जानकारी किसी तीसरे पक्ष के
                  साथ साझा नहीं करेंगे।
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 px-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">संपर्क जानकारी</h2>
              <div className="space-y-6 grid grid-cols-2 lg:grid-cols-1">
                <div className="flex items-start space-x-4 rounded-2xl p-4 shadow-soft border">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">हमें ईमेल करें</h3>
                    <p className="text-muted-foreground">
                      happyeducation9379@gmail.com
                    </p>
                    <p className="text-muted-foreground">
                      happyeducation9379@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-2xl p-4 shadow-soft border">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">हमें कॉल करें</h3>
                    <p className="text-muted-foreground">+91 9327454267</p>
                    <p className="text-muted-foreground">
                      सोमवार-रविवार 9AM-10PM EST
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
            <h2 className="text-2xl font-bold mb-6 text-center">हमसे मिलें</h2>
            <div className="mb-6 text-center">
              <p className="text-muted-foreground mb-2">
                हमारे कार्यालय पर आएँ: Royal Arcade, 307, New Shahibaug, Nana
                Chiloda, Gujarat 382330
              </p>
              <p className="text-sm text-muted-foreground">
                सोमवार से शुक्रवार, सुबह 9:00 बजे - शाम 6:00 बजे EST
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
