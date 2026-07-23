import { Metadata } from "next";
import FeaturesSection from "@/features/landing-page/components/feature-section";
import FaqSection from "@/features/landing-page/components/faq-section";
import { StickyFooter } from "@/features/landing-page/components/footer";
import GoogleGeminiEffectDemo from "@/features/landing-page/components/google-gemini-effect-demo";
import { HeroSection } from "@/features/landing-page/components/hero-section";
import PricingSection from "@/features/landing-page/components/pricing-section";

export const metadata: Metadata = {
  title: "TELIS | Enterprise Legal AI Intelligence",
  description: "TELIS (Telkom Legal Intelligence System) is an enterprise-grade AI platform for corporate legal teams. Features Agentic RAG, Smart Redlining, and built-in PII Masking.",
  keywords: ["Legal AI", "Agentic RAG", "Smart Redlining", "Enterprise Legal", "Telkom Legal Intelligence System", "PII Masking", "Legal Tech Indonesia"],
  openGraph: {
    title: "TELIS | Enterprise Legal AI Intelligence",
    description: "Transform your legal department with TELIS. Featuring Agentic RAG, Smart Redlining, and top-tier data security for enterprises.",
    url: "https://telis.telkom.co.id",
    siteName: "TELIS",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "TELIS Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TELIS | Enterprise Legal AI Intelligence",
    description: "AI platform for Enterprise Legal Teams. Secure, accurate, and powerful.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <GoogleGeminiEffectDemo />
      <StickyFooter />
    </main>
  );
}
