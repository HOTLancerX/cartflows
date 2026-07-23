"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Text, NumberControl } from "@/components/builder/controls";

function CartFlowsOfferFrontend({ element }: { element: any }) {
    const s = element.schema;
    const title = s.content?.title || "Wait! Upgrade Your Order & Save 50%";
    const subtitle = s.content?.subtitle || "Add this exclusive deal before your order is processed!";
    const acceptText = s.content?.accept_text || "Yes! Add This To My Order";
    const declineText = s.content?.decline_text || "No thanks, skip this offer";
    const price = s.content?.price ?? 29.99;
    const originalPrice = s.content?.original_price ?? 59.99;

    return (
        <div className="max-w-xl mx-auto bg-linear-to-b from-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-2xl text-center border border-indigo-700/50 space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Icon icon="solar:fire-bold" width={14} className="text-rose-400" />
                One Time Upsell Offer
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white">{title}</h2>
                <p className="text-sm text-indigo-200">{subtitle}</p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xs border border-white/10 space-y-2">
                <p className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Exclusive Special Price</p>
                <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-black text-emerald-400">${Number(price).toFixed(2)}</span>
                    {originalPrice > price && (
                        <span className="text-lg text-indigo-300/60 line-through">${Number(originalPrice).toFixed(2)}</span>
                    )}
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <button
                    type="button"
                    onClick={() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const orderId = urlParams.get("orderId") || "";
                        alert("Upsell offer accepted! Item added to order #" + (orderId || "new"));
                    }}
                    className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-black shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition"
                >
                    {acceptText} • ${Number(price).toFixed(2)}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        alert("Offer declined. Proceeding to thank you page.");
                    }}
                    className="text-xs font-semibold text-indigo-300 hover:text-white transition underline block mx-auto py-1"
                >
                    {declineText}
                </button>
            </div>
        </div>
    );
}

const cartFlowsOfferElement = {
    type: "cartflows-offer",
    category: "cartflows",
    label: "CartFlows Upsell / Downsell Card",
    icon: "solar:fire-bold-duotone",

    schema: {
        content: {
            title: "Wait! Upgrade Your Order & Save 50%",
            subtitle: "Add this exclusive deal before your order is processed!",
            accept_text: "Yes! Add This To My Order",
            decline_text: "No thanks, skip this offer",
            price: 29.99,
            original_price: 59.99,
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Upsell / Downsell Settings",
            controls: [
                {
                    name: "title",
                    render: (val: any, onChange: any) => (
                        <Text label="Offer Headline" value={val ?? "Wait! Upgrade Your Order"} onChange={onChange} />
                    ),
                },
                {
                    name: "subtitle",
                    render: (val: any, onChange: any) => (
                        <Text label="Sub-headline" value={val ?? "Add this exclusive deal..."} onChange={onChange} />
                    ),
                },
                {
                    name: "accept_text",
                    render: (val: any, onChange: any) => (
                        <Text label="Accept Button CTA" value={val ?? "Yes! Add This To My Order"} onChange={onChange} />
                    ),
                },
                {
                    name: "decline_text",
                    render: (val: any, onChange: any) => (
                        <Text label="Decline Text" value={val ?? "No thanks, skip this offer"} onChange={onChange} />
                    ),
                },
                {
                    name: "price",
                    render: (val: any, onChange: any) => (
                        <NumberControl label="Special Upsell Price ($)" value={val ?? 29.99} onChange={onChange} min={0} />
                    ),
                },
                {
                    name: "original_price",
                    render: (val: any, onChange: any) => (
                        <NumberControl label="Original Price ($)" value={val ?? 59.99} onChange={onChange} min={0} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsOfferFrontend element={element} />,
};

export default cartFlowsOfferElement;
