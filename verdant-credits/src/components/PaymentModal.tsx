import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Shield, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  credits: number;
  cost: number;
  farmerCount?: number;
}

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

const CheckoutForm = ({
  onSuccess,
  credits,
  cost,
  farmerCount,
}: Omit<PaymentModalProps, "open">) => {
  const { t } = useI18n();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const cardDigits = cardNumber.replace(/\s/g, "");
  const expiryDigits = expiry.replace(/\D/g, "");
  const isValid =
    cardDigits.length >= 13 && expiryDigits.length === 4 && cvc.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError(t("pay.failed"));
      return;
    }

    setProcessing(true);
    setError(null);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <div className="glass rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("pay.credits")}</span>
          <span className="text-foreground font-semibold">{credits}</span>
        </div>
        {farmerCount && farmerCount > 1 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("pay.farmers")}</span>
            <span className="text-foreground">{farmerCount}</span>
          </div>
        )}
        <div className="border-t border-border my-1" />
        <div className="flex justify-between">
          <span className="text-muted-foreground font-semibold">
            {t("pay.total")}
          </span>
          <span className="text-accent font-display font-bold text-lg">
            ₹{cost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            {t("pay.cardNumber")}
          </label>
          <div className="bg-secondary/50 border border-border rounded-lg py-3 px-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none font-mono tracking-wider"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              {t("pay.expiry")}
            </label>
            <div className="bg-secondary/50 border border-border rounded-lg py-3 px-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none font-mono tracking-wider"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              {t("pay.cvc")}
            </label>
            <div className="bg-secondary/50 border border-border rounded-lg py-3 px-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none font-mono tracking-wider"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}

      <motion.button
        whileHover={{ scale: processing ? 1 : 1.02 }}
        whileTap={{ scale: processing ? 1 : 0.98 }}
        disabled={!isValid || processing}
        type="submit"
        className="w-full bg-accent text-accent-foreground rounded-lg py-3 font-semibold glow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("pay.processing")}
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {t("pay.payNow", { amount: cost.toFixed(2) })}
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3 h-3" />
        {t("pay.secure")}
      </div>
    </form>
  );
};

const PaymentModal = ({
  open,
  onClose,
  onSuccess,
  credits,
  cost,
  farmerCount,
}: PaymentModalProps) => {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-md relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {t("pay.title")}
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    {t("pay.subtitle")}
                  </p>
                </div>
              </div>

              <CheckoutForm
                onClose={onClose}
                onSuccess={onSuccess}
                credits={credits}
                cost={cost}
                farmerCount={farmerCount}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
