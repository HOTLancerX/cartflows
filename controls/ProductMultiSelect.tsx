"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export interface ProductMultiSelectProps {
    value: string[];
    onChange: (selectedIds: string[]) => void;
}

export default function ProductMultiSelect({ value = [], onChange }: ProductMultiSelectProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cartflows/products", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (d && Array.isArray(d.products)) {
                    setProducts(d.products);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleProduct = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((item) => item !== id));
        } else {
            onChange([...value, id]);
        }
    };

    if (loading) {
        return (
            <div className="py-3 text-xs text-gray-400 flex items-center gap-1.5">
                <Icon icon="svg-spinners:ring-resize" width={14} />
                Loading product catalog...
            </div>
        );
    }

    if (!products.length) {
        return <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">No published products found in store.</div>;
    }

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">Select Checkout Product(s)</label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-white">
                {products.map((p) => {
                    const isSelected = value.includes(p._id);
                    return (
                        <div
                            key={p._id}
                            onClick={() => toggleProduct(p._id)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition ${
                                isSelected
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                                    : "bg-white border-gray-100 text-gray-700 hover:border-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 accent-emerald-600 rounded shrink-0 cursor-pointer"
                                />
                                <span className="truncate">{p.title}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 shrink-0">${p.price.toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>
            <p className="text-[10px] text-gray-400">{value.length} product(s) selected for checkout.</p>
        </div>
    );
}
