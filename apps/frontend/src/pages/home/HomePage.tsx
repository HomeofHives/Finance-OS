import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { TrustStatement } from "./components/TrustStatement";
import { CapabilitiesSection } from "./components/CapabilitiesSection";
import { ProductShowcase } from "./components/ProductShowcase";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { SecuritySection } from "./components/SecuritySection";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

export function HomePage() {
   return (
      <div className="min-h-screen overflow-x-clip font-sans text-text-primary antialiased">
         <Navbar />
         <main>
            <HeroSection />
            <TrustStatement />
            <CapabilitiesSection />
            <ProductShowcase />
            <HowItWorksSection />
            <SecuritySection />
            <FinalCTA />
         </main>
         <Footer />
      </div>
   );
}
