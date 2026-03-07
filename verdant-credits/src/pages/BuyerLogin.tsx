import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Phone, Lock, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { saveBuyer, findBuyer, setCurrentBuyer } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const BuyerLogin = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isSignup, setIsSignup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!phone || !password) {
      toast.error(t("buyer.fillAll"));
      return;
    }
    if (isSignup) {
      if (!companyName) {
        toast.error(t("buyer.enterCompany"));
        return;
      }
      if (password.length < 6) {
        toast.error(t("buyer.passwordLength"));
        return;
      }
      saveBuyer({ companyName, phone, password });
      setCurrentBuyer(phone);
      toast.success(t("buyer.accountCreated"));
      navigate("/market");
    } else {
      const buyer = findBuyer(phone, password);
      if (buyer) {
        setCurrentBuyer(phone);
        toast.success(t("buyer.welcomeBack", { name: buyer.companyName }));
        navigate("/market");
      } else {
        toast.error(t("buyer.invalidCreds"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isSignup ? t("buyer.createAccount") : t("buyer.login")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignup
                ? t("buyer.registerSubtitle")
                : t("buyer.signInSubtitle")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <label className="text-sm text-muted-foreground mb-1 block">
                {t("buyer.companyName")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("buyer.companyPlaceholder")}
                  className="w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t("buyer.phone")}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("buyer.phonePlaceholder")}
                className="w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t("buyer.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("buyer.passwordPlaceholder")}
                className="w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full bg-accent text-accent-foreground rounded-lg py-3 font-semibold flex items-center justify-center gap-2 glow-gold transition-all"
          >
            {isSignup ? t("buyer.createAccount") : t("buyer.signIn")}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-accent text-sm hover:underline w-full text-center"
        >
          {isSignup ? t("buyer.alreadyAccount") : t("buyer.noAccount")}
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-2 text-muted-foreground text-sm hover:text-foreground transition-colors w-full text-center"
        >
          {t("buyer.backHome")}
        </button>
      </motion.div>
    </div>
  );
};

export default BuyerLogin;
