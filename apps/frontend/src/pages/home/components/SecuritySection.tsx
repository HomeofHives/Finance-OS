import {
   Database,
   EyeOff,
   GitBranch,
   LockKeyhole,
   Server,
   ShieldCheck,
   Smartphone,
} from "lucide-react";
import { securityItems } from "../data/home-content";
import { FeatureCard } from "./FeatureCard";
import { Reveal } from "../../../shared/ui/Reveal";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import { Stagger, StaggerItem } from "../../../shared/ui/Stagger";

const securityIcons = { lock: LockKeyhole, shield: ShieldCheck, git: GitBranch } as const;

const architectureLayers = [
   {
      icon: Smartphone,
      label: "Your devices",
      sub: "iOS · Android · Web — on-device key management (planned)",
      status: { label: "Client-first", tone: "border-accent/20 bg-accent/10 text-accent" },
   },
   {
      icon: LockKeyhole,
      label: "Encrypted tunnel",
      sub: "Encrypted transport, mutual auth (planned)",
      status: { label: "Target: TLS 1.3", tone: "border-gain/20 bg-gain-bg text-gain" },
   },
   {
      icon: Server,
      label: "Finance-OS core",
      sub: "Your stack, your rules — Docker or bare metal",
      status: { label: "Self-hostable", tone: "border-gain/20 bg-gain-bg text-gain" },
   },
   {
      icon: Database,
      label: "Your database",
      sub: "Own the rows, own the data",
      status: { label: "Target: AES-256", tone: "border-gain/20 bg-gain-bg text-gain" },
   },
] as const;

const standards = [
   { icon: Database, label: "Target: AES-256 at rest" },
   { icon: LockKeyhole, label: "Target: TLS 1.3 in transit" },
   { icon: EyeOff, label: "Zero-knowledge (planned)" },
   { icon: ShieldCheck, label: "Open to community review" },
];

const stats = [
   { icon: GitBranch, value: "100%", label: "Open Source" },
   { icon: EyeOff, value: "0", label: "Trackers" },
   { icon: LockKeyhole, value: "Planned", label: "E2E Encryption" },
];

export function SecuritySection() {
   return (
      <section className="section relative section-lazy" id="security">
         <div className="pointer-events-none absolute inset-0 -z-10 bg-[var(--wash)] border-y border-glass-border-subtle" />

         <div className="container-page grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal>
               <div>
                  <SectionHeader
                     eyebrow="Security & Architecture"
                     title="Your data belongs to you. Always."
                     description="We believe financial software should be transparent, self-hostable, and completely private."
                  />
                  <Stagger className="stack grid gap-3">
                     {securityItems.map(({ title, copy, icon }) => {
                        const Icon = securityIcons[icon];
                        return (
                           <StaggerItem key={title}>
                              <FeatureCard
                                 variant="row"
                                 icon={Icon}
                                 title={title}
                                 description={copy}
                              />
                           </StaggerItem>
                        );
                     })}
                  </Stagger>

                  <Stagger className="stack-sm flex flex-wrap gap-2">
                     {standards.map(({ icon: Icon, label }) => (
                        <StaggerItem key={label}>
                           <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs font-semibold tracking-tight text-text-secondary shadow-[var(--shadow-chip)] backdrop-blur-xl">
                              <Icon size={13} className="text-accent" />
                              {label}
                           </span>
                        </StaggerItem>
                     ))}
                  </Stagger>
               </div>
            </Reveal>

            <Reveal delay={0.06}>
               <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg px-5 py-5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
                     <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                     <div className="relative">
                        <div className="flex items-center justify-between gap-2">
                           <span className="stat-label">The Data Flow</span>
                           <span className="rounded-full border border-glass-border bg-glass-bg px-2.5 py-0.5 text-[11px] font-semibold text-accent shadow-[var(--shadow-chip)] backdrop-blur-sm">
                              privacy by design
                           </span>
                        </div>

                        <div className="relative mt-5">
                           <div className="flow-rail absolute bottom-4 left-[18px] top-4 -translate-x-1/2 w-px rounded-full bg-gradient-to-b from-accent/30 via-accent/10 to-accent/30" />

                           <Stagger className="space-y-3">
                              {architectureLayers.map(({ icon: Icon, label, sub, status }) => (
                                 <StaggerItem key={label}>
                                    <div className="relative flex items-start gap-3.5">
                                       <span className="relative z-10 mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-glass-border bg-inverse-surface shadow-[var(--shadow-chip)]">
                                          <Icon size={15} className="text-accent" />
                                       </span>
                                       <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass-bg-strong px-3.5 py-3 shadow-[var(--shadow-chip)]">
                                          <div className="min-w-0">
                                             <p className="text-[13px] font-semibold tracking-tight text-text-primary">
                                                {label}
                                             </p>
                                             <p className="mt-0.5 truncate text-[11.5px] text-text-muted">
                                                {sub}
                                             </p>
                                          </div>
                                          <span
                                             className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider ${status.tone}`}
                                          >
                                             {status.label}
                                          </span>
                                       </div>
                                    </div>
                                 </StaggerItem>
                              ))}
                           </Stagger>
                        </div>

                        <p className="mt-5 flex items-start gap-2 rounded-xl border border-accent/15 bg-accent-bg/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-accent-strong">
                           <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                           Planned: your keys stay on your device and Finance-OS core only talks to
                           services you run yourself.
                        </p>
                     </div>
                  </div>

                  <div className="relative grid grid-cols-3 items-center gap-2 rounded-2xl border border-glass-border bg-glass-bg px-4 py-4 shadow-[var(--shadow-chip)] backdrop-blur-xl">
                     {stats.map(({ icon: Icon, value, label }, i) => (
                        <div key={label} className="flex items-center justify-center gap-3">
                           {i > 0 ? (
                              <span className="hidden h-8 w-px bg-glass-border-strong sm:block" />
                           ) : null}
                           <div>
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-bg text-accent">
                                 <Icon size={14} />
                              </span>
                           </div>
                           <div>
                              <p className="text-sm font-bold tracking-tight text-text-primary">
                                 {value}
                              </p>
                              <p className="text-[10px] font-semibold tracking-wide text-text-muted uppercase">
                                 {label}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </Reveal>
         </div>
      </section>
   );
}
