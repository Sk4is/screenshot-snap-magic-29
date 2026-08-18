import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SkyyFizzExperience = lazy(() => import("@/components/SkyyFizzExperience"));

const title = "SKYY FIZZ — 3D Flavor Experience";
const description =
  "Explore SKYY FIZZ sparkling flavors in an interactive 3D carousel: drag, select a can, and scroll through its story.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-studio">
      <h1 className="sr-only">SKYY FIZZ — 3D Flavor Experience</h1>
      <ClientOnly fallback={<div className="min-h-screen bg-studio" />}>
        <Suspense fallback={<div className="min-h-screen bg-studio" />}>
          <SkyyFizzExperience />
        </Suspense>
      </ClientOnly>
    </main>
  );
}
