import type { Metadata } from "next";
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { Sparkles, Target, Users, Globe, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us - Alexander.Ai',
  description: 'Learn about Alexander.Ai\'s mission to revolutionize hiring through AI-powered talent matching.',
};

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">Our Story</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Transforming How the World <span className="text-gradient-gold">Hires</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70">
              We believe finding the right job—or the right candidate—shouldn't be left to chance. 
              That's why we built Alexander.Ai.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Alexander.Ai was founded with a simple yet powerful vision: to eliminate the friction 
                in hiring by leveraging the power of artificial intelligence.
              </p>
              <p className="text-muted-foreground text-lg mb-6">
                Traditional recruitment is time-consuming, biased, and often ineffective. We're changing 
                that by creating intelligent systems that understand what makes a great match between 
                candidates and companies.
              </p>
              <p className="text-muted-foreground text-lg">
                Our AI doesn't just match keywords—it understands context, potential, and cultural fit 
                to create meaningful connections that benefit everyone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, value: '95%', label: 'Match Accuracy' },
                { icon: Users, value: '50K+', label: 'Happy Users' },
                { icon: Globe, value: '30+', label: 'Countries' },
                { icon: Award, value: '10K+', label: 'Successful Placements' },
              ].map((stat) => (
                <div key={stat.label} className="p-6 bg-card rounded-xl border border-border text-center">
                  <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-lg">
              These principles guide everything we do at Alexander.Ai
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Precision',
                description: 'We believe in getting it right. Our AI is trained to find the perfect match, not just any match.',
              },
              {
                title: 'Fairness',
                description: 'Opportunity should be based on merit. Our systems are designed to reduce bias in hiring.',
              },
              {
                title: 'Innovation',
                description: 'We constantly push the boundaries of what is possible in talent matching technology.',
              },
            ].map((value) => (
              <div key={value.title} className="p-8 bg-card rounded-xl border border-border">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of companies and candidates already using Alexander.Ai
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link href="/signup/applicant">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/ai-assistant">Try AI Assistant</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}


