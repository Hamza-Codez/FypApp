"use client";

import Link from "next/link";
import {
  ArrowRight,
  Users,
  Briefcase,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const highlights = [
    { icon: Shield, label: "Bias-Free Hiring" },
    { icon: Zap, label: "AI-Powered Matching" },
    { icon: Target, label: "Perfect Fit Analysis" },
    { icon: CheckCircle, label: "Compliance Ready" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden pt-22">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-float" />

        <div className="absolute inset-0 bg-[linear-gradient(hsl(225_73%_50%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(225_73%_50%/0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(225_73%_50%/0.15)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8 animate-fade-up backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-sm font-medium">
              AI-Powered HR Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up leading-tight">
            Streamline Hiring with{" "}
            <span className="relative inline-block">
              <span className="text-blue-800">AI Precision</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-glow" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-up">
            Connect exceptional talent with forward-thinking companies. Our
            intelligent matching system finds the perfect fit, every time.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-up">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground/90 text-sm font-medium hover:bg-primary/30 hover:border-primary/50 transition-all"
              >
                <item.icon className="w-4 h-4 text-accent" />
                {item.label}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up">
            <Button variant="hero" size="xl" asChild className="group bg-gradient-to-tl from-slate-700 to-blue-700 animate-glow">
              <Link href="/signup/applicant">
                <Users className="w-5 h-5" />
                For Applicants
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button variant="heroOutline" size="xl" asChild className="group">
              <Link href="/signup/hr">
                <Briefcase className="w-5 h-5" />
                For HR Teams
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-up">
            {[
              { value: "10K+", label: "Active Jobs", icon: TrendingUp },
              { value: "50K+", label: "Candidates", icon: Users },
              { value: "95%", label: "Match Rate", icon: Target },
              { value: "2.5x", label: "Faster Hiring", icon: Zap },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-card/5 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary/20 transition-all"
              >
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
