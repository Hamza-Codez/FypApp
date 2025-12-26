import Link from 'next/link';
import { Sparkles, Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'AI Assistant', href: '/ai-assistant' },
      { label: 'For Applicants', href: '/signup/applicant' },
      { label: 'For HR Teams', href: '/signup/hr' },
      { label: 'HR Practices', href: '/hr-practices' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
      { label: 'Support Us', href: '/support' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">
                Alexander<span className="text-black">.Ai</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4 max-w-xs">
              Streamline your hiring process with AI-powered precision. 
              Connecting talent with opportunity.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm">
            © {currentYear} Alexander.Ai. All rights reserved.
          </p>
          <p className="text-white text-xs">
            Made with precision for the modern workforce
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


