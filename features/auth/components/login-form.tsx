"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/use-login";
import { Scale, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { ButtonGroup } from "@/components/ui/button-group";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form, error, isLoading, onSubmit } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden shadow-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Section */}
          <form
            onSubmit={onSubmit}
            className="p-8 flex flex-col justify-center"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center lg:hidden">
                <Scale className="h-10 w-10 text-zinc-900 dark:text-zinc-100 mb-2" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <h1 className="text-2xl font-bold tracking-tight">
                  Selamat Datang
                </h1>
                <p className="text-balance text-zinc-500 text-sm">
                  Silakan masuk menggunakan akun Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@perusahaan.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-xs underline-offset-2 hover:underline text-zinc-500"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={cn(
                        "pr-10",
                        errors.password ? "border-red-500" : "",
                      )}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-500"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"}
                      </span>
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Memverifikasi..." : "Masuk"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">
                      Atau
                    </span>
                  </div>
                </div>

                <ButtonGroup className="w-full grid grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("google")}
                    disabled={isLoading}
                  >
                    <Image
                      src="/icons/icon-google.svg"
                      alt="Google"
                      width={20}
                      height={20}
                    />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("microsoft-entra-id")}
                    disabled={isLoading}
                  >
                    <Image
                      src="/icons/icon-microsoft.svg"
                      alt="Microsoft"
                      width={20}
                      height={20}
                    />
                  </Button>
                </ButtonGroup>
              </div>

              <div className="mt-4 text-center text-xs text-zinc-500">
                Silakan masukkan kredensial Anda yang telah terdaftar.
              </div>
            </div>
          </form>

          <div className="relative hidden bg-zinc-950 md:block h-full w-full">
            <Image
              src="/images/light-login.jpg"
              alt="Telis Authentication"
              fill
              className="object-cover dark:hidden"
              priority
            />
            <Image
              src="/images/dark-login.jpg"
              alt="Telis Authentication"
              fill
              className="object-cover hidden dark:block"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-zinc-500 px-6">
        Dengan masuk, Anda menyetujui{" "}
        <a
          href="#"
          className="underline hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          Ketentuan Layanan
        </a>{" "}
        dan{" "}
        <a
          href="#"
          className="underline hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          Kebijakan Privasi
        </a>{" "}
        kami.
      </div>
    </div>
  );
}
