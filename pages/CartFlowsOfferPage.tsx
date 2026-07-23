"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

export interface CartFlowsOfferPageProps {
    flowSlug: string;
    stepSlug?: string;
}

export default function CartFlowsOfferPage({ flowSlug, stepSlug }: CartFlowsOfferPageProps) {
    const [submitting, setSubmitting] = useState(false);

    const handleAccept = async () => {
        setSubmitting(true);
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get("orderId") || "";
            window.location.href = `/funnel/${flowSlug}/thankyou?orderId=${orderId}`;
        }, 1000);
    };

    const handleDecline = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get("orderId") || "";
        window.location.href = `/funnel/${flowSlug}/thankyou?orderId=${orderId}`;
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-2xl w-full bg-linear-to-b from-slate-900 to-indigo-950 border border-indigo-800/50 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    <Icon icon="solar:fire-bold" width={16} className="text-rose-400 animate-pulse" />
                    Special One-Time Post-Purchase Offer
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                        Wait! Upgrade Your Order & Save 50%
                    </h1>
                    <p className="text-sm text-indigo-200/80 max-w-lg mx-auto">
                        Add this complementary product to your purchase now with 1-click checkout. No need to re-enter payment details!
                    </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Exclusive Deal Price</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl sm:text-5xl font-black text-emerald-400">$29.99</span>
                        <span className="text-lg text-indigo-300/50 line-through">$59.99</span>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <button
                        type="button"
                        onClick={handleAccept}
                        disabled={submitting}
                        className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg sm:text-xl font-black shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        {submitting ? "Adding Offer..." : "Yes! Add This To My Order • $29.99"}
                    </button>

                    <button
                        type="button"
                        onClick={handleDecline}
                        className="text-xs font-bold text-indigo-300 hover:text-white transition underline block mx-auto py-1"
                    >
                        No thanks, skip this offer and complete order
                    </button>
                </div>
            </div>
        </main>
    );
}
