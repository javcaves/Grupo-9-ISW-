import { NavLink } from "react-router-dom";
import {
  House,
  Clock3,
  ClipboardList,
  History,
} from "lucide-react";

const items = [
  {
    to: "/dashboard",
    label: "Inicio",
    icon: House,
  },
  {
    to: "/asistencia",
    label: "Asistencia",
    icon: Clock3,
  },
  {
    to: "/tareas",
    label: "Tareas",
    icon: ClipboardList,
  },
  {
    to: "/historial",
    label: "Historial",
    icon: History,
  },
];

export default function EmployeeBottomBar() {
  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50

        bg-white/90
        backdrop-blur-xl

        border-t
        border-slate-200/50

        shadow-[0_-10px_40px_rgba(15,23,42,0.08)]

        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-md
          h-[72px]
          px-2
        "
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 items-center justify-center"
            >
              {({ isActive }) => (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    transition-all
                    duration-300
                  "
                >
                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      rounded-xl

                      transition-all
                      duration-300

                      ${
                        isActive
                          ? `
                            bg-gradient-to-br
                            from-violet-600
                            to-blue-500

                            text-white

                            scale-110
                            -translate-y-1

                            shadow-lg
                            shadow-violet-500/30
                          `
                          : `
                            text-slate-500
                          `
                      }
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  <span
                    className={`
                      text-[11px]
                      font-medium
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "text-violet-700"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}