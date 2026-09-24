import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { CashFlowChart } from "./CashFlowChart";
import { showcaseTabs, transactions } from "../data/home-content";
import { AppWindow } from "./AppWindow";
import { Reveal } from "../../../shared/ui/Reveal";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import { Stagger, StaggerItem } from "../../../shared/ui/Stagger";

export function ProductShowcase() {
   const [activeTab, setActiveTab] = useState<(typeof showcaseTabs)[number]>("Dashboard");
   const prefersReducedMotion = useReducedMotion();

   return (
      <section className="section relative section-lazy" id="product">
         <div className="pointer-events-none absolute inset-0 -z-10 bg-[var(--wash)] border-y border-glass-border-subtle backdrop-blur-[1px]" />

         <div className="container-page">
            <Reveal>
               <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  <SectionHeader
                     eyebrow="Built for Daily Use"
                     title="A product, not a prototype"
                     description="Every screen in Finance-OS is meticulously crafted to be lived in daily."
                  />
                  <div
                     className="inline-flex items-center gap-1 self-start rounded-full border border-glass-border bg-glass-bg p-1 backdrop-blur-xl shadow-[var(--shadow-chip)] sm:self-auto"
                     role="tablist"
                     aria-label="Product previews"
                  >
                     {showcaseTabs.map((tab) => (
                        <button
                           className={`relative inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                              activeTab === tab
                                 ? "text-white"
                                 : "text-text-secondary hover:text-text-primary"
                           }`}
                           key={tab}
                           type="button"
                           role="tab"
                           aria-selected={activeTab === tab}
                           onClick={() => setActiveTab(tab)}
                        >
                           {activeTab === tab && (
                              <motion.span
                                 layoutId="product-tab-pill"
                                 className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-soft shadow-[0_4px_12px_var(--accent-glow)]"
                                 transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 32,
                                    mass: 0.9,
                                 }}
                              />
                           )}
                           <span className="relative">{tab}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <AppWindow
                  className="stack"
                  url={`finance-os.app / ${activeTab.toLowerCase()}`}
                  barRight={
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />{" "}
                        Preview
                     </span>
                  }
               >
                  <div className="min-h-[360px] p-3 sm:p-4">
                     <AnimatePresence mode="wait">
                        <motion.div
                           key={activeTab}
                           initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                           animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                           exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                           transition={{
                              duration: prefersReducedMotion ? 0 : 0.2,
                              ease: "easeOut",
                           }}
                        >
                           {activeTab === "Dashboard" && (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.45fr_1fr]">
                                 <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-5 backdrop-blur-xl shadow-[var(--shadow-chip)]">
                                    <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                                    <div className="relative">
                                       <div className="flex items-center justify-between">
                                          <span className="stat-label">Monthly Overview</span>
                                          <span className="inline-flex items-center gap-1 rounded-full bg-gain-bg px-2 py-1 text-xs font-semibold text-gain">
                                             <TrendingUp size={12} /> +14.2%
                                          </span>
                                       </div>
                                       <p className="stat-value mt-2">₹2,03,527</p>
                                       <div className="mt-6 flex h-[120px] items-end gap-2">
                                          {[45, 62, 50, 78, 68, 90, 100].map((h, i) => (
                                             <div
                                                key={i}
                                                className="group flex h-full flex-1 flex-col justify-end"
                                             >
                                                <div
                                                   className={`w-full rounded-t-xl transition-all duration-300 ${i === 6 ? "bg-gradient-to-t from-accent to-accent-soft shadow-[0_4px_12px_var(--accent-glow)]" : "bg-accent/12 group-hover:bg-accent/22"}`}
                                                   style={{ height: `${h}%` }}
                                                />
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-5 backdrop-blur-xl shadow-[var(--shadow-chip)]">
                                    <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                                    <div className="relative">
                                       <span className="stat-label">Spending Categories</span>
                                       <p className="stat-value mt-2">₹25,108</p>
                                       <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-glass-bg p-0.5 shadow-inner">
                                          <div
                                             className="rounded-full bg-gradient-to-r from-accent to-accent-soft"
                                             style={{ width: "58%" }}
                                          />
                                          <div
                                             className="ml-0.5 rounded-full bg-emerald-400"
                                             style={{ width: "24%" }}
                                          />
                                          <div
                                             className="ml-0.5 rounded-full bg-text-faint"
                                             style={{ width: "18%" }}
                                          />
                                       </div>
                                    </div>
                                    <div className="relative mt-5 space-y-2.5 border-t border-glass-border-subtle pt-4 text-xs">
                                       <div className="flex justify-between">
                                          <span className="flex items-center gap-1.5 text-text-secondary">
                                             <span className="h-2 w-2 rounded-full bg-accent" />{" "}
                                             Needs
                                          </span>
                                          <span className="font-semibold text-text-primary">
                                             58%
                                          </span>
                                       </div>
                                       <div className="flex justify-between">
                                          <span className="flex items-center gap-1.5 text-text-secondary">
                                             <span className="h-2 w-2 rounded-full bg-emerald-400" />{" "}
                                             Wants
                                          </span>
                                          <span className="font-semibold text-text-primary">
                                             24%
                                          </span>
                                       </div>
                                       <div className="flex justify-between">
                                          <span className="flex items-center gap-1.5 text-text-secondary">
                                             <span className="h-2 w-2 rounded-full bg-text-faint" />{" "}
                                             Savings
                                          </span>
                                          <span className="font-semibold text-text-primary">
                                             18%
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {activeTab === "Transactions" && (
                              <div className="rounded-2xl border border-glass-border bg-glass-bg-strong p-2 backdrop-blur-xl shadow-[var(--shadow-chip)] sm:p-3">
                                 <Stagger className="divide-y divide-glass-border-subtle">
                                    {transactions.map(([name, category, amount]) => (
                                       <StaggerItem key={name}>
                                          <div className="flex items-center justify-between rounded-xl px-3 py-3.5 transition-colors duration-150 hover:bg-glass-bg">
                                             <div className="flex items-center gap-3">
                                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-glass-border bg-inverse-surface text-xs font-bold text-accent shadow-[var(--shadow-chip)]">
                                                   {name[0]}
                                                </span>
                                                <div>
                                                   <p className="text-sm font-semibold tracking-tight text-text-primary">
                                                      {name}
                                                   </p>
                                                   <p className="mt-0.5 text-xs text-text-muted">
                                                      {category}
                                                   </p>
                                                </div>
                                             </div>
                                             <span
                                                className={`rounded-full px-2.5 py-1 text-sm font-bold ${amount.startsWith("+") ? "bg-gain-bg text-gain" : "bg-glass-bg text-text-primary border border-glass-border"}`}
                                             >
                                                {amount}
                                             </span>
                                          </div>
                                       </StaggerItem>
                                    ))}
                                 </Stagger>
                              </div>
                           )}

                           {activeTab === "Analytics" && (
                              <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg-strong p-5 backdrop-blur-xl shadow-[var(--shadow-chip)]">
                                 <div className="pointer-events-none absolute inset-0 bg-[var(--sheen)]" />
                                 <div className="relative">
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <span className="stat-label">Net Worth Growth</span>
                                          <p className="mt-1.5 flex items-baseline gap-2">
                                             <span className="text-2xl font-bold tracking-tight text-gain">
                                                +12.8%
                                             </span>
                                             <span className="text-xs text-text-muted">
                                                vs last year
                                             </span>
                                          </p>
                                       </div>
                                       <span className="inline-flex items-center gap-1 rounded-full bg-gain-bg px-2.5 py-1 text-xs font-semibold text-gain">
                                          <ArrowUpRight size={13} /> On track
                                       </span>
                                    </div>
                                    <CashFlowChart />
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     </AnimatePresence>
                  </div>
               </AppWindow>
            </Reveal>
         </div>
      </section>
   );
}
