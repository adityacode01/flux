import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        {children}
      </div>
    </main>
  );
}
