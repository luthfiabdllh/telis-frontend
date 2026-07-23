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
              className="mx-auto h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/id/thumb/c/c4/Telkom_Indonesia_2013.svg/3840px-Telkom_Indonesia_2013.svg.png"
              alt="Telkom Indonesia Logo"
            />
          </div>

          <div className="flex">
            <img
              className="mx-auto h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Telkomsel_%282021%29.svg/3840px-Telkomsel_%282021%29.svg.png"
              alt="Telkomsel Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-5 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg"
              alt="Bank Mandiri Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Pertamina_Logo.svg/3840px-Pertamina_Logo.svg.png"
              alt="Pertamina Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
              alt="BCA Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/GoTo_Logo.png/3840px-GoTo_Logo.png"
              alt="GoTo Logo"
            />
          </div>
          <div className="flex">
            <img
              className="mx-auto h-7 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
              alt="PLN Logo"
            />
          </div>

          <div className="flex">
            <img
              className="mx-auto h-5 w-auto opacity-70 hover:opacity-100 transition-opacity"
              src="https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg"
              alt="BRI Logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
