"use client";

import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentP from "@/components/user/PaymentP";

export default function UserPaymentPage() {
  return (
    <>
      <HeaderNav title="Bezahlung" />

      <PaymentP />
    </>
  );
}
