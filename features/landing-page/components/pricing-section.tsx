import {
  ModernPricingPage,
  PricingCardProps,
} from "@/components/ui/animated-glassy-pricing";

const myPricingPlans: PricingCardProps[] = [
  {
    planName: "SaaS Cloud",
    description: "Dedicated cloud instance for mid-sized legal teams.",
    price: "Custom",
    features: [
      "AI Legal Intelligence",
      "Cloud Storage Telkom",
      "Agentic RAG & Legal Search",
      "Legal Summarization",
      "Folder Management",
      "Google & Microsoft SSO",
      "Maintenance & Tech Support"
    ],
    buttonText: "Request Quote",
    buttonVariant: "secondary",
  },
  {
    planName: "Enterprise / On-Prem",
    description: "Full on-premise deployment for maximum data residency.",
    price: "Custom",
    features: [
      "AI Legal Intelligence",
      "Dedicated Internet",
      "Agentic RAG & Legal Search",
      "Smart Contract Redlining",
      "Folder Management",
      "On-Premise Deployment",
      "Maintenance & Tech Support"
    ],
    buttonText: "Contact Sales",
    isPopular: true,
    buttonVariant: "primary",
  },
  {
    planName: "Managed API",
    description: "Integrate TELIS directly into your existing ERP.",
    price: "Custom",
    features: [
      "Embeddable AI Intelligence",
      "Full API Access (REST/gRPC)",
      "Agentic RAG & Legal Search",
      "PII Masking Endpoints",
      "ERP & CRM Integration",
      "Custom Workflow Automation",
      "Maintenance & Tech Support"
    ],
    buttonText: "Talk to Engineering",
    buttonVariant: "primary",
  },
];

export default function PricingSection() {
  return (
    <ModernPricingPage
      title={
        <>
          Flexible <span className="text-cyan-400">Enterprise Models</span> for Your Business
        </>
      }
      subtitle="Whether you need a dedicated cloud or full on-premise data residency, we have you covered."
      plans={myPricingPlans}
      showAnimatedBackground={true}
    />
  );
}
