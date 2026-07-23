"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import OrderBumpConfig from "./OrderBumpConfig";

export interface FunnelEditorProps {
    funnel: any;
    onSave: (updatedFunnel: any) => Promise<void>;
    onClose: () => void;
}

const STEP_ICONS: Record<string, string> = {
    landing: "solar:file-text-bold",
    checkout: "solar:cart-check-bold",
    upsell: "solar:fire-bold",
    downsell: "solar:alt-arrow-down-bold",
    thankyou: "solar:check-circle-bold",
};

export default function FunnelEditor({ funnel, onSave, onClose }: FunnelEditorProps) {
    const [name, setName] = useState(funnel.name);
    const [slug, setSlug] = useState(funnel.slug);
    const [steps, setSteps] = useState<any[]>(funnel.steps || []);
    const [selectedStepId, setSelectedStepId] = useState<string>(funnel.steps?.[0]?.id || "");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const selectedStep = steps.find((s) => s.id === selectedStepId);

    const updateSelectedStep = (key: string, val: any) => {
        setSteps((prev) =>
            prev.map((s) => (s.id === selectedStepId ? { ...s, [key]: val } : s))
        );
    };

    const addStep = (type: "landing" | "checkout" | "upsell" | "downsell" | "thankyou") => {
        const newStep = {
            id: "step_" + type + "_" + Date.now(),
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1) + " Step",
            slug: type + "-" + (steps.length + 1),
            orderBump: { enabled: false },
        };
        setSteps([...steps, newStep]);
        setSelectedStepId(newStep.id);
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) return;
        const filtered = steps.filter((s) => s.id !== id);
        setSteps(filtered);
        if (selectedStepId === id) {
            setSelectedStepId(filtered[0]?.id || "");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg("");
        try {
            await onSave({
                ...funnel,
                name,
                slug,
                steps,
            });
            setMsg("Funnel updated successfully!");
            setTimeout(() => setMsg(""), 3000);
        } catch {
            setMsg("Failed to save funnel.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                        <Icon icon="solar:arrow-left-bold" width={18} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editing Funnel: {funnel.name}</h2>
                        <p className="text-xs text-gray-500 font-mono">/funnel/{slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {msg && <span className="text-xs font-semibold text-emerald-600">{msg}</span>}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Icon icon="svg-spinners:ring-resize" width={14} />}
                        Save Funnel
                    </button>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Step Sequence */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Funnel Steps ({steps.length})</h3>
                    </div>

                    <div className="space-y-2">
                        {steps.map((step, idx) => {
                            const isSel = step.id === selectedStepId;
                            const icon = STEP_ICONS[step.type] || "solar:file-bold";
                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setSelectedStepId(step.id)}
                                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                                        isSel
                                            ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <span className="text-xs font-mono font-bold text-gray-400 w-4">{idx + 1}</span>
                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                                        <Icon icon={icon} width={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 truncate">{step.title}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">{step.type} • /{step.slug}</p>
                                    </div>
                                    {steps.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeStep(step.id);
                                            }}
                                            className="text-gray-300 hover:text-rose-500 p-1 transition"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" width={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Step Buttons */}
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-400 mb-2">Add New Step:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {(["checkout", "upsell", "downsell", "thankyou"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => addStep(t)}
                                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-semibold text-gray-600 capitalize transition border border-gray-200"
                                >
                                    + {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Step Config Panel */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
                    {selectedStep ? (
                        <>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                        {selectedStep.type} Step
                                    </span>
                                    <h3 className="text-base font-bold text-gray-900 mt-1">{selectedStep.title}</h3>
                                </div>
                                <a
                                    href={`/funnel/${slug}/${selectedStep.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                                >
                                    <Icon icon="solar:link-bold" width={14} />
                                    Preview Step Page
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Step Title</label>
                                    <input
                                        type="text"
                                        value={selectedStep.title}
                                        onChange={(e) => updateSelectedStep("title", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Step Slug</label>
                                    <input
                                        type="text"
                                        value={selectedStep.slug}
                                        onChange={(e) => updateSelectedStep("slug", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-500 font-mono"
                                    />
                                </div>
                            </div>

                            {/* DISCOUNT CONFIG */}
                            {selectedStep.type === "checkout" && (
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Step Product Discount</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Discount Type</label>
                                            <select
                                                value={selectedStep.discountType || "none"}
                                                onChange={(e) => updateSelectedStep("discountType", e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-500"
                                            >
                                                <option value="none">No Discount</option>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount ($)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Discount Value</label>
                                            <input
                                                type="number"
                                                value={selectedStep.discountValue || 0}
                                                onChange={(e) => updateSelectedStep("discountValue", parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ORDER BUMP CONFIG FOR CHECKOUT STEP */}
                            {selectedStep.type === "checkout" && (
                                <OrderBumpConfig
                                    orderBump={selectedStep.orderBump}
                                    onChange={(updated) => updateSelectedStep("orderBump", updated)}
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">Select a step to configure.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
