import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = "December 26, 2024";

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect your name, email address, phone number, and professional information such as your resume, work history, and skills.",
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent on the platform.",
        },
        {
          subtitle: "Device Information",
          text: "We collect device identifiers, browser type, operating system, and IP address to improve our services and ensure security.",
        },
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide our AI-powered matching services, connecting job seekers with employers and helping HR professionals find qualified candidates.",
        },
        {
          subtitle: "Platform Improvement",
          text: "We analyze usage patterns to improve our algorithms, enhance user experience, and develop new features.",
        },
        {
          subtitle: "Communication",
          text: "We may send you service-related notifications, updates about job matches, and with your consent, marketing communications.",
        },
      ],
    },
    {
      title: "3. Data Sharing and Disclosure",
      content: [
        {
          subtitle: "With Employers / Applicants",
          text: "Your profile information is shared with potential employers or candidates based on your preferences and our matching algorithms.",
        },
        {
          subtitle: "Service Providers",
          text: "We work with trusted third-party providers for hosting, analytics, and other services. They are contractually bound to protect your data.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or in response to valid legal processes.",
        },
      ],
    },
    {
      title: "4. Data Security",
      content: [
        {
          text: "We implement industry-standard security measures including encryption, access controls, and regular security audits. Your data is stored in secure data centers with 24/7 monitoring. We conduct regular penetration testing and maintain SOC 2 compliance standards.",
        },
      ],
    },
    {
      title: "5. Your Rights and Choices",
      content: [
        {
          subtitle: "Access and Portability",
          text: "You can access, download, or export your personal data at any time through your account settings.",
        },
        {
          subtitle: "Correction and Deletion",
          text: "You may update or correct your information, or request complete deletion of your account and associated data.",
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt out of marketing communications and adjust privacy settings to control data sharing preferences.",
        },
      ],
    },
    {
      title: "6. Cookies and Tracking",
      content: [
        {
          text: "We use cookies and similar technologies to remember your preferences, analyze usage patterns, and deliver personalized experiences. You can manage cookie preferences through your browser settings or our cookie consent tool.",
        },
      ],
    },
    {
      title: "7. Data Retention",
      content: [
        {
          text: "We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance or legitimate business purposes for up to 7 years.",
        },
      ],
    },
    {
      title: "8. International Data Transfers",
      content: [
        {
          text: "Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adherence to international data protection frameworks.",
        },
      ],
    },
    {
      title: "9. Children’s Privacy",
      content: [
        {
          text: "Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children. If we learn we have collected such information, we will delete it promptly.",
        },
      ],
    },
    {
      title: "10. Changes to This Policy",
      content: [
        {
          text: "We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification at least 30 days before they take effect.",
        },
      ],
    },
  ];

  return (
    <Layout>
      <Head>
        <title>Privacy Policy | Alexander.AI</title>
        <meta
          name="description"
          content="Read our privacy policy to understand how Alexander.AI collects, uses, and protects your personal information."
        />
      </Head>

      {/* Hero */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-primary-foreground/80">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground mb-12 text-lg">
              At Alexander.AI, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, share, and protect your data
              when you use our AI-powered HR platform.
            </p>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-8 last:border-0"
                >
                  <h2 className="text-2xl font-bold mb-6">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.content.map((item, i) => (
                      <div key={i}>
                        {item.subtitle && (
                          <h3 className="text-lg font-semibold mb-2">
                            {item.subtitle}
                          </h3>
                        )}
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <strong>Email:</strong> privacy@alexander.ai
                </li>
                <li>
                  <strong>Address:</strong> 123 Innovation Drive, Tech City, TC
                  12345
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> dpo@alexander.ai
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
