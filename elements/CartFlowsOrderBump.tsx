"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Text, NumberControl } from "@/components/builder/controls";

function CartFlowsOrderBumpFrontend({ element }: { element: any }) {
    const s = element.schema;
    const title = s.content?.title || "Special One-Time Offer!";
    const description = s.content?.description || "Click to add this item to your order right now for a special price.";
    const price = s.content?.price ?? 19.99;
    const originalPrice = s.content?.original_price ?? 39.99;

    const [checked, setChecked] = useState(false);

    return (
        <div className={`border-2 border-dashed rounded-2xl p-5 transition-all ${
            checked ? "bg-amber-50 border-amber-500 shadow-md" : "bg-white border-amber-300 hover:border-amber-400"
        }`}>
            <label className="flex items-start gap-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="mt-1 w-6 h-6 accent-amber-600 rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5 shadow-xs">
                        <Icon icon="solar:star-bold" width={12} />
                        Exclusive Add-On
                    </span>
                    <h4 className="text-base font-bold text-gray-900 leading-snug">{title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{description}</p>

                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-700">${Number(price).toFixed(2)}</span>
                        {originalPrice > price && (
                            <span className="text-xs text-gray-400 line-through">${Number(originalPrice).toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </label>
        </div>
    );
}

const cartFlowsOrderBumpElement = {
    type: "cartflows-order-bump",
    category: "cartflows",
    label: "CartFlows Order Bump Widget",
    icon: "solar:star-bold-duotone",

    schema: {
        content: {
            title: "Special One-Time Offer!",
            description: "Click to add this item to your order right now for a special price.",
            price: 19.99,
            original_price: 39.99,
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Order Bump Settings",
            controls: [
                {
                    name: "title",
                    render: (val: any, onChange: any) => (
                        <Text label="Offer Headline" value={val ?? "Special One-Time Offer!"} onChange={onChange} />
                    ),
                },
                {
                    name: "description",
                    render: (val: any, onChange: any) => (
                        <Text label="Offer Description" value={val ?? "Click to add this item..."} onChange={onChange} />
                    ),
                },
                {
                    name: "price",
                    render: (val: any, onChange: any) => (
                        <NumberControl label="Bump Price ($)" value={val ?? 19.99} onChange={onChange} min={0} />
                    ),
                },
                {
                    name: "original_price",
                    render: (val: any, onChange: any) => (
                        <NumberControl label="Original Price ($)" value={val ?? 39.99} onChange={onChange} min={0} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsOrderBumpFrontend element={element} />,
};

export default cartFlowsOrderBumpElement;
