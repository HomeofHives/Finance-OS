import { Button } from "@finance-os/ui";

export function HomePage() {
   return (
      <main className="min-h-screen p-8">
         <h1 className="text-3xl font-bold">Finance-OS</h1>

         <p className="mt-2 text-muted-foreground">
            Your financial operating system.
         </p>

         <Button className="mt-6">
            Get Started
         </Button>
      </main>
   );
}
