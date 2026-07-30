import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

async function getBaseUrl() {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? "https";
  return new URL(host ? `${protocol}://${host}` : "http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await getBaseUrl();
  return {
    metadataBase,
    title: {
      default: "Muhammadsahal Saiyed — AI/ML Engineer",
      template: "%s · Muhammadsahal Saiyed",
    },
    description:
      "AI/ML Engineer based in Ahmedabad building RAG systems, AI agents, multimodal applications, machine-learning products, and full-stack intelligent systems.",
    keywords: [
      "Muhammadsahal Saiyed",
      "AI Engineer",
      "ML Engineer",
      "RAG",
      "Agentic AI",
      "Machine Learning",
      "Ahmedabad",
    ],
    authors: [{ name: "Muhammadsahal Saiyed" }],
    creator: "Muhammadsahal Saiyed",
    openGraph: {
      type: "website",
      locale: "en_IN",
      title: "Muhammadsahal Saiyed — AI/ML Engineer",
      description:
        "Applied AI, RAG, agents, multimodal systems, and machine learning—built into real products.",
      siteName: "Muhammadsahal Saiyed",
      images: [
        {
          url: "/og.png",
          width: 1731,
          height: 909,
          alt: "Muhammadsahal Saiyed — AI/ML Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Muhammadsahal Saiyed — AI/ML Engineer",
      description:
        "Applied AI, RAG, agents, multimodal systems, and machine learning—built into real products.",
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = (await getBaseUrl()).toString();
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhammadsahal Saiyed",
    jobTitle: "AI/ML Engineer",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressCountry: "IN",
    },
    url: siteUrl,
    sameAs: [
      "https://github.com/Sahal-Saiyed",
      "https://www.linkedin.com/in/sahal-saiyed",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Retrieval-Augmented Generation",
      "Agentic AI",
      "Multimodal AI",
      "Data Science",
    ],
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
