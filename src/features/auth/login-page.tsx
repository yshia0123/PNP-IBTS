"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/stores/toast-store";
import { useLogin } from "./hooks";

/**
 * LoginPage (SSOT Section 1.4 — mock auth). Validated with React Hook Form +
 * Zod; authenticates against the /api/session/login route (Supabase-backed)
 * and redirects to the dashboard on success. Errors show inline.
 */
const schema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: (user) => {
        toast.success("Signed in", `Welcome, ${user.name}.`);
        router.replace("/");
      },
      // Error is shown inline below the form (the Toaster isn't mounted on the
      // login screen, which lives outside the app shell).
    });
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      {/* Blurred PNP background image */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
        style={{ backgroundImage: "url(/pnp-login-bg.jpg)" }}
        aria-hidden
      />
      {/* Dark overlay for contrast/readability */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(11, 29, 58, 0.62)" }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/pnp-logo.png"
            alt="PNP logo"
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-contain"
          />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white drop-shadow">
            PNP IBTS
          </h1>
          <p className="text-sm text-white/80 drop-shadow">
            Integrated Benefits Tracking System
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                {...register("email")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            {login.isError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{(login.error as Error).message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <details className="mt-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">
              Demo accounts
            </summary>
            <ul className="mt-2 space-y-1">
              <li>Admin — j.reyes@ibts.local / admin123</li>
              <li>HR Manager — a.cruz@ibts.local / hr123</li>
              <li>Officer — s.bautista@ibts.local / officer123</li>
              <li>Officer — r.lingayo@ibts.local / officer123</li>
              <li>Retiree — r.domingo@ibts.local / retiree123</li>
              <li>Dependent — m.cruz@ibts.local / dependent123</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
