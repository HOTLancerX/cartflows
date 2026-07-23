"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";
import FunnelEditor from "./FunnelEditor";

export default function CartFlowsManager() {
    const [loading, setLoading] = useState(true);
    const [funnels, setFunnels] = useState<any[]>([]);
    const [activeFunnel, setActiveFunnel] = useState<any | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFunnelName, setNewFunnelName] = useState("");
    const [creating, setCreating] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const loadFunnels = async () => {
        setLoading(true);
        try {
            const res = await xFetch("/cartflows");
            const data = await res.json();
            if (data && Array.isArray(data.funnels)) {
                setFunnels(data.funnels);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFunnels();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFunnelName.trim()) return;

        setCreating(true);
        setErrorMsg("");
        try {
            const res = await xFetch("/cartflows", {
                method: "POST",
                body: JSON.stringify({ name: newFunnelName.trim() }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || "Failed to create funnel");
            }
            setShowCreateModal(false);
            setNewFunnelName("");
            await loadFunnels();
            setActiveFunnel(data);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to create funnel.");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveFunnel = async (updated: any) => {
        const res = await xFetch("/cartflows", {
            method: "PUT",
            body: JSON.stringify(updated),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
            throw new Error(data.error || "Failed to save funnel");
        }
        await loadFunnels();
        setActiveFunnel(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sales funnel?")) return;
        try {
            await xFetch(`/cartflows?id=${id}`, { method: "DELETE" });
            await loadFunnels();
            if (activeFunnel?._id === id) setActiveFunnel(null);
        } catch {}
    };

    if (activeFunnel) {
        return (
            <FunnelEditor
                funnel={activeFunnel}
                onSave={handleSaveFunnel}
                onClose={() => setActiveFunnel(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
                <Icon icon="svg-spinners:ring-resize" width={28} />
                <span>Loading Sales Funnels...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Icon icon="solar:funnel-bold" className="text-emerald-600" width={28} />
                        CartFlows Sales Funnels
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Build high-converting checkout flows, order bumps, and 1-click upsells.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                    <Icon icon="solar:add-circle-bold" width={16} />
                    Create New Funnel
                </button>
            </div>

            {/* Funnel Grid */}
            {funnels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Icon icon="solar:funnel-bold-duotone" width={36} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Sales Funnels Created Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Click "Create New Funnel" above to build your first checkout flow with order bumps and upsells.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {funnels.map((flow) => {
                        const views = flow.analytics?.views || 0;
                        const orders = flow.analytics?.orders || 0;
                        const convRate = views > 0 ? ((orders / views) * 100).toFixed(1) + "%" : "0.0%";
                        const revenue = (flow.analytics?.totalRevenue || 0).toFixed(2);
                        const stepCount = flow.steps?.length || 0;

                        return (
                            <div
                                key={flow._id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                                {flow.status}
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 mt-1">{flow.name}</h3>
                                            <p className="text-[11px] text-gray-400 font-mono">/funnel/{flow.slug}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(flow._id)}
                                            className="text-gray-300 hover:text-rose-500 p-1 transition"
                                            title="Delete Funnel"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" width={16} />
                                        </button>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-4 text-center">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium">Views</p>
                                            <p className="text-xs font-bold text-gray-800">{views}</p>
                                        </div>
                                        <div className="border-x border-gray-200">
                                            <p className="text-[10px] text-gray-400 font-medium">Orders</p>
                                            <p className="text-xs font-bold text-emerald-700">{orders}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium">Conv. Rate</p>
                                            <p className="text-xs font-bold text-indigo-600">{convRate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium">{stepCount} Steps</span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveFunnel(flow)}
                                        className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1"
                                    >
                                        <Icon icon="solar:pen-bold" width={12} />
                                        Edit Funnel
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE FUNNEL MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Create New Sales Funnel</h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Icon icon="solar:close-circle-bold" width={20} />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Funnel Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. VIP Checkout Funnel"
                                    value={newFunnelName}
                                    onChange={(e) => setNewFunnelName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Funnel"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
