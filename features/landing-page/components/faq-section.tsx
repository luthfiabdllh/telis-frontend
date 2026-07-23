"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function FaqSection() {
  const faqItems = [
    {
      id: "item-1",
      question: "How does TELIS ensure data privacy?",
      answer:
        "TELIS uses a proprietary built-in PII (Personally Identifiable Information) Masking service. Before any data is sent to the LLM, sensitive entities like names, addresses, and monetary values are automatically redacted, ensuring zero data leakage.",
    },
    {
      id: "item-2",
      question: "Can TELIS hallucinate legal answers?",
      answer:
        "No. TELIS is built on an Agentic Retrieval-Augmented Generation (RAG) architecture. It only generates answers based on the internal corporate documents you upload, and always provides exact page and document citations for verification.",
    },
    {
      id: "item-3",
      question: "Do you offer on-premise deployment?",
      answer:
        "Yes! For enterprises with strict data residency requirements (like banks or telecommunications), we offer full on-premise deployment so your data never leaves your internal servers.",
    },
    {
      id: "item-4",
      question: "How does Smart Redlining work?",
      answer:
        "You simply upload two versions of a contract (e.g., initial draft vs. vendor's redline). TELIS will automatically detect all added, modified, or deleted clauses and assign a Risk Score based on your company's standard policies.",
    },
    {
      id: "item-5",
      question: "Can I integrate TELIS into our existing systems?",
      answer:
        "Absolutely. TELIS is built on a microservices architecture and exposes REST and gRPC APIs, allowing seamless integration with your existing ERP, CRM, or custom legal workflows.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto text-center">
          <h2 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
            Discover quick and comprehensive answers to common questions about
            our platform, services, and features.
          </p>
        </div>

        <div className="mx-auto mt-12 ">
          <Accordion
            type="single"
            collapsible
            className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-muted-foreground text-center mt-6 px-8">
            Can't find what you're looking for? Contact our{" "}
            <Link href="#" className="text-primary font-medium hover:underline">
              customer support team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
