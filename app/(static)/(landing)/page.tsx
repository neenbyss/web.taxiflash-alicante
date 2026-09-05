import { Faq } from "./faq.section"
import { Hero } from "./hero.section"
import { Info } from "./info.section"
import { Services } from "./service.section"
import { Testimonials } from "./testimonials.section"
import { LocalBusinessJsonLd } from "@/components/seo/local-business-json-ld"

export default function Home() {
  return (
    <main className="w-full min-w-0 space-y-5 overflow-x-clip p-1 lg:p-2">
      <LocalBusinessJsonLd />
      <h1 className="sr-only"> Bienvenidos A TaxiFlash Alicante</h1>
      <Hero />
      <Services />
      <Info />
      <Testimonials />
      <Faq />
    </main>
  )
}
