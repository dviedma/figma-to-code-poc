import Nav from "@/components/Nav/Nav";
import Hero from "@/components/Hero/Hero";
import FeatureCards from "@/components/FeatureCards/FeatureCards";
import CtaBanner from "@/components/CtaBanner/CtaBanner";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FeatureCards />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
