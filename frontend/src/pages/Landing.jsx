import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Brand from "@/components/Brand";
import {
  ShoppingCart, QrCode, BellRing, BarChart3, ShieldCheck,
  Package, Users, ArrowRight, Check, Store, FileSpreadsheet, Mail,
} from "lucide-react";

const PAY = "https://images.pexels.com/photos/12935051/pexels-photo-12935051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const SLIDES = [
  { url: "https://images.pexels.com/photos/33633752/pexels-photo-33633752.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000", cap: "Warung tradisional & pelanggan" },
  { url: "https://images.pexels.com/photos/37651990/pexels-photo-37651990.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000", cap: "Kios jajanan UMKM" },
  { url: "https://images.pexels.com/photos/18396499/pexels-photo-18396499.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000", cap: "Transaksi di lapak pasar" },
];

const CARD_TONES = [
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-700",
  "bg-sky-100 text-sky-700",
  "bg-orange-100 text-orange-600",
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
];

const features = [
  { icon: ShoppingCart, title: "Kasir Cepat (POS)", desc: "Catat penjualan, hitung kembalian, dan pilih metode pembayaran dalam hitungan detik." },
  { icon: QrCode, title: "Pembayaran QRIS", desc: "Tempel QRIS toko Anda. Pelanggan scan, kasir konfirmasi, transaksi tercatat." },
  { icon: BellRing, title: "Notifikasi Suara", desc: "Dengar 'uang masuk' otomatis setiap pembayaran diterima — tanpa perlu menatap layar." },
  { icon: BarChart3, title: "Dashboard Keuangan", desc: "Pemasukan, pengeluaran, laba, dan produk terlaris dalam satu tampilan." },
  { icon: Package, title: "Stok & Produk", desc: "Kelola produk lengkap dengan peringatan stok menipis otomatis." },
  { icon: Users, title: "Kasbon Pelanggan", desc: "Catat utang/piutang pelanggan dan pantau pelunasannya dengan rapi." },
  { icon: FileSpreadsheet, title: "Laporan Resmi", desc: "Laba-rugi & arus kas siap ekspor PDF/Excel untuk lembaga keuangan." },
  { icon: Store, title: "Multi-Outlet", desc: "Kelola beberapa cabang dan banyak akun kasir dari satu pemilik." },
];

function Logo() {
  return (
    <Link to="/" aria-label="Kembali ke beranda" className="inline-flex items-center">
      <Brand />
    </Link>
  );
}

function HeroSlideshow() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative">
      <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-1 aspect-[4/3]">
        {SLIDES.map((s, idx) => (
          <img
            key={idx}
            src={s.url}
            alt={s.cap}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              data-testid={`hero-slide-${idx}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white" : "w-2 bg-white/60"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 bg-white rounded-2xl shadow-xl border p-4 w-56 -rotate-2 hidden sm:block z-10">
        <div className="flex items-center gap-2 text-primary">
          <BellRing className="h-5 w-5" />
          <span className="font-heading font-bold">Uang Masuk!</span>
        </div>
        <div className="text-2xl font-heading font-extrabold mt-1 tabular text-secondary">Rp 20.000</div>
        <div className="text-xs text-muted-foreground">via QRIS · barusan</div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-secondary">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" data-testid="nav-login">Masuk</Button></Link>
            <Link to="/register"><Button data-testid="nav-register">Coba Gratis</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center relative">
        <div className="animate-fade-up">
          <span className="overline text-primary">Aplikasi Keuangan UMKM Indonesia</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mt-4">
            Kelola kasir & keuangan usaha, <span className="text-primary">mudah dan praktis.</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-6 leading-relaxed max-w-lg">
            Satu aplikasi untuk mencatat pemasukan-pengeluaran, terima pembayaran QRIS dengan notifikasi suara, dan laporan keuangan yang bisa dipertanggungjawabkan.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register"><Button size="lg" className="rounded-full" data-testid="hero-register">
              Mulai Uji Coba 14 Hari <ArrowRight className="h-4 w-4 ml-2" />
            </Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="rounded-full" data-testid="hero-login">Sudah punya akun</Button></Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tanpa kartu kredit</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Data aman</span>
          </div>
        </div>
        <HeroSlideshow />
        </div>
      </section>

      {/* Features bento */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <span className="overline text-primary">Fitur Lengkap</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Semua kebutuhan keuangan UMKM, dalam satu genggaman
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
              <div className={`h-11 w-11 rounded-xl grid place-items-center ${CARD_TONES[i % CARD_TONES.length]}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg mt-4">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
          <img src={PAY} alt="Pembayaran QRIS" className="w-full h-[380px] object-cover" />
        </div>
        <div>
          <span className="overline text-primary">Cara Kerja</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">Bayar langganan lewat QRIS, langsung aktif</h2>
          <ol className="mt-8 space-y-5">
            {["Daftar & nikmati uji coba 14 hari gratis.", "Perpanjang dengan scan QRIS kami dan unggah bukti bayar.", "Tempel QRIS toko Anda untuk menerima pembayaran pelanggan.", "Dengar notifikasi suara setiap uang masuk."].map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-white grid place-items-center font-bold shrink-0">{i + 1}</div>
                <p className="text-muted-foreground pt-1">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-secondary text-white p-10 lg:p-16 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Siap membuat usaha Anda lebih tertata?</h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">Ribuan UMKM mulai dari sini. Gratis 14 hari, tanpa risiko.</p>
          <Link to="/register"><Button size="lg" className="rounded-full mt-8" data-testid="cta-register">Daftar Sekarang <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a href="https://wa.me/6282129078762" target="_blank" rel="noreferrer" data-testid="footer-wa"
               className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors">
              <span className="h-9 w-9 rounded-full bg-green-100 text-green-600 grid place-items-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.25 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.53.06-.24-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.1-.5.11-.11.24-.29.37-.43.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47z" />
                </svg>
              </span>
              0821-2907-8762
            </a>
            <a href="mailto:nashoharizal@gmail.com" data-testid="footer-email"
               className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors">
              <span className="h-9 w-9 rounded-full bg-orange-100 text-orange-600 grid place-items-center"><Mail className="h-4 w-4" /></span>
              nashoharizal@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t py-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} UMKM Go Digital — Aplikasi Keuangan & Kasir untuk UMKM Indonesia.
        </div>
      </footer>
    </div>
  );
}
