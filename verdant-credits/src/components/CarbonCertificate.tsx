import { motion } from "framer-motion";
import { Award, Leaf, Calendar, MapPin, Download } from "lucide-react";
import type { Certificate } from "@/lib/storage";
import { useRef } from "react";
import jsPDF from "jspdf";
import { useI18n } from "@/lib/i18n";

interface CarbonCertificateProps {
  certificate: Certificate;
}

const CarbonCertificate = ({ certificate }: CarbonCertificateProps) => {
  const certRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const issuedDate = new Date(certificate.issuedAt);
  const formattedDate = issuedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = issuedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(15, 35, 30);
    doc.rect(0, 0, w, h, "F");

    // Gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(2);
    doc.rect(8, 8, w - 16, h - 16);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, w - 24, h - 24);

    // Corner decorations
    const cornerSize = 15;
    const corners = [
      [12, 12],
      [w - 12, 12],
      [12, h - 12],
      [w - 12, h - 12],
    ];
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    corners.forEach(([cx, cy]) => {
      const dx = cx < w / 2 ? 1 : -1;
      const dy = cy < h / 2 ? 1 : -1;
      doc.line(cx, cy, cx + cornerSize * dx, cy);
      doc.line(cx, cy, cx, cy + cornerSize * dy);
    });

    // Title
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(t("cert.carbonCreditCert").toUpperCase(), w / 2, 38, {
      align: "center",
    });

    // Gold line under title
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(w / 2 - 50, 43, w / 2 + 50, 43);

    // "This certifies that"
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(t("cert.certifies"), w / 2, 55, { align: "center" });

    // Farmer name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(certificate.farmerName, w / 2, 67, { align: "center" });

    // "has been awarded"
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(t("cert.awarded"), w / 2, 77, { align: "center" });

    // Credits
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text(`${certificate.carbonCredits}`, w / 2 - 10, 93, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(t("cert.creditsYear"), w / 2 + 20, 93, { align: "center" });

    // Details section
    const detailY = 110;
    const colWidth = 60;
    const startX = w / 2 - (colWidth * 2) / 2 - 20;

    const details = [
      { label: t("cert.certId"), value: certificate.uniqueId },
      {
        label: t("cert.farmSize"),
        value: `${certificate.farmSize} ${t("cert.acres")}`,
      },
      {
        label: t("cert.location"),
        value: `${certificate.location.lat.toFixed(4)}, ${certificate.location.lng.toFixed(4)}`,
      },
      { label: t("cert.issuedDate"), value: formattedDate },
    ];

    details.forEach((d, i) => {
      const x = startX + (i % 4) * colWidth;
      const y = detailY;
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(d.label, x, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(d.value, x, y + 6);
    });

    // Divider
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(30, 125, w - 30, 125);

    // Footer text
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(t("cert.footer1"), w / 2, 135, { align: "center" });
    doc.text(t("cert.footer2"), w / 2, 141, { align: "center" });

    // Timestamp
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.text(`Issued on ${formattedDate} at ${formattedTime}`, w / 2, h - 20, {
      align: "center",
    });

    // CarbonBridge branding
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CarbonBridge", w / 2, h - 14, { align: "center" });

    doc.save(`certificate-${certificate.uniqueId}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        ref={certRef}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(160, 30%, 10%), hsl(150, 25%, 15%), hsl(160, 30%, 10%))",
          border: "2px solid hsl(50, 80%, 50%)",
        }}
      >
        {/* Gold corner decorations */}
        <div
          className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl"
          style={{ borderColor: "hsl(50, 80%, 50%)" }}
        />
        <div
          className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 rounded-tr-2xl"
          style={{ borderColor: "hsl(50, 80%, 50%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 rounded-bl-2xl"
          style={{ borderColor: "hsl(50, 80%, 50%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl"
          style={{ borderColor: "hsl(50, 80%, 50%)" }}
        />

        <div className="p-6 md:p-8 text-center">
          {/* Header */}
          <div className="flex justify-center mb-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(50, 95%, 70%), hsl(45, 90%, 55%))",
              }}
            >
              <Award
                className="w-7 h-7"
                style={{ color: "hsl(160, 30%, 10%)" }}
              />
            </div>
          </div>

          <h2 className="font-display text-xl md:text-2xl font-bold text-gradient-gold tracking-wide">
            {t("cert.carbonCreditCert")}
          </h2>
          <div
            className="w-24 h-0.5 mx-auto my-3"
            style={{ background: "hsl(50, 80%, 50%)" }}
          />

          {/* Farmer Info */}
          <p className="text-muted-foreground text-sm mb-1">
            {t("cert.certifies")}
          </p>
          <h3 className="font-display text-2xl font-bold text-foreground mb-4">
            {certificate.farmerName}
          </h3>

          {/* Credits */}
          <div className="glass rounded-xl p-4 mb-4 inline-block">
            <div className="flex items-center gap-2 justify-center">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-display text-3xl font-bold text-gradient-gold">
                {certificate.carbonCredits}
              </span>
              <span className="text-muted-foreground text-sm">
                {t("cert.creditsYear")}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4 max-w-sm mx-auto">
            <div className="glass rounded-lg p-3 text-left">
              <p className="text-muted-foreground text-xs mb-1">
                {t("cert.uniqueId")}
              </p>
              <p className="text-primary font-mono text-xs font-medium">
                {certificate.uniqueId}
              </p>
            </div>
            <div className="glass rounded-lg p-3 text-left">
              <p className="text-muted-foreground text-xs mb-1">
                {t("cert.farmSize")}
              </p>
              <p className="text-foreground font-medium">
                {certificate.farmSize} {t("cert.acres")}
              </p>
            </div>
            <div className="glass rounded-lg p-3 text-left">
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {t("cert.issuedDate")}
              </p>
              <p className="text-foreground font-medium text-xs">
                {formattedDate}
              </p>
            </div>
            <div className="glass rounded-lg p-3 text-left">
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {t("cert.location")}
              </p>
              <p className="text-foreground font-medium text-xs">
                {certificate.location.lat.toFixed(2)},{" "}
                {certificate.location.lng.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-muted-foreground text-xs">
            {t("cert.issuedOn", { date: formattedDate, time: formattedTime })}
          </p>
        </div>
      </div>

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        className="mt-4 w-full glass rounded-lg py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" /> {t("cert.download")}
      </motion.button>
    </motion.div>
  );
};

export default CarbonCertificate;
