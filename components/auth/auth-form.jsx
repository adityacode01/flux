"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode, callbackUrl = "/dashboard" }) {
  const router = useRouter();
  const register = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  // Client checks are for speed only; the server re-validates with Zod.
  function validate() {
    const e = {};
    if (register && !values.name.trim()) e.name = "Enter your name";
    if (!EMAIL.test(values.email)) e.email = "Enter a valid email";
    if (register) {
      if (values.password.length < 8) e.password = "Use at least 8 characters";
      else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) e.password = "Include a letter and a number";
    } else if (!values.password) e.password = "Enter your password";
    return e;
  }

  async function createAccount() {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) return true;

    const body = await res.json().catch(() => null);
    const details = body?.error?.details;
    if (res.status === 409) setErrors({ email: "An account with this email already exists" });
    else if (details && typeof details === "object") setErrors(Object.fromEntries(Object.entries(details).map(([k, v]) => [k, v?.[0]])));
    else setFormError("We couldn't create your account. Please try again.");
    return false;
  }

  async function submit(ev) {
    ev.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      if (register && !(await createAccount())) return;

      const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
      if (!result || result.error) {
        setFormError(register ? "Account created, but sign-in failed. Try logging in." : "Incorrect email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h1 className="font-display text-2xl font-semibold">{register ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-muted">{register ? "Start tracking in a minute." : "Log in to see your dashboard."}</p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {formError && (
          <p role="alert" className="rounded-lg bg-expense/12 px-3 py-2 text-sm text-expense">
            {formError}
          </p>
        )}
        {register && <Field label="Name" error={errors.name}>{(p) => <Input {...p} autoComplete="name" value={values.name} onChange={set("name")} />}</Field>}
        <Field label="Email" error={errors.email}>{(p) => <Input {...p} type="email" autoComplete="email" value={values.email} onChange={set("email")} />}</Field>
        <Field label="Password" error={errors.password} hint={register ? "At least 8 characters, with a letter and a number." : undefined}>
          {(p) => <Input {...p} type="password" autoComplete={register ? "new-password" : "current-password"} value={values.password} onChange={set("password")} />}
        </Field>
        <Button type="submit" variant="primary" className="w-full" loading={loading}>{register ? "Create account" : "Log in"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {register ? "Already have an account? " : "New to Flux? "}
        <Link href={register ? "/login" : "/register"} className="font-medium text-fg underline-offset-4 hover:underline">{register ? "Log in" : "Create an account"}</Link>
      </p>
      {!register && <p className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">Demo account (after seeding): demo@flux.app / Demo@12345</p>}
    </Card>
  );
}
