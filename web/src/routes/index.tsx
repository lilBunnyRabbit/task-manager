import { Route, Routes } from "react-router";
import { lazy, Suspense } from "react";

import { AppLayout } from "./app.layout";
import LandingPageRoute from "./landing-page.route";
import { LoadingOverlay } from "@/components/loading-overlay";

const ExamplesRoute = lazy(() => import("./examples.route"));
const ChangelogRoute = lazy(() => import("./changelog.route"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPageRoute />} />
          <Route path="examples" element={<ExamplesRoute />} />
          <Route path="changelog" element={<ChangelogRoute />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
