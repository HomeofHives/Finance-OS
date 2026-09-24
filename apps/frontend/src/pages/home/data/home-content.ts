import type { LucideIcon } from "lucide-react";
import { BarChart3, ShieldCheck, Target, Wallet } from "lucide-react";

export const navigationLinks = ["Product", "Features", "Security", "Docs"];
export const showcaseTabs = ["Dashboard", "Transactions", "Analytics"] as const;

export const capabilities: ReadonlyArray<{
   number: string;
   title: string;
   description: string;
   icon: LucideIcon;
}> = [
   {
      number: "01",
      title: "Unified finances",
      description:
         "Connect every bank account, wallet, and investment in one secure, real-time view.",
      icon: Wallet,
   },
   {
      number: "02",
      title: "Smart analytics",
      description: "Understand where your money actually goes with deep categorization and trends.",
      icon: BarChart3,
   },
   {
      number: "03",
      title: "Account management",
      description: "Manage dynamic budgets, saving goals, and cash flow effortlessly.",
      icon: Target,
   },
   {
      number: "04",
      title: "Financial insights",
      description: "Receive crystal-clear actionable signals, completely free from noisy alerts.",
      icon: ShieldCheck,
   },
];

export const workflowSteps = [
   {
      number: "01",
      title: "Connect securely",
      copy: "Designed to link your accounts in minutes — security-first engineering, no paperwork.",
   },
   {
      number: "02",
      title: "Gain clarity",
      copy: "Instantly see a consolidated picture of income, expenses, net worth, and spending trends.",
   },
   {
      number: "03",
      title: "Take control",
      copy: "Set smart budgets and automated savings goals, and watch your wealth grow over time.",
   },
];

export const securityItems = [
   {
      title: "Encryption-first design",
      copy: "Planned end-to-end encryption for protecting financial data in transit and at rest.",
      icon: "lock",
   },
   {
      title: "Open source",
      copy: "The entire codebase is public and open to community review — proof over promises.",
      icon: "shield",
   },
   {
      title: "Self-hostable",
      copy: "Designed to run on your own infrastructure, so your data stays yours.",
      icon: "git",
   },
] as const;

export const transactions = [
   ["Swiggy Gourmet", "Food & dining", "−₹842"],
   ["Salary Credit", "HDFC Bank", "+₹1,85,000"],
   ["Netflix Premium", "Subscriptions", "−₹649"],
   ["Myntra Lifestyle", "Shopping", "−₹2,199"],
] as const;
