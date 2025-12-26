import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Alexander.AI",
  description:
    "Get in touch with Alexander.AI team. We'd love to hear from you.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
