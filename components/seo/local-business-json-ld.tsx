export function LocalBusinessJsonLd() {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"
  const data = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: "TaxiFlash",
    url: origin,
    image: `${origin}/images/hero_bg.webp`,
    telephone: "+34631288429",
    email: "support@taxiflash.com",
    areaServed: [
      { "@type": "City", name: "Alicante" },
      {
        "@type": "Airport",
        name: "Aeropuerto de Alicante-Elche Miguel Hernández",
      },
    ],
    availableLanguage: ["es"],
    priceRange: "€€",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
