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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.access_token, data.user);
      toast.success(`Selamat datang, ${data.user.name}`);
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
          <h2 className="font-heading text-4xl font-extrabold tracking-tight leading-tight">Keuangan usaha Anda, terkendali.</h2>
          <p className="text-white/60 mt-4 max-w-md">Masuk untuk mengelola kasir, produk, dan laporan keuangan UMKM Anda.</p>
        </div>
        <div className="space-y-3">
          <SocialLinks className="text-white/70" linkClass="hover:text-white" />
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} UMKM go digital</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="lg:hidden inline-block mb-8"><Brand /></Link>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-secondary">Masuk</h1>
          <p className="text-muted-foreground mt-2">Silakan masuk ke akun Anda.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nama@email.com" data-testid="login-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" data-testid="login-password" />
            </div>
            {error && <p className="text-sm text-destructive" data-testid="login-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy} data-testid="login-submit">
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Masuk
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Daftar UMKM</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
