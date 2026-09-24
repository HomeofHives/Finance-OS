import { workflowSteps } from "../data/home-content";
import { FeatureCard } from "./FeatureCard";
import { Reveal } from "../../../shared/ui/Reveal";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import { Stagger, StaggerItem } from "../../../shared/ui/Stagger";

export function HowItWorksSection() {
   return (
      <section className="section relative section-lazy">
         {/* connector line behind cards — desktop only */}
         <div className="pointer-events-none absolute left-[calc(50%-36rem)] right-[calc(50%-36rem)] top-[58%] hidden h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent lg:block" />

         <div className="container-page relative">
            <Reveal>
               <SectionHeader
                  eyebrow="A Clearer Path"
                  title="How Finance-OS works"
                  description="Get up and running in minutes with a simple, friction-free setup process."
               />
               <Stagger className="stack relative grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {workflowSteps.map(({ number, title, copy }) => (
                     <StaggerItem className="h-full" key={number}>
                        <FeatureCard number={number} title={title} description={copy} />
                     </StaggerItem>
                  ))}
               </Stagger>
            </Reveal>
         </div>
      </section>
   );
}
