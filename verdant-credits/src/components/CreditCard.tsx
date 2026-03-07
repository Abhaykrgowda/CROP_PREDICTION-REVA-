import { motion } from "framer-motion";
import { MapPin, Ruler } from "lucide-react";
import type { Farmer } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

interface CreditCardProps {
  farmer: Farmer;
  marketPrice: number;
  onBuy: () => void;
}

const CreditCard = ({ farmer, marketPrice, onBuy }: CreditCardProps) => {
  const cost = farmer.carbonCredits * marketPrice;
  const { t } = useI18n();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-strong rounded-2xl p-5 flex flex-col items-center"
    >
      {/* Rotating gold coin */}
      <div className="my-4" style={{ perspective: "300px" }}>
        <div
          className="coin-rotate w-16 h-16 rounded-full flex items-center justify-center pulse-glow"
          style={{
            background:
              "linear-gradient(135deg, hsl(50, 95%, 70%), hsl(45, 90%, 55%), hsl(38, 80%, 40%))",
          }}
        >
          <span
            className="font-display font-bold text-lg"
            style={{ color: "hsl(160, 30%, 6%)" }}
          >
            {farmer.carbonCredits}
          </span>
        </div>
      </div>

      <h3 className="font-display text-xl font-bold text-gradient-gold">
        {t("creditCard.credits", { n: farmer.carbonCredits })}
      </h3>
      <p className="text-primary font-mono text-xs mt-1">{farmer.uniqueId}</p>

      <div className="w-full mt-4 space-y-1 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1">
            <Ruler className="w-3 h-3" /> {t("creditCard.land")}
          </span>
          <span className="text-foreground">
            {t("creditCard.acres", { n: farmer.farmSize })}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {t("creditCard.location")}
          </span>
          <span className="text-foreground">
            {farmer.lat.toFixed(2)}, {farmer.lng.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t("creditCard.cost")}</span>
          <span className="text-accent font-semibold">₹{cost.toFixed(2)}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBuy}
        className="mt-4 w-full bg-accent text-accent-foreground rounded-lg py-2.5 font-semibold text-sm glow-gold transition-all"
      >
        {t("creditCard.buyNow")}
      </motion.button>
    </motion.div>
  );
};

export default CreditCard;
