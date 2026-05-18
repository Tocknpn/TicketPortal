import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
