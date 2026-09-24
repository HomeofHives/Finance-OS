import { capabilities } from "../data/home-content";
import { FeatureCard } from "./FeatureCard";
import { Reveal } from "../../../shared/ui/Reveal";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import { Stagger, StaggerItem } from "../../../shared/ui/Stagger";

export function CapabilitiesSection() {
   return (
      <section className="section section-lazy" id="features">
         <div className="container-page">
            <Reveal>
               <SectionHeader
                  eyebrow="The Foundation"
                  title="Everything your money needs"
                  description="Powerful, private, and beautifully simple — the complete toolkit to understand, manage, and grow your wealth."
               />
               <Stagger className="stack grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {capabilities.map(({ number, title, description, icon }) => (
                     <StaggerItem className="h-full" key={number}>
                        <FeatureCard
                           icon={icon}
                           number={number}
                           title={title}
                           description={description}
                        />
                     </StaggerItem>
                  ))}
               </Stagger>
            </Reveal>
         </div>
      </section>
   );
}
