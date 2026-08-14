import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AppProviders } from "./providers";

export default function App() {
   return (
      <AppProviders>
         <RouterProvider router={router} />
      </AppProviders>
   );
}
