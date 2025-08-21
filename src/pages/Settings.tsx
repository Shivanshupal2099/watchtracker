import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-900 p-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <div className="max-w-xl mx-auto space-y-8">
        {/* General Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">General</h2>
          <ul className="space-y-2">
            <li>Notifications</li>
            <li>Focus Mode</li>
            <li>Shortcuts</li>
            <li>Backup & Sync</li>
            <li>Data</li>
            <li>Privacy</li>
          </ul>
        </section>
        {/* Theme Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Theme</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                !darkMode
                  ? "bg-blue-100 text-blue-900 border-blue-400"
                  : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-blue-50"
              }`}
            >
              <Sun className="w-5 h-5" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                darkMode
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Moon className="w-5 h-5" />
              Dark
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}