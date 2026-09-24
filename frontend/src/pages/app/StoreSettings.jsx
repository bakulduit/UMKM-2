import { useEffect, useState } from "react";
import { api, apiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, QrCode, Store, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function StoreSettings() {
  const { refresh } = useAuth();
  const [form, setForm] = useState({ business_name: "", address: "", phone: "", qris_image_path: null, logo_image_path: null });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/umkm").then(({ data }) => {
      setForm({ business_name: data.name || "", address: data.address || "", phone: data.phone || "", qris_image_path: data.qris_image_path || null, logo_image_path: data.logo_image_path || null });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/umkm", form);
      toast.success("Pengaturan toko tersimpan");
      refresh();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  if (loading) return <div className="h-48 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Pengaturan Toko" subtitle="Profil usaha & QRIS untuk menerima pembayaran pelanggan" testid="store-settings-header" />

      <Card className="rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-secondary"><Store className="h-5 w-5" /><h3 className="font-heading font-bold text-lg">Profil Usaha</h3></div>
        <div className="space-y-2"><Label>Nama Usaha</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} data-testid="store-name" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>No. HP</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 space-y-5 mt-6">
        <div className="flex items-center gap-2 text-secondary"><ImageIcon className="h-5 w-5" /><h3 className="font-heading font-bold text-lg">Logo Toko</h3></div>
        <p className="text-sm text-muted-foreground">Unggah logo toko Anda. Logo ini akan tampil di struk penjualan dan laporan keuangan, bersama logo aplikasi.</p>
        <ImageUploader value={form.logo_image_path} onChange={(p) => setForm({ ...form, logo_image_path: p })} label="Unggah Logo Toko" testid="store-logo" />
      </Card>

      <Card className="rounded-2xl p-6 space-y-5 mt-6">
        <div className="flex items-center gap-2 text-secondary"><QrCode className="h-5 w-5" /><h3 className="font-heading font-bold text-lg">QRIS Toko</h3></div>
        <p className="text-sm text-muted-foreground">Unggah gambar QRIS toko Anda. QRIS ini akan ditampilkan di kasir saat pelanggan membayar via QRIS.</p>
        <ImageUploader value={form.qris_image_path} onChange={(p) => setForm({ ...form, qris_image_path: p })} label="Unggah QRIS Toko" testid="store-qris" />
      </Card>

      <Button className="mt-6" onClick={save} disabled={busy} data-testid="save-store-settings">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan Pengaturan</Button>
    </div>
  );
}
