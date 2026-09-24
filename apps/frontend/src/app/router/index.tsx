import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { HomePage } from "../../pages/home/HomePage";

const rootRoute = createRootRoute();

const homeRoute = createRoute({
   getParentRoute: () => rootRoute,
   path: "/",
   component: HomePage,
});

const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({
   routeTree,
});
