"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";

export interface CartFlowsCheckoutPageProps {
    flowSlug: string;
    stepSlug?: string;
}

export default function CartFlowsCheckoutPage({ flowSlug, stepSlug }: CartFlowsCheckoutPageProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedBump, setSelectedBump] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        shippingAddress: "",
        city: "",
        paymentMethod: "cod",
    });

    useEffect(() => {
        if (!flowSlug) {
            setLoading(false);
            return;
        }

        const url = `/cartflows/checkout?flowSlug=${flowSlug}${stepSlug ? `&stepSlug=${stepSlug}` : ""}`;
        xFetch(url)
            .then((r) => r.json())
            .then((d) => {
                if (d && !d.error) {
                    setData(d);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [flowSlug, stepSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!form.customerName.trim() || !form.customerPhone.trim()) {
            setErrorMsg("Customer name and phone number are required.");
            return;
        }

        if (!data?.flow?._id) {
            setErrorMsg("Funnel context invalid.");
            return;
        }

        setSubmitting(true);
        try {
            const prod = data.product;
            const items = prod
                ? [
                      {
                          productId: prod._id,
                          productSlug: prod.slug,
                          productTitle: prod.title,
                          price: prod.calc?.discountedPrice ?? prod.basePrice,
                          quantity: 1,
                      },
                  ]
                : [];

            const orderBumpItem = data.orderBumpProduct
                ? {
                      productId: data.orderBumpProduct._id,
                      productSlug: data.orderBumpProduct.slug,
                      productTitle: data.orderBumpProduct.title,
                      price: data.step?.orderBump?.price || data.orderBumpProduct.basePrice,
                      quantity: 1,
                  }
                : null;

            const res = await xFetch("/cartflows/process", {
                method: "POST",
                body: JSON.stringify({
                    flowId: data.flow._id,
                    stepId: data.step?.id,
                    ...form,
                    items,
                    includeOrderBump: selectedBump,
                    orderBumpItem,
                }),
            });

            const result = await res.json();
            if (!res.ok || result.error) {
                throw new Error(result.error || "Order placement failed");
            }

            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to process checkout.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-400 gap-2">
                <Icon icon="svg-spinners:ring-resize" width={24} />
                <span>Loading Sales Funnel Checkout...</span>
            </div>
        );
    }

    if (!data || !data.flow) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <Icon icon="solar:shield-warning-bold" width={48} className="text-amber-500 mb-3" />
                <h2 className="text-xl font-bold text-gray-800">Checkout Step Unavailable</h2>
                <p className="text-sm text-gray-500 mt-1">This checkout funnel step could not be found or is inactive.</p>
            </div>
        );
    }

    const prod = data.product;
    const bump = data.step?.orderBump;
    const bumpProd = data.orderBumpProduct;

    const basePrice = prod ? (prod.calc?.discountedPrice ?? prod.basePrice) : 0;
    const bumpPrice = selectedBump && bump ? (bump.price || bumpProd?.basePrice || 0) : 0;
    const totalPrice = basePrice + bumpPrice;

    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            Secure Funnel Checkout
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">{data.flow.name}</h1>
                        <p className="text-emerald-100 text-xs sm:text-sm mt-1">{data.step?.title || "Complete Your Order"}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-bold shrink-0">
                        <Icon icon="solar:lock-keyhole-bold" width={18} className="text-emerald-300" />
                        256-Bit SSL Encrypted
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Column */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Icon icon="solar:user-bold" className="text-emerald-600" width={20} />
                            Customer & Delivery Details
                        </h3>

                        {errorMsg && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your full name"
                                    value={form.customerName}
                                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Mobile phone number"
                                        value={form.customerPhone}
                                        onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={form.customerEmail}
                                        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Full Address</label>
                                <textarea
                                    rows={2}
                                    placeholder="House, Street, Area..."
                                    value={form.shippingAddress}
                                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                />
                            </div>

                            {/* ORDER BUMP CHECKBOX CARD */}
                            {bump?.enabled && (
                                <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-5 transition hover:border-amber-400 space-y-2">
                                    <label className="flex items-start gap-3.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedBump}
                                            onChange={(e) => setSelectedBump(e.target.checked)}
                                            className="mt-1 w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0"
                                        />
                                        <div className="flex-1">
                                            <span className="inline-block bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                                                EXCLUSIVE ADD-ON
                                            </span>
                                            <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                                {bump.title || bumpProd?.title || "Add Special Bump Offer!"}
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                {bump.description || "Yes! Add this special offer to my order."}
                                            </p>
                                            <p className="text-sm font-black text-amber-700 mt-2">
                                                +${(bump.price || bumpProd?.basePrice || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-black shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition disabled:opacity-50 mt-4"
                            >
                                {submitting ? "Processing Order..." : `Place Order Now • $${totalPrice.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Icon icon="solar:bag-bold" className="text-emerald-600" width={20} />
                            Order Summary
                        </h3>

                        {prod ? (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{prod.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Quantity: 1</p>
                                    </div>
                                    <span className="text-sm font-extrabold text-gray-900">${basePrice.toFixed(2)}</span>
                                </div>

                                {selectedBump && bump && (
                                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 bg-amber-50/50 p-3 rounded-xl">
                                        <div>
                                            <p className="text-xs font-bold text-amber-900">
                                                {bump.title || bumpProd?.title || "Order Bump Offer"}
                                            </p>
                                            <p className="text-[11px] text-amber-700 font-medium">1-Click Bump Add-on</p>
                                        </div>
                                        <span className="text-xs font-extrabold text-amber-900">+${bumpPrice.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="space-y-2 pt-2 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-800">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-gray-100 text-base font-black text-gray-900">
                                        <span>Total Amount</span>
                                        <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No primary product assigned to this funnel step.</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
