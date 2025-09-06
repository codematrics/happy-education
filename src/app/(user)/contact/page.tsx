import InquiryForm from "@/components/inquiry/InquiryForm";

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

        <div className="grid lg:grid-cols-1 max-w-lg mx-auto gap-12">
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
        </div>
      </div>
    </div>
  );
};

export default Contact;
