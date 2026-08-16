import { Faq } from "./faq.section";
import { Hero } from "./hero.section";
import { Info } from "./info.section";
import { News } from "./news.section";
import { Services } from "./service.section";
import { Testimonials } from "./testimonials.section";

export default function Home() {
  return (
    <main className="space-y-5 lg:p-2">
      <h1 className="sr-only"> Bienvenidos A TaxiFlash Alicante</h1>
      <Hero />
      <Services />
      <Info />
      <Testimonials />
      <Faq />
      <News />
    </main>
  );
}
