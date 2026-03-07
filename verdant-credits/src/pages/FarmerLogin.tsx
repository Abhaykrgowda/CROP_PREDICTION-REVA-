import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { setCurrentFarmer } from "@/lib/storage";

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const sendOtp = () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const code = "1111";
    setGeneratedOtp(code);
    setOtpSent(true);
    toast.success(`OTP sent! (Demo OTP: ${code})`);
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setCurrentFarmer(phone);
      toast.success("Login successful! Welcome farmer 🌱");
      navigate("/farmer-dashboard");
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Farmer Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Login with your phone number
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                disabled={otpSent}
                className="w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {otpSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm text-muted-foreground mb-1 block">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                maxLength={4}
                className="w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center tracking-[0.5em] text-xl font-display"
              />
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={otpSent ? verifyOtp : sendOtp}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold flex items-center justify-center gap-2 glow-primary transition-all"
          >
            {otpSent ? "Verify OTP" : "Send OTP"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-muted-foreground text-sm hover:text-foreground transition-colors w-full text-center"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
};

export default FarmerLogin;
