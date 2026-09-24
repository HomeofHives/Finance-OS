import { cn } from "@finance-os/ui";

interface SectionHeaderProps {
   eyebrow: string;
   title: string;
   description?: string;
   align?: "start" | "center";
   className?: string;
}

export function SectionHeader({
   eyebrow,
   title,
   description,
   align = "start",
   className,
}: SectionHeaderProps) {
   return (
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
         <span className="eyebrow-pill">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
            {eyebrow}
         </span>
         <h2 className="section-title mt-5">{title}</h2>
         {description ? (
            <p className="section-description mt-3.5 max-w-[52ch] text-pretty">{description}</p>
         ) : null}
      </div>
   );
}
