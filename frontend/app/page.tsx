import type { Metadata } from "next";
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/hero/HeroSection';
import FeaturesSection from '@/components/hero/FeaturesSection';
import CTASection from '@/components/hero/CTASection';

export const metadata: Metadata = {
  title: 'Alexander.Ai - AI-Powered Hiring Platform',
  description: 'Streamline your hiring process with AI precision. Connect exceptional talent with forward-thinking companies using our intelligent matching system.',
};

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
}
