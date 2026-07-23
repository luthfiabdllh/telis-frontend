import {
  ModernPricingPage,
  PricingCardProps,
} from "@/components/ui/animated-glassy-pricing";

const myPricingPlans: PricingCardProps[] = [
  {
    planName: "SaaS Cloud",
    description: "Dedicated cloud instance for mid-sized legal teams.",
    price: "Custom",
    features: ["Role-Based Access Control", "Automated PII Masking", "Standard Support SLA", "Monthly FinOps Reporting"],
    buttonText: "Request Quote",
    buttonVariant: "secondary",
  },
  {
    planName: "Enterprise / On-Prem",
    description: "Full on-premise deployment for maximum data residency.",
    price: "Custom",
    features: [
      "Deployed on your Servers",
      "Unlimited Documents",
      "24/7 Dedicated Support",
      "Active Directory / SSO",
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
      "Full API Access (REST/gRPC)",
      "Custom Workflow Automation",
      "SLA Guarantees",
      "Technical Integration Support",
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
