import { Outlet, useLocation, NavLink } from "react-router-dom";
import { Map, LayoutDashboard, Trophy } from "lucide-react";

export default function AppLayout() {
  const { pathname } = useLocation();

  const navItems = [
    { title: "City Map", url: "/", icon: Map },
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Badges", url: "/badges", icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top nav buttons */}
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card/90 backdrop-blur rounded-2xl px-3 py-2 shadow-lg border border-border">
        {navItems.map((item) => {
          const active = pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-display font-bold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      <main className="flex-1 pt-14">
        <Outlet />
      </main>
    </div>
  );
}

