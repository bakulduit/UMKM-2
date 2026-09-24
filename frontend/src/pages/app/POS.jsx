import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah, playIncomingMoneySound } from "@/lib/format";
import { printReceipt, whatsappUrl, shareReceiptPdf } from "@/lib/receipt";
import { useAuth } from "@/context/AuthContext";
import AuthImage from "@/components/AuthImage";
import OutletSelect from "@/components/OutletSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Banknote, QrCode, Loader2, CheckCircle2, BellRing, PackageX, Printer, Send, FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function POS() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [outlet, setOutlet] = useState("all");
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("none");
  const [isCredit, setIsCredit] = useState(false);
  const [cashGiven, setCashGiven] = useState("");
  const [qrisOpen, setQrisOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastTxn, setLastTxn] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get("/products")).data });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: async () => (await api.get("/customers")).data });
  const { data: umkm } = useQuery({ queryKey: ["umkm"], queryFn: async () => (await api.get("/umkm")).data });

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) &&
          (outlet === "all" || !p.outlet_id || p.outlet_id === outlet)
      ),
    [products, q, outlet]
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const change = Number(cashGiven || 0) - total;

  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((i) => i.product_id === p.id);
      if (ex) return c.map((i) => (i.product_id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product_id: p.id, name: p.name, price: p.price, cost: p.cost || 0, qty: 1 }];
    });
  };
  const setQty = (id, d) =>
    setCart((c) => c.map((i) => (i.product_id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.product_id !== id));
  const reset = () => { setCart([]); setDiscount(0); setCustomerId("none"); setIsCredit(false); setCashGiven(""); setMethod("cash"); };

  const doCheckout = async () => {
    if (cart.length === 0) return toast.error("Keranjang masih kosong");
    if (isCredit && customerId === "none") return toast.error("Pilih pelanggan untuk kasbon");
    setBusy(true);
    try {
      const { data } = await api.post("/transactions/sale", {
        items: cart.map(({ product_id, name, price, cost, qty }) => ({ product_id, name, price, cost, qty })),
        payment_method: method,
        discount: Number(discount || 0),
        customer_id: customerId === "none" ? null : customerId,
        is_credit: isCredit,
        outlet_id: outlet === "all" ? null : outlet,
        amount_paid: method === "cash" ? Number(cashGiven || total) : total,
      });
      setLastTxn(data);
      setQrisOpen(false);
      qc.invalidateQueries();
      if (!isCredit) {
        playIncomingMoneySound();
      }
      setSuccessOpen(true);
      reset();
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const onPay = () => {
    if (cart.length === 0) return toast.error("Keranjang masih kosong");
    if (isCredit) return doCheckout();
    if (method === "qris") return setQrisOpen(true);
    return doCheckout();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-secondary">Kasir</h1>
          {user?.role === "umkm_admin" && <OutletSelect value={outlet} onChange={setOutlet} className="w-40" allLabel="Semua Outlet" testid="pos-outlet" />}
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk..." className="pl-9" data-testid="pos-search" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="rounded-2xl p-12 text-center text-muted-foreground">
            <PackageX className="h-10 w-10 mx-auto mb-3 opacity-50" />
            Belum ada produk. Tambahkan produk terlebih dahulu.
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const out = p.stock <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => !out && addToCart(p)}
                  disabled={out}
                  data-testid={`pos-product-${p.id}`}
                  className={`text-left bg-white rounded-2xl border p-4 transition-transform duration-150 ${
                    out ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-md hover:border-primary"
                  }`}
                >
                  <div className="h-20 rounded-xl bg-accent grid place-items-center mb-3 overflow-hidden">
                    {p.image_path ? <AuthImage path={p.image_path} className="h-full w-full object-cover" /> : <ShoppingCart className="h-7 w-7 text-accent-foreground" />}
                  </div>
                  <div className="font-medium text-sm leading-tight line-clamp-2">{p.name}</div>
                  <div className="font-heading font-bold text-primary mt-1 tabular">{rupiah(p.price)}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Stok: {p.stock}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart */}
      <Card className="rounded-2xl flex flex-col h-fit lg:sticky lg:top-24 max-h-[calc(100vh-8rem)]" data-testid="pos-cart">
        <div className="p-5 border-b flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-bold text-lg">Keranjang</h3>
          {cart.length > 0 && <button onClick={reset} className="ml-auto text-xs text-destructive hover:underline" data-testid="pos-clear">Kosongkan</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[120px]">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Pilih produk untuk mulai transaksi.</p>
          ) : (
            cart.map((i) => (
              <div key={i.product_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.name}</div>
                  <div className="text-xs text-muted-foreground tabular">{rupiah(i.price)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.product_id, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm tabular">{i.qty}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.product_id, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <button onClick={() => removeItem(i.product_id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMethod("cash")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${method === "cash" ? "bg-primary text-white border-primary" : "bg-white hover:bg-muted"}`} data-testid="pos-method-cash">
              <Banknote className="h-4 w-4" /> Tunai
            </button>
            <button onClick={() => setMethod("qris")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${method === "qris" ? "bg-primary text-white border-primary" : "bg-white hover:bg-muted"}`} data-testid="pos-method-qris">
              <QrCode className="h-4 w-4" /> QRIS
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Diskon</Label>
            <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9" data-testid="pos-discount" />
          </div>

          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="h-9" data-testid="pos-customer"><SelectValue placeholder="Pelanggan (opsional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Umum / Tanpa nama</SelectItem>
              {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <Label htmlFor="credit" className="text-sm">Catat sebagai Kasbon</Label>
            <Switch id="credit" checked={isCredit} onCheckedChange={setIsCredit} data-testid="pos-credit-toggle" />
          </div>

          {method === "cash" && !isCredit && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Uang Tunai</Label>
              <Input type="number" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} className="h-9" placeholder={total} data-testid="pos-cash" />
            </div>
          )}

          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular">{rupiah(subtotal)}</span></div>
          <div className="flex justify-between items-center">
            <span className="font-heading font-bold">Total</span>
            <span className="font-heading text-2xl font-extrabold text-primary tabular" data-testid="pos-total">{rupiah(total)}</span>
          </div>
          {method === "cash" && !isCredit && cashGiven && (
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Kembalian</span><span className="tabular font-medium">{rupiah(Math.max(0, change))}</span></div>
          )}

          <Button className="w-full h-12 text-base" onClick={onPay} disabled={busy} data-testid="pos-checkout">
            {busy ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
            {isCredit ? "Simpan Kasbon" : method === "qris" ? "Bayar via QRIS" : "Bayar Tunai"}
          </Button>
        </div>
      </Card>

      {/* QRIS Dialog */}
      <Dialog open={qrisOpen} onOpenChange={setQrisOpen}>
        <DialogContent data-testid="qris-dialog">
          <DialogHeader><DialogTitle>Pembayaran QRIS · {rupiah(total)}</DialogTitle></DialogHeader>
          <div className="text-center">
            {umkm?.qris_image_path ? (
              <div className="rounded-2xl border-4 border-primary/20 p-3 inline-block bg-white">
                <AuthImage path={umkm.qris_image_path} alt="QRIS" className="h-64 w-64 object-contain mx-auto" />
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed p-8 text-sm text-muted-foreground">
                QRIS toko belum diunggah. Buka <b>Pengaturan Toko</b> untuk mengunggah QRIS Anda.
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">Minta pelanggan scan QRIS di atas. Setelah dana masuk, tekan tombol di bawah.</p>
            <Button className="w-full h-12 mt-4" onClick={doCheckout} disabled={busy} data-testid="qris-confirm">
              {busy ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <BellRing className="h-5 w-5 mr-2" />}
              Uang Sudah Masuk
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent data-testid="success-dialog">
          <DialogTitle className="sr-only">Transaksi Berhasil</DialogTitle>
          <div className="text-center py-4">
            <div className="h-16 w-16 rounded-full bg-accent grid place-items-center mx-auto animate-coin-pop">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <h3 className="font-heading text-2xl font-extrabold mt-4">{lastTxn?.is_credit ? "Kasbon Tercatat" : "Pembayaran Diterima!"}</h3>
            <p className="text-3xl font-heading font-extrabold text-primary mt-2 tabular">{rupiah(lastTxn?.total)}</p>
            {lastTxn && !lastTxn.is_credit && lastTxn.payment_method === "cash" && Number(lastTxn.amount_paid) > lastTxn.total && (
              <p className="text-sm text-muted-foreground mt-1">Kembalian: {rupiah(lastTxn.amount_paid - lastTxn.total)}</p>
            )}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button variant="outline" onClick={() => lastTxn && printReceipt(lastTxn, umkm)} data-testid="print-receipt"><Printer className="h-4 w-4 mr-2" /> Cetak Struk</Button>
              <a href={lastTxn ? whatsappUrl(lastTxn, umkm, null) : "#"} target="_blank" rel="noreferrer" className="w-full">
                <Button variant="outline" className="w-full" data-testid="wa-receipt"><Send className="h-4 w-4 mr-2" /> WhatsApp</Button>
              </a>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => lastTxn && shareReceiptPdf(lastTxn, umkm, null)} data-testid="pdf-receipt"><FileText className="h-4 w-4 mr-2" /> Kirim Struk PDF</Button>
            <Button className="w-full mt-2" onClick={() => setSuccessOpen(false)} data-testid="success-close">Transaksi Baru</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
