import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui/menubar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    return stored || "system";
  });
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    root.classList.remove("light", "dark");
    const effectiveTheme = theme === "system" ? systemTheme : theme;
    root.classList.add(effectiveTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Add system theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const NavLinks = () => (
    <>
      <Link 
        to="/new" 
        className={`hover:text-primary transition-colors ${location.pathname === '/new' ? 'text-primary font-medium' : ''}`}
      >
        Research Table
      </Link>
      {/* <Link 
        to="/related-developers-scraper" 
        className={`hover:text-primary transition-colors ${location.pathname === '/related-developers-scraper' ? 'text-primary font-medium' : ''}`}
      >
        Related Developers
      </Link>
      <Link 
        to="/contributors-scraper" 
        className={`hover:text-primary transition-colors ${location.pathname === '/contributors-scraper' ? 'text-primary font-medium' : ''}`}
      >
        Repository Contributors
      </Link> */}
      <Link 
        to="/blog" 
        className={`hover:text-primary transition-colors ${location.pathname === '/blog' || location.pathname.startsWith('/blog/') ? 'text-primary font-medium' : ''}`}
      >
        Blog
      </Link>
      {isAuthenticated && (
        <>
          <Link 
            to="/settings" 
            className={`hover:text-primary transition-colors ${location.pathname === '/settings' ? 'text-primary font-medium' : ''}`}
          >
            Settings
          </Link>
          <a 
            href="mailto:wallawitsch@gmail.com?subject=Feedback%2FFeature%20Request"
            className="hover:text-primary transition-colors"
            target="_blank"
          >
            Request Feature
          </a>
        </>
      )}
    </>
  );

  return (
    <div className="fixed top-0 left-0 right-0 border-b bg-background z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold flex items-center gap-3">
        <div>🔎  </div>
        Deep Table
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex text-muted-foreground items-center space-x-6">
          <NavLinks />
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Sun className="h-4 w-4" />}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </MenubarItem>
                <MenubarItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </MenubarItem>
                <MenubarItem onClick={() => setTheme("system")}>
                  <span>System</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          <Menubar className="border-none">
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Sun className="h-4 w-4" />}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </MenubarItem>
                <MenubarItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </MenubarItem>
                <MenubarItem onClick={() => setTheme("system")}>
                  <span>System</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
} 