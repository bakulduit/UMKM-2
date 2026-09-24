import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Brand from "@/components/Brand";
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileBarChart, Store,
  UserCog, CreditCard, Settings, LogOut, Menu, X, Building2, BadgeCheck, ScrollText, Truck,
} from "lucide-react";

const NAV = {
  super_admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/umkm", icon: Building2, label: "Kelola UMKM" },
    { to: "/admin/payments", icon: BadgeCheck, label: "Pembayaran" },
    { to: "/admin/settings", icon: Settings, label: "Pengaturan" },
  ],
  umkm_admin: [
    { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/app/pos", icon: ShoppingCart, label: "Kasir (POS)" },
    { to: "/app/products", icon: Package, label: "Produk" },
    { to: "/app/purchases", icon: Truck, label: "Pembelian & Supplier" },
    { to: "/app/customers", icon: Users, label: "Pelanggan & Kasbon" },
    { to: "/app/reports", icon: FileBarChart, label: "Laporan" },
    { to: "/app/history", icon: ScrollText, label: "Riwayat Transaksi" },
    { to: "/app/outlets", icon: Store, label: "Outlet" },
    { to: "/app/cashiers", icon: UserCog, label: "Akun Kasir" },
    { to: "/app/subscription", icon: CreditCard, label: "Langganan" },
    { to: "/app/settings", icon: Settings, label: "Pengaturan Toko" },
  ],
  cashier: [
    { to: "/app/pos", icon: ShoppingCart, label: "Kasir (POS)" },
    { to: "/app/customers", icon: Users, label: "Pelanggan & Kasbon" },
    { to: "/app/history", icon: ScrollText, label: "Riwayat Saya" },
  ],
};

const ROLE_LABEL = { super_admin: "Super Admin", umkm_admin: "Pemilik UMKM", cashier: "Kasir" };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV[user?.role] || [];

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 bg-secondary text-white flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <Brand imgClass="h-10" />
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setOpen(false)}
              data-testid={`nav-${it.to.replace(/\//g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive ? "bg-primary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <it.icon className="h-[18px] w-[18px]" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-white/50">{ROLE_LABEL[user?.role]}</div>
            </div>
          </div>
          <button
            onClick={doLogout}
            data-testid="logout-btn"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" /> Keluar
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-white/70 backdrop-blur-xl border-b flex items-center gap-4 px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} data-testid="menu-btn">
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-sm text-muted-foreground">
            {user?.umkm?.name || (user?.role === "super_admin" ? "Panel Platform" : "")}
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user?.subscription && (
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  user.subscription.status === "expired"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {user.subscription.status === "trial"
                  ? "Masa Uji Coba"
                  : user.subscription.status === "active"
                  ? "Langganan Aktif"
                  : "Langganan Berakhir"}
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-[1500px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
