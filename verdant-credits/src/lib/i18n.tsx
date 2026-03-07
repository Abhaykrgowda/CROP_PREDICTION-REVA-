import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "kn";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Landing
    "landing.title": "CarbonBridge",
    "landing.subtitle":
      "Bridging farmers and companies through verified carbon credits",
    "landing.farmer": "Farmer",
    "landing.farmerDesc": "Register your land & earn carbon credits",
    "landing.buyer": "Buyer",
    "landing.buyerDesc": "Purchase verified carbon credits from farmers",

    // Farmer Dashboard
    "farmer.dashboard": "Farmer Dashboard",
    "farmer.logout": "Logout",
    "farmer.registerFarm": "Register Your Farm",
    "farmer.name": "Farmer Name",
    "farmer.namePlaceholder": "Your full name",
    "farmer.npk": "NPK Values (Soil Test)",
    "farmer.farmSize": "Farm Size (acres)",
    "farmer.farmSizePlaceholder": "e.g. 5",
    "farmer.location": "Location (Latitude & Longitude)",
    "farmer.latitude": "Latitude",
    "farmer.longitude": "Longitude",
    "farmer.calculate": "Calculate Carbon Credits",
    "farmer.yourCredits": "Your Carbon Credits",
    "farmer.creditsYear": "{credits} Credits/Year",
    "farmer.uniqueId": "Unique ID:",
    "farmer.listedOnMarket": "Listed on Marketplace",
    "farmer.viewCertificate": "View Certificate",
    "farmer.listOnMarket": "List on Marketplace",
    "farmer.farmDetails": "Farm Details",
    "farmer.detailName": "Name",
    "farmer.detailFarmSize": "Farm Size",
    "farmer.acres": "acres",
    "farmer.detailNPK": "NPK",
    "farmer.detailLocation": "Location",
    "farmer.creditsFrequency": "Credits Frequency",
    "farmer.perYear": "Per Year",
    "farmer.registered": "Registered",
    "farmer.fillAll": "Please fill all fields",
    "farmer.creditsCalculated":
      "🎉 Carbon credits calculated: {credits} credits/year!",
    "farmer.listedSuccess":
      "✅ Credits listed on marketplace! Certificate generated.",
    "farmer.loggedOut": "Logged out successfully",

    // Buyer Login
    "buyer.login": "Buyer Login",
    "buyer.createAccount": "Create Account",
    "buyer.signInSubtitle": "Sign in to marketplace",
    "buyer.registerSubtitle": "Register your company",
    "buyer.companyName": "Company Name",
    "buyer.companyPlaceholder": "Enter company name",
    "buyer.phone": "Phone Number",
    "buyer.phonePlaceholder": "Enter phone number",
    "buyer.password": "Password",
    "buyer.passwordPlaceholder": "Enter strong password",
    "buyer.signIn": "Sign In",
    "buyer.alreadyAccount": "Already have an account? Sign in",
    "buyer.noAccount": "Don't have an account? Sign up",
    "buyer.backHome": "← Back to home",
    "buyer.fillAll": "Please fill all fields",
    "buyer.enterCompany": "Please enter company name",
    "buyer.passwordLength": "Password must be at least 6 characters",
    "buyer.accountCreated": "Account created successfully! 🏢",
    "buyer.welcomeBack": "Welcome back, {name}! 🏢",
    "buyer.invalidCreds": "Invalid credentials",

    // Market
    "market.title": "Marketplace",
    "market.price": "Price: ",
    "market.perCredit": "/credit",
    "market.credits": "Credits",
    "market.bulkBuy": "Bulk Buy",
    "market.map": "Map",
    "market.priceTab": "Price",
    "market.noCredits": "No carbon credits available right now",
    "market.bulkCredits": "Bulk Credits",
    "market.bulkDesc":
      "Purchase credits from multiple farmers at once to meet your requirement.",
    "market.creditsNeeded": "Credits Needed",
    "market.creditsPlaceholder": "e.g. 50",
    "market.estimatedCost": "Estimated Cost",
    "market.available": "Available",
    "market.creditsSuffix": "credits",
    "market.buyBulk": "Buy Bulk Credits",
    "market.creditLocations": "Credit Locations",
    "market.purchased": "🎉 Purchased {credits} credits for ₹{cost}!",
    "market.invalidAmount": "Enter a valid amount of credits",
    "market.notEnough":
      "Not enough credits available. Short by {credits} credits.",
    "market.bulkPurchased":
      "🎉 Bulk purchase: {credits} credits from {count} farmers for ₹{cost}!",

    // Certificate
    "cert.title": "Your Certificate",
    "cert.carbonCreditCert": "Carbon Credit Certificate",
    "cert.certifies": "This certifies that",
    "cert.awarded": "has been awarded",
    "cert.creditsYear": "credits/year",
    "cert.uniqueId": "Unique ID",
    "cert.farmSize": "Farm Size",
    "cert.acres": "acres",
    "cert.issuedDate": "Issued Date",
    "cert.location": "Location",
    "cert.issuedOn": "Issued on {date} at {time}",
    "cert.download": "Download Certificate",
    "cert.certId": "Certificate ID",
    "cert.footer1":
      "This certificate verifies carbon credits based on verified soil health and farm data.",
    "cert.footer2":
      "These credits are listed and available for trade on the CarbonBridge marketplace.",

    // Credit Card
    "creditCard.credits": "{n} Credits",
    "creditCard.land": "Land",
    "creditCard.acres": "{n} acres",
    "creditCard.location": "Location",
    "creditCard.cost": "Cost",
    "creditCard.buyNow": "Buy Now",

    // Map
    "map.noCredits": "No credits available on the map",
    "map.creditsYear": "{n} Credits/Year",
    "map.farmers": "{n} farmer(s)",
    "map.more": "+{n} more",

    // Price Chart
    "chart.livePrice": "Live Carbon Credit Price",
    "chart.priceChart": "Price Chart",
    "chart.today": "Today",
    "chart.yesterday": "Yesterday",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.home": "Return to Home",

    // Payment
    "pay.title": "Secure Payment",
    "pay.subtitle": "Powered by Stripe",
    "pay.credits": "Credits",
    "pay.farmers": "Farmers",
    "pay.total": "Total",
    "pay.cardNumber": "Card Number",
    "pay.expiry": "Expiry",
    "pay.cvc": "CVC",
    "pay.payNow": "Pay ₹{amount}",
    "pay.processing": "Processing...",
    "pay.secure": "Secured with Stripe encryption",
    "pay.failed": "Payment failed. Please try again.",
  },

  hi: {
    // Landing
    "landing.title": "कार्बनब्रिज",
    "landing.subtitle":
      "सत्यापित कार्बन क्रेडिट के माध्यम से किसानों और कंपनियों को जोड़ना",
    "landing.farmer": "किसान",
    "landing.farmerDesc":
      "अपनी भूमि पंजीकृत करें और कार्बन क्रेडिट अर्जित करें",
    "landing.buyer": "खरीदार",
    "landing.buyerDesc": "किसानों से सत्यापित कार्बन क्रेडिट खरीदें",

    // Farmer Dashboard
    "farmer.dashboard": "किसान डैशबोर्ड",
    "farmer.logout": "लॉगआउट",
    "farmer.registerFarm": "अपना खेत पंजीकृत करें",
    "farmer.name": "किसान का नाम",
    "farmer.namePlaceholder": "आपका पूरा नाम",
    "farmer.npk": "एनपीके मान (मिट्टी परीक्षण)",
    "farmer.farmSize": "खेत का आकार (एकड़)",
    "farmer.farmSizePlaceholder": "जैसे 5",
    "farmer.location": "स्थान (अक्षांश और देशांतर)",
    "farmer.latitude": "अक्षांश",
    "farmer.longitude": "देशांतर",
    "farmer.calculate": "कार्बन क्रेडिट की गणना करें",
    "farmer.yourCredits": "आपके कार्बन क्रेडिट",
    "farmer.creditsYear": "{credits} क्रेडिट/वर्ष",
    "farmer.uniqueId": "विशिष्ट आईडी:",
    "farmer.listedOnMarket": "बाज़ार में सूचीबद्ध",
    "farmer.viewCertificate": "प्रमाणपत्र देखें",
    "farmer.listOnMarket": "बाज़ार में सूचीबद्ध करें",
    "farmer.farmDetails": "खेत का विवरण",
    "farmer.detailName": "नाम",
    "farmer.detailFarmSize": "खेत का आकार",
    "farmer.acres": "एकड़",
    "farmer.detailNPK": "एनपीके",
    "farmer.detailLocation": "स्थान",
    "farmer.creditsFrequency": "क्रेडिट आवृत्ति",
    "farmer.perYear": "प्रति वर्ष",
    "farmer.registered": "पंजीकृत",
    "farmer.fillAll": "कृपया सभी फ़ील्ड भरें",
    "farmer.creditsCalculated":
      "🎉 कार्बन क्रेडिट गणना: {credits} क्रेडिट/वर्ष!",
    "farmer.listedSuccess": "✅ क्रेडिट बाज़ार में सूचीबद्ध! प्रमाणपत्र तैयार।",
    "farmer.loggedOut": "सफलतापूर्वक लॉगआउट हुआ",

    // Buyer Login
    "buyer.login": "खरीदार लॉगिन",
    "buyer.createAccount": "खाता बनाएं",
    "buyer.signInSubtitle": "बाज़ार में साइन इन करें",
    "buyer.registerSubtitle": "अपनी कंपनी पंजीकृत करें",
    "buyer.companyName": "कंपनी का नाम",
    "buyer.companyPlaceholder": "कंपनी का नाम दर्ज करें",
    "buyer.phone": "फ़ोन नंबर",
    "buyer.phonePlaceholder": "फ़ोन नंबर दर्ज करें",
    "buyer.password": "पासवर्ड",
    "buyer.passwordPlaceholder": "मज़बूत पासवर्ड दर्ज करें",
    "buyer.signIn": "साइन इन",
    "buyer.alreadyAccount": "पहले से खाता है? साइन इन करें",
    "buyer.noAccount": "खाता नहीं है? साइन अप करें",
    "buyer.backHome": "← होम पर वापस जाएं",
    "buyer.fillAll": "कृपया सभी फ़ील्ड भरें",
    "buyer.enterCompany": "कृपया कंपनी का नाम दर्ज करें",
    "buyer.passwordLength": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    "buyer.accountCreated": "खाता सफलतापूर्वक बनाया गया! 🏢",
    "buyer.welcomeBack": "वापस आपका स्वागत है, {name}! 🏢",
    "buyer.invalidCreds": "अमान्य प्रमाण-पत्र",

    // Market
    "market.title": "बाज़ार",
    "market.price": "मूल्य: ",
    "market.perCredit": "/क्रेडिट",
    "market.credits": "क्रेडिट",
    "market.bulkBuy": "थोक खरीद",
    "market.map": "नक्शा",
    "market.priceTab": "मूल्य",
    "market.noCredits": "अभी कोई कार्बन क्रेडिट उपलब्ध नहीं",
    "market.bulkCredits": "थोक क्रेडिट",
    "market.bulkDesc":
      "अपनी आवश्यकता पूरी करने के लिए एक साथ कई किसानों से क्रेडिट खरीदें।",
    "market.creditsNeeded": "आवश्यक क्रेडिट",
    "market.creditsPlaceholder": "जैसे 50",
    "market.estimatedCost": "अनुमानित लागत",
    "market.available": "उपलब्ध",
    "market.creditsSuffix": "क्रेडिट",
    "market.buyBulk": "थोक क्रेडिट खरीदें",
    "market.creditLocations": "क्रेडिट स्थान",
    "market.purchased": "🎉 {credits} क्रेडिट ₹{cost} में खरीदे!",
    "market.invalidAmount": "क्रेडिट की वैध राशि दर्ज करें",
    "market.notEnough":
      "पर्याप्त क्रेडिट उपलब्ध नहीं। {credits} क्रेडिट कम हैं।",
    "market.bulkPurchased":
      "🎉 थोक खरीद: {count} किसानों से {credits} क्रेडिट ₹{cost} में!",

    // Certificate
    "cert.title": "आपका प्रमाणपत्र",
    "cert.carbonCreditCert": "कार्बन क्रेडिट प्रमाणपत्र",
    "cert.certifies": "यह प्रमाणित करता है कि",
    "cert.awarded": "को प्रदान किए गए हैं",
    "cert.creditsYear": "क्रेडिट/वर्ष",
    "cert.uniqueId": "विशिष्ट आईडी",
    "cert.farmSize": "खेत का आकार",
    "cert.acres": "एकड़",
    "cert.issuedDate": "जारी करने की तारीख",
    "cert.location": "स्थान",
    "cert.issuedOn": "{date} को {time} पर जारी किया गया",
    "cert.download": "प्रमाणपत्र डाउनलोड करें",
    "cert.certId": "प्रमाणपत्र आईडी",
    "cert.footer1":
      "यह प्रमाणपत्र सत्यापित मिट्टी स्वास्थ्य और खेत डेटा पर आधारित कार्बन क्रेडिट को सत्यापित करता है।",
    "cert.footer2":
      "ये क्रेडिट कार्बनब्रिज बाज़ार में व्यापार के लिए सूचीबद्ध और उपलब्ध हैं।",

    // Credit Card
    "creditCard.credits": "{n} क्रेडिट",
    "creditCard.land": "भूमि",
    "creditCard.acres": "{n} एकड़",
    "creditCard.location": "स्थान",
    "creditCard.cost": "लागत",
    "creditCard.buyNow": "अभी खरीदें",

    // Map
    "map.noCredits": "नक्शे पर कोई क्रेडिट उपलब्ध नहीं",
    "map.creditsYear": "{n} क्रेडिट/वर्ष",
    "map.farmers": "{n} किसान",
    "map.more": "+{n} और",

    // Price Chart
    "chart.livePrice": "लाइव कार्बन क्रेडिट मूल्य",
    "chart.priceChart": "मूल्य चार्ट",
    "chart.today": "आज",
    "chart.yesterday": "कल",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "उफ़! पेज नहीं मिला",
    "notFound.home": "होम पर वापस जाएं",

    // Payment
    "pay.title": "सुरक्षित भुगतान",
    "pay.subtitle": "Stripe द्वारा संचालित",
    "pay.credits": "क्रेडिट",
    "pay.farmers": "किसान",
    "pay.total": "कुल",
    "pay.cardNumber": "कार्ड नंबर",
    "pay.expiry": "समाप्ति",
    "pay.cvc": "सीवीसी",
    "pay.payNow": "₹{amount} भुगतान करें",
    "pay.processing": "प्रसंस्करण...",
    "pay.secure": "Stripe एन्क्रिप्शन से सुरक्षित",
    "pay.failed": "भुगतान विफल। कृपया पुनः प्रयास करें।",
  },

  kn: {
    // Landing
    "landing.title": "ಕಾರ್ಬನ್‌ಬ್ರಿಡ್ಜ್",
    "landing.subtitle":
      "ಪರಿಶೀಲಿತ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್‌ಗಳ ಮೂಲಕ ರೈತರು ಮತ್ತು ಕಂಪನಿಗಳನ್ನು ಸಂಪರ್ಕಿಸುವುದು",
    "landing.farmer": "ರೈತ",
    "landing.farmerDesc":
      "ನಿಮ್ಮ ಭೂಮಿಯನ್ನು ನೋಂದಾಯಿಸಿ ಮತ್ತು ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಗಳಿಸಿ",
    "landing.buyer": "ಖರೀದಿದಾರ",
    "landing.buyerDesc": "ರೈತರಿಂದ ಪರಿಶೀಲಿತ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಖರೀದಿಸಿ",

    // Farmer Dashboard
    "farmer.dashboard": "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "farmer.logout": "ಲಾಗ್ಔಟ್",
    "farmer.registerFarm": "ನಿಮ್ಮ ಜಮೀನನ್ನು ನೋಂದಾಯಿಸಿ",
    "farmer.name": "ರೈತರ ಹೆಸರು",
    "farmer.namePlaceholder": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    "farmer.npk": "ಎನ್‌ಪಿಕೆ ಮೌಲ್ಯಗಳು (ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ)",
    "farmer.farmSize": "ಜಮೀನಿನ ಗಾತ್ರ (ಎಕರೆ)",
    "farmer.farmSizePlaceholder": "ಉದಾ. 5",
    "farmer.location": "ಸ್ಥಳ (ಅಕ್ಷಾಂಶ ಮತ್ತು ರೇಖಾಂಶ)",
    "farmer.latitude": "ಅಕ್ಷಾಂಶ",
    "farmer.longitude": "ರೇಖಾಂಶ",
    "farmer.calculate": "ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
    "farmer.yourCredits": "ನಿಮ್ಮ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್‌ಗಳು",
    "farmer.creditsYear": "{credits} ಕ್ರೆಡಿಟ್/ವರ್ಷ",
    "farmer.uniqueId": "ವಿಶಿಷ್ಟ ಐಡಿ:",
    "farmer.listedOnMarket": "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ",
    "farmer.viewCertificate": "ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಿಸಿ",
    "farmer.listOnMarket": "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ",
    "farmer.farmDetails": "ಜಮೀನಿನ ವಿವರಗಳು",
    "farmer.detailName": "ಹೆಸರು",
    "farmer.detailFarmSize": "ಜಮೀನಿನ ಗಾತ್ರ",
    "farmer.acres": "ಎಕರೆ",
    "farmer.detailNPK": "ಎನ್‌ಪಿಕೆ",
    "farmer.detailLocation": "ಸ್ಥಳ",
    "farmer.creditsFrequency": "ಕ್ರೆಡಿಟ್ ಆವರ್ತನ",
    "farmer.perYear": "ಪ್ರತಿ ವರ್ಷ",
    "farmer.registered": "ನೋಂದಾಯಿತ",
    "farmer.fillAll": "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    "farmer.creditsCalculated":
      "🎉 ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಲೆಕ್ಕಾಚಾರ: {credits} ಕ್ರೆಡಿಟ್/ವರ್ಷ!",
    "farmer.listedSuccess":
      "✅ ಕ್ರೆಡಿಟ್ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ! ಪ್ರಮಾಣಪತ್ರ ರಚಿಸಲಾಗಿದೆ.",
    "farmer.loggedOut": "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ಔಟ್ ಆಯಿತು",

    // Buyer Login
    "buyer.login": "ಖರೀದಿದಾರ ಲಾಗಿನ್",
    "buyer.createAccount": "ಖಾತೆ ರಚಿಸಿ",
    "buyer.signInSubtitle": "ಮಾರುಕಟ್ಟೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "buyer.registerSubtitle": "ನಿಮ್ಮ ಕಂಪನಿಯನ್ನು ನೋಂದಾಯಿಸಿ",
    "buyer.companyName": "ಕಂಪನಿ ಹೆಸರು",
    "buyer.companyPlaceholder": "ಕಂಪನಿ ಹೆಸರು ನಮೂದಿಸಿ",
    "buyer.phone": "ಫೋನ್ ಸಂಖ್ಯೆ",
    "buyer.phonePlaceholder": "ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    "buyer.password": "ಪಾಸ್‌ವರ್ಡ್",
    "buyer.passwordPlaceholder": "ಬಲವಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    "buyer.signIn": "ಸೈನ್ ಇನ್",
    "buyer.alreadyAccount": "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "buyer.noAccount": "ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ",
    "buyer.backHome": "← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    "buyer.fillAll": "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    "buyer.enterCompany": "ದಯವಿಟ್ಟು ಕಂಪನಿ ಹೆಸರು ನಮೂದಿಸಿ",
    "buyer.passwordLength": "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು",
    "buyer.accountCreated": "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ! 🏢",
    "buyer.welcomeBack": "ಮರಳಿ ಸ್ವಾಗತ, {name}! 🏢",
    "buyer.invalidCreds": "ಅಮಾನ್ಯ ಪ್ರಮಾಣಪತ್ರಗಳು",

    // Market
    "market.title": "ಮಾರುಕಟ್ಟೆ",
    "market.price": "ಬೆಲೆ: ",
    "market.perCredit": "/ಕ್ರೆಡಿಟ್",
    "market.credits": "ಕ್ರೆಡಿಟ್",
    "market.bulkBuy": "ಥೋಕ ಖರೀದಿ",
    "market.map": "ನಕ್ಷೆ",
    "market.priceTab": "ಬೆಲೆ",
    "market.noCredits": "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಲಭ್ಯವಿಲ್ಲ",
    "market.bulkCredits": "ಥೋಕ ಕ್ರೆಡಿಟ್",
    "market.bulkDesc":
      "ನಿಮ್ಮ ಅಗತ್ಯವನ್ನು ಪೂರೈಸಲು ಹಲವು ರೈತರಿಂದ ಒಮ್ಮೆಗೆ ಕ್ರೆಡಿಟ್ ಖರೀದಿಸಿ.",
    "market.creditsNeeded": "ಅಗತ್ಯ ಕ್ರೆಡಿಟ್",
    "market.creditsPlaceholder": "ಉದಾ. 50",
    "market.estimatedCost": "ಅಂದಾಜು ವೆಚ್ಚ",
    "market.available": "ಲಭ್ಯ",
    "market.creditsSuffix": "ಕ್ರೆಡಿಟ್",
    "market.buyBulk": "ಥೋಕ ಕ್ರೆಡಿಟ್ ಖರೀದಿಸಿ",
    "market.creditLocations": "ಕ್ರೆಡಿಟ್ ಸ್ಥಳಗಳು",
    "market.purchased": "🎉 {credits} ಕ್ರೆಡಿಟ್ ₹{cost} ಗೆ ಖರೀದಿಸಲಾಗಿದೆ!",
    "market.invalidAmount": "ಮಾನ್ಯ ಕ್ರೆಡಿಟ್ ಮೊತ್ತ ನಮೂದಿಸಿ",
    "market.notEnough": "ಸಾಕಷ್ಟು ಕ್ರೆಡಿಟ್ ಲಭ್ಯವಿಲ್ಲ. {credits} ಕ್ರೆಡಿಟ್ ಕೊರತೆ.",
    "market.bulkPurchased":
      "🎉 ಥೋಕ ಖರೀದಿ: {count} ರೈತರಿಂದ {credits} ಕ್ರೆಡಿಟ್ ₹{cost} ಗೆ!",

    // Certificate
    "cert.title": "ನಿಮ್ಮ ಪ್ರಮಾಣಪತ್ರ",
    "cert.carbonCreditCert": "ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಪ್ರಮಾಣಪತ್ರ",
    "cert.certifies": "ಇದು ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ",
    "cert.awarded": "ಗೆ ನೀಡಲಾಗಿದೆ",
    "cert.creditsYear": "ಕ್ರೆಡಿಟ್/ವರ್ಷ",
    "cert.uniqueId": "ವಿಶಿಷ್ಟ ಐಡಿ",
    "cert.farmSize": "ಜಮೀನಿನ ಗಾತ್ರ",
    "cert.acres": "ಎಕರೆ",
    "cert.issuedDate": "ಬಿಡುಗಡೆ ದಿನಾಂಕ",
    "cert.location": "ಸ್ಥಳ",
    "cert.issuedOn": "{date} ರಂದು {time} ಕ್ಕೆ ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ",
    "cert.download": "ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    "cert.certId": "ಪ್ರಮಾಣಪತ್ರ ಐಡಿ",
    "cert.footer1":
      "ಈ ಪ್ರಮಾಣಪತ್ರವು ಪರಿಶೀಲಿತ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ಜಮೀನಿನ ದತ್ತಾಂಶದ ಆಧಾರದ ಮೇಲೆ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಅನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
    "cert.footer2":
      "ಈ ಕ್ರೆಡಿಟ್‌ಗಳನ್ನು ಕಾರ್ಬನ್‌ಬ್ರಿಡ್ಜ್ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ವ್ಯಾಪಾರಕ್ಕೆ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ.",

    // Credit Card
    "creditCard.credits": "{n} ಕ್ರೆಡಿಟ್",
    "creditCard.land": "ಭೂಮಿ",
    "creditCard.acres": "{n} ಎಕರೆ",
    "creditCard.location": "ಸ್ಥಳ",
    "creditCard.cost": "ವೆಚ್ಚ",
    "creditCard.buyNow": "ಈಗ ಖರೀದಿಸಿ",

    // Map
    "map.noCredits": "ನಕ್ಷೆಯಲ್ಲಿ ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಲಭ್ಯವಿಲ್ಲ",
    "map.creditsYear": "{n} ಕ್ರೆಡಿಟ್/ವರ್ಷ",
    "map.farmers": "{n} ರೈತ(ರು)",
    "map.more": "+{n} ಇನ್ನಷ್ಟು",

    // Price Chart
    "chart.livePrice": "ಲೈವ್ ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ ಬೆಲೆ",
    "chart.priceChart": "ಬೆಲೆ ಚಾರ್ಟ್",
    "chart.today": "ಇಂದು",
    "chart.yesterday": "ನಿನ್ನೆ",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "ಅಯ್ಯೋ! ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ",
    "notFound.home": "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",

    // Payment
    "pay.title": "ಸುರಕ್ಷಿತ ಪಾವತಿ",
    "pay.subtitle": "Stripe ನಿಂದ ನಡೆಸಲ್ಪಟ್ಟಿದೆ",
    "pay.credits": "ಕ್ರೆಡಿಟ್",
    "pay.farmers": "ರೈತರು",
    "pay.total": "ಒಟ್ಟು",
    "pay.cardNumber": "ಕಾರ್ಡ್ ಸಂಖ್ಯೆ",
    "pay.expiry": "ಅವಧಿ",
    "pay.cvc": "ಸಿವಿಸಿ",
    "pay.payNow": "₹{amount} ಪಾವತಿಸಿ",
    "pay.processing": "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
    "pay.secure": "Stripe ಎನ್‌ಕ್ರಿಪ್ಷನ್‌ನಿಂದ ಸುರಕ್ಷಿತ",
    "pay.failed": "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("cc_language");
    return (saved as Language) || "en";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("cc_language", newLang);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let text = translations[lang][key] || translations.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
};
