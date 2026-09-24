import { Reveal } from "../../../shared/ui/Reveal";

export function TrustStatement() {
   return (
      <section className="section-compact section-lazy">
         <div className="container-page">
            <Reveal>
               <div className="relative overflow-hidden rounded-[20px] border border-glass-border bg-glass-bg-subtle px-6 py-5 backdrop-blur-xl shadow-[var(--shadow-chip)] sm:px-8">
                  <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                  <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
                     <p className="text-sm font-medium tracking-tight text-text-secondary">
                        Open source,{" "}
                        <span className="font-bold text-text-primary">self-hostable</span>, and{" "}
                        <span className="font-bold text-text-primary">secure by design</span>.
                     </p>
                     <span className="hidden h-4 w-px bg-border sm:block" />
                     <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        Security-first roadmap
                     </div>
                  </div>
               </div>
            </Reveal>
         </div>
      </section>
   );
}
