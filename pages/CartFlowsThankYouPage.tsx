"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export interface CartFlowsThankYouPageProps {
    flowSlug: string;
}

export default function CartFlowsThankYouPage({ flowSlug }: CartFlowsThankYouPageProps) {
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setOrderId(urlParams.get("orderId") || "CF-" + Math.floor(100000 + Math.random() * 900000));
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6 border border-gray-100">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Icon icon="solar:check-circle-bold" width={36} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900">Order Confirmed!</h1>
                    <p className="text-xs text-gray-500">Thank you for your purchase. Your order has been placed successfully.</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Order Number:</span>
                        <span className="font-mono font-bold text-gray-800">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-semibold text-emerald-600 uppercase">Processing</span>
                    </div>
                </div>

                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white text-sm font-bold transition shadow-md"
                    >
                        <Icon icon="solar:home-2-bold" width={18} />
                        Return to Store
                    </Link>
                </div>
            </div>
        </main>
    );
}
