import { Route, Routes } from "react-router";

import { AppLayout } from "./app.layout";
import ChangelogRoute from "./changelog.route";
import ExamplesRoute from "./examples.route";
import LandingPageRoute from "./landing-page.route";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPageRoute />} />
        <Route path="examples" element={<ExamplesRoute />} />
        <Route path="changelog" element={<ChangelogRoute />} />
      </Route>
    </Routes>
  );
}
