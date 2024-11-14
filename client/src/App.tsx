import "./App.css";
import { ThemeProvider } from "./components/themeProvider";
import ModeToggle from "./components/themeToggle";
import ActiveContests from "./components/ActiveContests";
import { Toaster } from "./components/ui/toaster";
import SessionBlock from "./components/SessionBlock";
import Logger from "./components/Logger";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <main className="flex flex-col gap-4">
          <ModeToggle />
          <SessionBlock />
          <ActiveContests />
          <Logger />

          <Toaster />
        </main>
      </ThemeProvider>
    </>
  );
}

export default App;
