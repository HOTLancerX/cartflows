"use client";

import React from "react";
import { Icon } from "@iconify/react";

export interface OrderBumpConfigProps {
    orderBump: any;
    onChange: (updated: any) => void;
}

export default function OrderBumpConfig({ orderBump, onChange }: OrderBumpConfigProps) {
    const bump = orderBump || {
        enabled: false,
        title: "",
        subtitle: "",
        description: "",
        price: 0,
        originalPrice: 0,
        position: "after_checkout",
    };

    const update = (key: string, val: any) => {
        onChange({ ...bump, [key]: val });
    };

    return (
        <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon icon="solar:star-bold" className="text-amber-500" width={20} />
                    <h4 className="text-sm font-bold text-gray-900">Order Bump Offer Settings</h4>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={bump.enabled}
                        onChange={(e) => update("enabled", e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    Enable Order Bump
                </label>
            </div>

            {bump.enabled && (
                <div className="space-y-4 pt-2 border-t border-amber-200/50 text-xs">
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Bump Headline Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Yes! Add Lifetime Support for $19"
                            value={bump.title || ""}
                            onChange={(e) => update("title", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Bump Description</label>
                        <textarea
                            rows={2}
                            placeholder="Explain the special one-time offer benefits..."
                            value={bump.description || ""}
                            onChange={(e) => update("description", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Bump Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={bump.price ?? 0}
                                onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500 bg-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Original Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={bump.originalPrice ?? 0}
                                onChange={(e) => update("originalPrice", parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500 bg-white font-mono"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
