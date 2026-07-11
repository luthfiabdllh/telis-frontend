import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const CustomerLogos = () => {
  return (
    <section className="bg-background pb-16 pt-16 md:pb-32">
      <div className="group relative m-auto max-w-5xl px-6">
        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
          <Link
            href="/"
            className="block text-sm duration-150 hover:opacity-75"
          >
            <span> Meet Our Customers</span>
            <ChevronRight className="ml-1 inline-block size-3" />
          </Link>
        </div>
        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14 items-center">
          <div className="flex">
            <img
              className="mx-auto h-5 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg"
              alt="Nvidia Logo"
            />
          </div>

          <div className="flex">
            <img
              className="mx-auto h-6 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
              alt="Microsoft Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-7 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
              alt="GitHub Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
              alt="Nike Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
              alt="Stripe Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Laravel.svg"
              alt="Laravel Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
              alt="Google Logo"
            />
          </div>

          <div className="flex">
            <img
              className="mx-auto h-7 w-auto dark:invert opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
              alt="OpenAI Logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
