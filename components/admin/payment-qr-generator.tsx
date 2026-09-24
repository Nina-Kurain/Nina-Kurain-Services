"use client";

import { useEffect, useRef, useState } from "react";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  IndianRupee,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encodeQRCode, drawPaymentReceiptCard } from "@/lib/qr-code";

interface PaymentQrGeneratorProps {
  defaultUpiId?: string;
  payeeName?: string;
  razorpayReady?: boolean;
  onPaymentCreated?: (data: any) => void;
}

export function PaymentQrGenerator({
  defaultUpiId = "ninakurain@upi",
  payeeName = "Nina Kurain",
  razorpayReady = false,
  onPaymentCreated,
}: PaymentQrGeneratorProps) {
  const [amount, setAmount] = useState<string>("1500");
  const [description, setDescription] = useState<string>("VIP Exclusive Commission");
  const [customerName, setCustomerName] = useState<string>("");
  const [upiId, setUpiId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nk_admin_upi_id") || defaultUpiId;
    }
    return defaultUpiId;
  });
  const [mode, setMode] = useState<"upi" | "razorpay">("upi");

  // Output State
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    upiUri: string;
    shortUrl?: string | null;
    amountDisplay: string;
    description: string;
    orderRef: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quickAmounts = ["500", "1000", "2000", "3500", "5000", "10000"];

  // Save UPI ID preference
  const handleUpiIdChange = (val: string) => {
    setUpiId(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("nk_admin_upi_id", val);
    }
  };

  // Generate QR & Payment Link
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    const orderRef = `NK-${Date.now().toString(36).toUpperCase()}`;
    const cleanUpi = upiId.trim() || defaultUpiId;
    const cleanDesc = description.trim() || "Nina Kurain VIP Payment";
    const upiUri = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${numAmount}&cu=INR&tn=${encodeURIComponent(cleanDesc)}`;

    try {
      if (mode === "razorpay") {
        const res = await fetch("/api/studio/custom-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numAmount,
            description: cleanDesc,
            customerName: customerName.trim() || undefined,
            upiId: cleanUpi,
          }),
        });
        const data = (await res.json()) as any;
        if (!res.ok) throw new Error(data.message || "Failed to generate link");

        setGeneratedData({
          upiUri: data.upiUri || upiUri,
          shortUrl: data.shortUrl || null,
          amountDisplay: data.amountDisplay || `₹${numAmount.toLocaleString("en-IN")}`,
          description: cleanDesc,
          orderRef: data.id || orderRef,
        });
        onPaymentCreated?.(data);
      } else {
        // Direct UPI Mode
        setGeneratedData({
          upiUri,
          shortUrl: null,
          amountDisplay: `₹${numAmount.toLocaleString("en-IN")}`,
          description: cleanDesc,
          orderRef,
        });
      }
    } catch (err) {
      console.error("Payment generation error:", err);
      // Fallback to Direct UPI immediately
      setGeneratedData({
        upiUri,
        shortUrl: null,
        amountDisplay: `₹${numAmount.toLocaleString("en-IN")}`,
        description: cleanDesc,
        orderRef,
      });
    } finally {
      setLoading(false);
    }
  };

  // Render QR Card onto Canvas whenever generatedData updates
  useEffect(() => {
    if (!generatedData) {
      // Auto generate initial on mount
      handleGenerate();
      return;
    }

    if (!canvasRef.current) return;
    try {
      const textToEncode = generatedData.shortUrl || generatedData.upiUri;
      const matrix = encodeQRCode(textToEncode);
      drawPaymentReceiptCard(canvasRef.current, {
        amountDisplay: generatedData.amountDisplay,
        description: generatedData.description,
        customerName: customerName.trim() || undefined,
        payeeName,
        upiId: upiId.trim() || defaultUpiId,
        matrix,
        orderRef: generatedData.orderRef,
      });
    } catch (err) {
      console.error("Error drawing payment card canvas:", err);
    }
  }, [generatedData]);

  // Actions: Download, Share, Copy
  const downloadCardImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    const safeAmount = amount.replace(/[^0-9]/g, "") || "request";
    link.download = `Nina-Kurain-Payment-₹${safeAmount}.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareViaWhatsApp = () => {
    if (!generatedData) return;
    const payTarget = generatedData.shortUrl || generatedData.upiUri;
    const msg = `👑 *Payment Request from ${payeeName}*\n\n` +
      `*Amount:* ${generatedData.amountDisplay}\n` +
      `*For:* ${generatedData.description}\n\n` +
      (generatedData.shortUrl
        ? `*Pay via UPI / Cards / Netbanking:* ${generatedData.shortUrl}\n\n`
        : `*Direct UPI Payment Link:* ${generatedData.upiUri}\n\n`) +
      `_Scan the attached QR code or click the link above with any UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred)._`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const shareViaWeb = async () => {
    if (!canvasRef.current || !generatedData) return;
    const payTarget = generatedData.shortUrl || generatedData.upiUri;
    const shareText = `Payment request for ${generatedData.amountDisplay} to ${payeeName} (${generatedData.description}).`;

    if (navigator.share) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Nina-Kurain-Payment-${amount}.png`, { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Payment to ${payeeName}`,
              text: shareText,
              files: [file],
            });
          } else {
            await navigator.share({
              title: `Payment to ${payeeName}`,
              text: `${shareText}\n${payTarget}`,
              url: generatedData.shortUrl || undefined,
            });
          }
        }, "image/png");
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      shareViaWhatsApp();
    }
  };

  const copyPaymentLink = async () => {
    if (!generatedData) return;
    const target = generatedData.shortUrl || generatedData.upiUri;
    try {
      await navigator.clipboard.writeText(target);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  return (
    <div className="payment-qr-generator-container" style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left Column: Input Form Controls */}
        <section
          style={{
            background: "linear-gradient(180deg, #160a17 0%, #0d060e 100%)",
            border: "1px solid rgba(224, 96, 134, 0.35)",
            borderRadius: 18,
            padding: "clamp(20px, 3vw, 28px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(224, 96, 134, 0.15)",
                border: "1px solid rgba(224, 96, 134, 0.4)",
                display: "grid",
                placeItems: "center",
                color: "var(--nk-rose-light, #f595b2)",
              }}
            >
              <QrCode size={20} />
            </span>
            <div>
              <h2 style={{ fontSize: 18, margin: 0, color: "#fff", fontFamily: "Georgia, serif" }}>
                Generate Payment QR &amp; Link
              </h2>
              <span style={{ fontSize: 11.5, color: "var(--nk-text-muted, #b8a6b0)" }}>
                Instant dynamic QR code for any custom amount
              </span>
            </div>
          </div>

          {/* Mode Switch: Direct UPI vs Razorpay */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              background: "rgba(0,0,0,0.4)",
              padding: 4,
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <button
              type="button"
              onClick={() => setMode("upi")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                background: mode === "upi" ? "linear-gradient(115deg, #a92f49, #e06086)" : "transparent",
                color: mode === "upi" ? "#fff" : "var(--nk-text-muted, #b8a6b0)",
                transition: "all 0.2s ease",
              }}
            >
              <Zap size={14} />
              <span>Direct UPI (0% Fee)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("razorpay")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                background: mode === "razorpay" ? "linear-gradient(115deg, #a92f49, #e06086)" : "transparent",
                color: mode === "razorpay" ? "#fff" : "var(--nk-text-muted, #b8a6b0)",
                transition: "all 0.2s ease",
              }}
            >
              <CreditCard size={14} />
              <span>Razorpay Link</span>
            </button>
          </div>

          <form onSubmit={handleGenerate}>
            {/* Amount Field */}
            <div style={{ marginBottom: 16 }}>
              <Label htmlFor="pay-amount" style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6, display: "block" }}>
                Amount to Request (INR) *
              </Label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--nk-rose-light, #f595b2)",
                  }}
                >
                  ₹
                </span>
                <Input
                  id="pay-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  required
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    paddingLeft: 34,
                    height: 50,
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(224, 96, 134, 0.4)",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
              </div>

              {/* Quick Amount Preset Chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: amount === q ? "rgba(224, 96, 134, 0.3)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${amount === q ? "rgba(224, 96, 134, 0.6)" : "rgba(255,255,255,0.12)"}`,
                      color: amount === q ? "#fff" : "var(--nk-text-muted, #b8a6b0)",
                      cursor: "pointer",
                    }}
                  >
                    ₹{parseInt(q).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose / Description */}
            <div style={{ marginBottom: 14 }}>
              <Label htmlFor="pay-desc" style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6, display: "block" }}>
                Purpose / Custom Note
              </Label>
              <Input
                id="pay-desc"
                type="text"
                maxLength={80}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. VIP Private Commission / Exclusive Set"
                style={{
                  height: 42,
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: "#fff",
                }}
              />
            </div>

            {/* Customer Name (Optional) */}
            <div style={{ marginBottom: 14 }}>
              <Label htmlFor="pay-customer" style={{ fontSize: 12, color: "var(--nk-text-muted, #b8a6b0)", marginBottom: 6, display: "block" }}>
                Customer / Member Name (Optional)
              </Label>
              <Input
                id="pay-customer"
                type="text"
                maxLength={60}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul S."
                style={{
                  height: 42,
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#fff",
                }}
              />
            </div>

            {/* Receiving UPI ID */}
            <div style={{ marginBottom: 20 }}>
              <Label htmlFor="pay-upi" style={{ fontSize: 12, color: "var(--nk-text-muted, #b8a6b0)", marginBottom: 6, display: "block" }}>
                Receiving UPI ID (VPA)
              </Label>
              <Input
                id="pay-upi"
                type="text"
                value={upiId}
                onChange={(e) => handleUpiIdChange(e.target.value)}
                placeholder="e.g. ninakurain@okhdfcbank"
                style={{
                  height: 42,
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "#f595b2",
                }}
              />
              <small style={{ fontSize: 11, color: "#8a7382", marginTop: 4, display: "block" }}>
                Funds go directly to this UPI ID upon QR scan. Remembered for future requests.
              </small>
            </div>

            {/* Generate / Refresh Button */}
            <Button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                minHeight: 46,
                borderRadius: 10,
                background: "linear-gradient(115deg, #a92f49, #e06086)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                boxShadow: "0 6px 20px rgba(224, 96, 134, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              {loading ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
              <span>{loading ? "Generating Payment…" : "Update & Regenerate QR"}</span>
            </Button>
          </form>
        </section>

        {/* Right Column: Live QR Preview & Share Actions */}
        <section
          style={{
            background: "linear-gradient(180deg, #140815 0%, #0c040d 100%)",
            border: "1px solid rgba(224, 96, 134, 0.35)",
            borderRadius: 18,
            padding: "clamp(20px, 3vw, 28px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "var(--nk-rose-light, #f595b2)" }}>
              PAYMENT CARD PREVIEW
            </span>
            <span style={{ fontSize: 11, color: "#8a7382" }}>
              Ready to Send
            </span>
          </div>

          {/* Canvas Rendering Output Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 320,
              aspectRatio: "640 / 860",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(224, 96, 134, 0.3)",
              boxShadow: "0 12px 35px rgba(0,0,0,0.7), 0 0 30px rgba(224, 96, 134, 0.15)",
              marginBottom: 18,
              background: "#0d050d",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Quick Payment Link Box */}
          <div
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
              <small style={{ fontSize: 10, color: "#8a7382", display: "block" }}>
                {generatedData?.shortUrl ? "Razorpay Live URL" : "UPI Payment String"}
              </small>
              <span
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                }}
              >
                {generatedData?.shortUrl || generatedData?.upiUri || "Generating..."}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyPaymentLink}
              style={{ flexShrink: 0, height: 32, gap: 5, fontSize: 11.5 }}
            >
              {copiedLink ? <Check size={14} style={{ color: "#4ade80" }} /> : <Copy size={14} />}
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          {/* Primary Action Buttons: Download, Share to WhatsApp, Share Device */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginBottom: 10 }}>
            <Button
              type="button"
              onClick={downloadCardImage}
              style={{
                minHeight: 44,
                borderRadius: 10,
                background: "linear-gradient(115deg, #a92f49, #e06086)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                boxShadow: "0 4px 14px rgba(224, 96, 134, 0.3)",
              }}
            >
              <Download size={15} />
              <span>Download Card</span>
            </Button>

            <Button
              type="button"
              onClick={shareViaWhatsApp}
              style={{
                minHeight: 44,
                borderRadius: 10,
                background: "#25d366",
                color: "#072e12",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <Send size={15} />
              <span>Send on WhatsApp</span>
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
            <Button
              type="button"
              variant="outline"
              onClick={shareViaWeb}
              style={{
                minHeight: 40,
                borderRadius: 10,
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Share2 size={14} />
              <span>Share via Phone</span>
            </Button>

            {generatedData?.upiUri ? (
              <a
                href={generatedData.upiUri}
                className="btn-secondary"
                style={{
                  minHeight: 40,
                  borderRadius: 10,
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                }}
              >
                <Smartphone size={14} />
                <span>Test in UPI App</span>
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
