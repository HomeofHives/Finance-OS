import { Button } from "@finance-os/ui";


function App() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4">

      <Button>
        Primary
      </Button>

      <Button variant="secondary">
        Secondary
      </Button>

      <Button variant="outline">
        Outline
      </Button>

      <Button variant="destructive">
        Delete
      </Button>

    </main>
  );
}


export default App;
