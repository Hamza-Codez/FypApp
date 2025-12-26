"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium">
              Start Today
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your{" "}
            <span className="text-gradient-gold">Hiring Process?</span>
          </h2>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            Join thousands of companies and candidates already experiencing the
            future of recruitment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link href="/signup/applicant" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button variant="heroOutline" size="xl" asChild>
              <Link href="/ai-assistant">
                Try AI Assistant
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-primary-foreground/50 text-sm mt-6">
            No credit card required • Free forever for basic features
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
