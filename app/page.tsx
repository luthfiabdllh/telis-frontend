"use client";

import FeaturesSection from "@/features/landing-page/components/feature-section";
import FaqSection from "@/features/landing-page/components/faq-section";
import { StickyFooter } from "@/features/landing-page/components/footer";
import GoogleGeminiEffectDemo from "@/features/landing-page/components/google-gemini-effect-demo";
import { HeroSection } from "@/features/landing-page/components/hero-section";
import PricingSection from "@/features/landing-page/components/pricing-section";

export default function Page() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <GoogleGeminiEffectDemo />
      <StickyFooter />
    </>
  );
}
