"use client";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="mx-auto max-w-5xl text-center mb-16">
        <h2 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
          Enterprise Capabilities
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
          Explore the tools designed specifically for corporate legal teams to accelerate workflows while maintaining strict data privacy.
        </p>
      </div>
      <BentoGrid className="mx-auto md:auto-rows-[20rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={cn("[&>p:text-lg]", item.className)}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </section>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-border p-2  items-center space-x-2 bg-card"
      >
        <div className="h-6 w-6 rounded-full bg-linear-to-r from-primary to-accent shrink-0" />
        <div className="w-full bg-muted h-4 rounded-full" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-border p-2 items-center space-x-2 w-3/4 ml-auto bg-card"
      >
        <div className="w-full bg-muted h-4 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-linear-to-r from-primary to-accent shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-border p-2 items-center space-x-2 bg-card"
      >
        <div className="h-6 w-6 rounded-full bg-linear-to-r from-primary to-accent shrink-0" />
        <div className="w-full bg-muted h-4 rounded-full" />
      </motion.div>
    </motion.div>
  );
};
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const arr = new Array(6).fill(0);
  const randomWidths = ["75%", "48%", "61%", "80%", "96%", "55%"];
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      {arr.map((_, i) => (
        <motion.div
          key={"skelenton-two" + i}
          variants={variants}
          style={{
            maxWidth: randomWidths[i],
          }}
          className="flex flex-row rounded-full border border-border p-2  items-center space-x-2 bg-muted w-full h-4"
        ></motion.div>
      ))}
    </motion.div>
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, var(--primary), var(--secondary), var(--accent), var(--primary))",
        backgroundSize: "400% 400%",
      }}
    >
      <motion.div className="h-full w-full rounded-lg"></motion.div>
    </motion.div>
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-card p-4 border border-border flex flex-col items-center justify-center"
      >
        <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <IconFileBroken className="h-5 w-5 text-destructive" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-muted-foreground mt-4">
          Vendor NDA 2026.pdf
        </p>
        <p className="border border-destructive/50 bg-destructive/10 text-destructive text-[10px] sm:text-xs rounded-full px-2 py-0.5 mt-4">
          High Risk
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-card p-4 border border-border flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
           <IconClipboardCopy className="h-5 w-5 text-primary" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-muted-foreground mt-4">
          SLA Agreement v2.pdf
        </p>
        <p className="border border-primary/50 bg-primary/10 text-primary text-[10px] sm:text-xs rounded-full px-2 py-0.5 mt-4">
          Approved
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-card p-4 border border-border flex flex-col items-center justify-center"
      >
        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
          <IconTableColumn className="h-5 w-5 text-accent" />
        </div>
        <p className="sm:text-sm text-xs text-center font-semibold text-muted-foreground mt-4">
          Procurement Policy.pdf
        </p>
        <p className="border border-accent/50 bg-accent/10 text-accent text-[10px] sm:text-xs rounded-full px-2 py-0.5 mt-4">
          Review Needed
        </p>
      </motion.div>
    </motion.div>
  );
};
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-border p-2 items-center space-x-2 bg-card"
      >
        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="text-accent text-xs font-bold">$</span>
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-foreground">Token Usage Alert</p>
          <p className="text-[10px] text-muted-foreground">
            Legal Team A has reached 80% of monthly LLM budget.
          </p>
        </div>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-border p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-card"
      >
        <p className="text-xs text-muted-foreground">View Dashboard</p>
        <div className="h-6 w-6 rounded-full bg-linear-to-r from-primary to-accent shrink-0" />
      </motion.div>
    </motion.div>
  );
};
const items = [
  {
    title: "Agentic RAG Chat",
    description: (
      <span className="text-sm">
        Interactive legal Q&A powered by AI, delivering accurate answers with exact document citations to eliminate hallucinations.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-primary" />,
  },
  {
    title: "Smart Redlining",
    description: (
      <span className="text-sm">
        Instantly compare contract versions with AI-driven change detection and risk scoring.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-primary" />,
  },
  {
    title: "PII Masking & Privacy",
    description: (
      <span className="text-sm">
        Built-in NLP censors sensitive entities before reaching external LLMs, ensuring 100% data confidentiality.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-primary" />,
  },
  {
    title: "Centralized Legal Knowledge Base",
    description: (
      <span className="text-sm">
        Google Drive-like document management with nested folders and strict Role-Based Access Control (RBAC) for admins and legal staff.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-primary" />,
  },
  {
    title: "FinOps & Cost Control",
    description: (
      <span className="text-sm">
        Real-time analytics dashboard to monitor AI token usage and operational costs across your entire organization.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-primary" />,
  },
];
