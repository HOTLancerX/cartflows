"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Text, Select } from "@/components/builder/controls";
import { xFetch } from "@/lib/express";

function CartFlowsCheckoutFrontend({ element }: { element: any }) {
    const s = element.schema;
    const title = s.content?.title ?? "Express Checkout";
    const flowSlug = s.content?.flow_slug || "";
    const buttonText = s.content?.button_text || "Complete Order";

    const [loading, setLoading] = useState(true);
    const [stepData, setStepData] = useState<any>(null);
    const [selectedBump, setSelectedBump] = useState(false);

    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        shippingAddress: "",
        paymentMethod: "cod",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!flowSlug) {
            setLoading(false);
            return;
        }

        xFetch(`/cartflows/checkout?flowSlug=${flowSlug}`)
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) {
                    setStepData(data);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [flowSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!form.customerName.trim() || !form.customerPhone.trim()) {
            setErrorMsg("Please fill in your name and phone number.");
            return;
        }

        if (!stepData?.flow?._id) {
            setErrorMsg("Invalid funnel checkout context.");
            return;
        }

        setSubmitting(true);
        try {
            const product = stepData.product;
            const items = product
                ? [
                      {
                          productId: product._id,
                          productSlug: product.slug,
                          productTitle: product.title,
                          price: product.calc?.discountedPrice || product.basePrice,
                          quantity: 1,
                      },
                  ]
                : [];

            const orderBumpItem = stepData.orderBumpProduct
                ? {
                      productId: stepData.orderBumpProduct._id,
                      productSlug: stepData.orderBumpProduct.slug,
                      productTitle: stepData.orderBumpProduct.title,
                      price: stepData.step?.orderBump?.price || stepData.orderBumpProduct.basePrice,
                      quantity: 1,
                  }
                : null;

            const res = await xFetch("/cartflows/process", {
                method: "POST",
                body: JSON.stringify({
                    flowId: stepData.flow._id,
                    stepId: stepData.step?.id,
                    ...form,
                    items,
                    includeOrderBump: selectedBump,
                    orderBumpItem,
                }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || "Order placement failed");
            }

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to process order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-400 flex items-center justify-center gap-2">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                Loading CartFlows Checkout...
            </div>
        );
    }

    const prod = stepData?.product;
    const bump = stepData?.step?.orderBump;
    const bumpProd = stepData?.orderBumpProduct;

    const baseAmount = prod ? (prod.calc?.discountedPrice ?? prod.basePrice) : 0;
    const bumpAmount = selectedBump && bump ? (bump.price || bumpProd?.basePrice || 0) : 0;
    const totalAmount = baseAmount + bumpAmount;

    return (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Icon icon="solar:cart-check-bold" className="text-emerald-600" width={24} />
                    {title}
                </h3>
            </div>

            {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {errorMsg}
                </div>
            )}

            {/* Product Summary */}
            {prod && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-800">{prod.title}</p>
                        {prod.calc?.savingsAmount > 0 && (
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                Special Funnel Discount Applied!
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-base font-extrabold text-gray-900">${baseAmount.toFixed(2)}</p>
                        {prod.calc?.savingsAmount > 0 && (
                            <p className="text-xs text-gray-400 line-through">${prod.basePrice.toFixed(2)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={form.customerName}
                            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            placeholder="+1 234 567 890"
                            value={form.customerPhone}
                            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        value={form.customerEmail}
                        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shipping Address</label>
                    <textarea
                        rows={2}
                        placeholder="Street Address, Suite..."
                        value={form.shippingAddress}
                        onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* ORDER BUMP SECTION */}
                {bump?.enabled && (
                    <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-xl p-4 transition hover:border-amber-400">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedBump}
                                onChange={(e) => setSelectedBump(e.target.checked)}
                                className="mt-1 w-5 h-5 accent-amber-600 rounded cursor-pointer"
                            />
                            <div className="flex-1">
                                <span className="inline-block bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                                    ONE TIME OFFER
                                </span>
                                <p className="text-sm font-bold text-gray-900">
                                    {bump.title || bumpProd?.title || "Add Special Bump Offer!"}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    {bump.description || "Yes! Add this exclusive offer to my order right now."}
                                </p>
                                <p className="text-sm font-extrabold text-amber-700 mt-2">
                                    +${(bump.price || bumpProd?.basePrice || 0).toFixed(2)}
                                </p>
                            </div>
                        </label>
                    </div>
                )}

                {/* TOTAL SUMMARY */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Total Payable:</span>
                    <span className="text-2xl font-black text-emerald-600">${totalAmount.toFixed(2)}</span>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-extrabold shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition disabled:opacity-50"
                >
                    {submitting ? "Processing Order..." : `${buttonText} • $${totalAmount.toFixed(2)}`}
                </button>
            </form>
        </div>
    );
}

function FunnelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [funnels, setFunnels] = useState<any[]>([]);

    useEffect(() => {
        xFetch("/cartflows")
            .then((r) => r.json())
            .then((d) => setFunnels(d.funnels || []))
            .catch(() => {});
    }, []);

    const options = [
        { value: "", label: "Select Sales Funnel" },
        ...funnels.map((f) => ({ value: f.slug, label: `${f.name} (${f.slug})` })),
    ];

    return <Select label="Select Target Funnel" value={value || ""} onChange={onChange} options={options} />;
}

const cartFlowsCheckoutElement = {
    type: "cartflows-checkout",
    category: "cartflows",
    label: "CartFlows Checkout & Order Bump",
    icon: "solar:cart-check-bold-duotone",

    schema: {
        content: {
            title: "Express Checkout",
            flow_slug: "",
            button_text: "Complete Order",
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Checkout Settings",
            controls: [
                {
                    name: "title",
                    render: (val: any, onChange: any) => (
                        <Text label="Checkout Header Title" value={val ?? "Express Checkout"} onChange={onChange} />
                    ),
                },
                {
                    name: "flow_slug",
                    render: (val: any, onChange: any) => <FunnelSelector value={val} onChange={onChange} />,
                },
                {
                    name: "button_text",
                    render: (val: any, onChange: any) => (
                        <Text label="Button CTA Text" value={val ?? "Complete Order"} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsCheckoutFrontend element={element} />,
};

export default cartFlowsCheckoutElement;
