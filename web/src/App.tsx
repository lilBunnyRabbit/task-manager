import { ThemeProvider } from "./contexts/theme.context";
import AppRoutes from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
