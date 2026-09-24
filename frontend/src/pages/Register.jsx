import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiError } from "@/lib/apiClient";
import { useAuth, homeFor } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Brand from "@/components/Brand";
import SocialLinks from "@/components/SocialLinks";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", business_name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.access_token, data.user);
      toast.success("Akun UMKM berhasil dibuat! Uji coba 14 hari dimulai.");
      navigate(homeFor(data.user.role));
    } catch (err) {
      setError(apiError(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-secondary text-white p-12">
        <Link to="/"><Brand light /></Link>
        <div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight leading-tight">Mulai kelola usaha Anda hari ini.</h2>
          <p className="text-white/60 mt-4 max-w-md">Daftar gratis dan nikmati semua fitur selama 14 hari tanpa biaya.</p>
        </div>
        <div className="space-y-3">
          <SocialLinks className="text-white/70" linkClass="hover:text-white" />
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} UMKM go digital</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-secondary">Daftar UMKM</h1>
          <p className="text-muted-foreground mt-2">Buat akun pemilik usaha Anda.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama Usaha</Label>
              <Input id="business_name" value={form.business_name} onChange={set("business_name")} required placeholder="Toko Berkah Jaya" data-testid="reg-business" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pemilik</Label>
              <Input id="name" value={form.name} onChange={set("name")} required placeholder="Budi Santoso" data-testid="reg-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} required placeholder="nama@email.com" data-testid="reg-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="0812..." data-testid="reg-phone" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={set("password")} required placeholder="Minimal 6 karakter" data-testid="reg-password" />
            </div>
            {error && <p className="text-sm text-destructive" data-testid="reg-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy} data-testid="reg-submit">
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Daftar & Mulai Gratis
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
