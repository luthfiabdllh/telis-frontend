"use client";

import { StickyFooter } from "@/features/landing-page/components/footer";
import GoogleGeminiEffectDemo from "@/features/landing-page/components/google-gemini-effect-demo";
import { HeroSection } from "@/features/landing-page/components/hero-section";

export default function Page() {
  return (
    <>
      <HeroSection />
      <GoogleGeminiEffectDemo />
      <StickyFooter />
    </>
  );
}
