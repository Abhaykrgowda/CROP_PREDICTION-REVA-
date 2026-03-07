

## Plan: Set Default OTP to 1111

Change the OTP generation in `src/pages/FarmerLogin.tsx` from a random 4-digit code to a hardcoded `"1111"`.

**Change**: In `sendOtp()`, replace `Math.floor(1000 + Math.random() * 9000).toString()` with `"1111"`.

