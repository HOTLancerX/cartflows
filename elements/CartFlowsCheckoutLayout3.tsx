"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import useSettings from "@/lib/useSettings";
import { Text } from "@/components/builder/controls";
import ProductMultiSelect from "../controls/ProductMultiSelect";
import CartFlowsSuccessModal from "../components/CartFlowsSuccessModal";

function CartFlowsCheckoutLayout3Frontend({ element }: { element: any }) {
    const { settings } = useSettings();
    const currencySymbol = settings?.product_currency_symbol || settings?.currency_symbol || "$";

    const fmt = (amount: number) =>
        `${currencySymbol} ${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`.trim();

    const s = element.schema;
    const title = s.content?.title || "Express 1-Step Checkout";
    const selectedProductIds: string[] = s.content?.selected_products || [];
    const buttonText = s.content?.button_text || "Complete Order Now";

    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, Record<string, string>>>({});

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        shippingMethod: "inside" as "inside" | "outside",
        paymentMethod: "cod",
    });

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successOrder, setSuccessOrder] = useState<any | null>(null);

    useEffect(() => {
        fetch("/api/cartflows/products", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                if (d && Array.isArray(d.products)) {
                    let list = d.products;
                    if (selectedProductIds.length > 0) {
                        list = list.filter((p: any) => selectedProductIds.includes(p._id));
                    }
                    setProducts(list);

                    const initialQty: Record<string, number> = {};
                    const initialVarOpts: Record<string, Record<string, string>> = {};

                    list.forEach((p: any) => {
                        initialQty[p._id] = 1;
                        if (p.priceType === "variant" && p.selectedAttributes?.length > 0) {
                            const defaultOpts: Record<string, string> = {};
                            p.selectedAttributes.forEach((attr: any) => {
                                if (attr.values?.length > 0) {
                                    defaultOpts[attr.label] = attr.values[0];
                                }
                            });
                            initialVarOpts[p._id] = defaultOpts;
                        }
                    });

                    setQuantities(initialQty);
                    setSelectedVariantOptions(initialVarOpts);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProducts(false));
    }, [selectedProductIds.join(",")]);

    const selectVariantOption = (productId: string, attrLabel: string, value: string) => {
        setSelectedVariantOptions((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                [attrLabel]: value,
            },
        }));
    };

    const getActiveVariant = (product: any) => {
        if (product.priceType !== "variant" || !product.variants?.length) return null;
        const currentOpts = selectedVariantOptions[product._id] || {};
        return product.variants.find((v: any) => {
            if (!v.options) return false;
            return Object.entries(currentOpts).every(([k, val]) => v.options[k] === val);
        });
    };

    const getProductEffectivePrice = (product: any) => {
        if (product.priceType === "variant") {
            const activeVar = getActiveVariant(product);
            if (activeVar?.price) return parseFloat(activeVar.price) || product.price;
        }
        return product.price;
    };

    const getProductEffectiveImage = (product: any) => {
        if (product.priceType === "variant") {
            const activeVar = getActiveVariant(product);
            if (activeVar?.image) return activeVar.image;
        }
        return product.image;
    };

    const updateQty = (id: string, delta: number) => {
        setQuantities((prev) => {
            const current = prev[id] || 1;
            const next = Math.max(1, current + delta);
            return { ...prev, [id]: next };
        });
    };

    const maxShippingInside = Math.max(0, ...products.map((p) => p.shippingInsideRate || 0));
    const maxShippingOutside = Math.max(0, ...products.map((p) => p.shippingOutsideRate || 0));
    const currentShippingCost = form.shippingMethod === "outside" ? maxShippingOutside : maxShippingInside;

    const itemsSubtotal = products.reduce((sum, p) => {
        const qty = quantities[p._id] || 1;
        const price = getProductEffectivePrice(p);
        return sum + price * qty;
    }, 0);

    const totalAmount = itemsSubtotal + currentShippingCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!form.name.trim() || !form.phone.trim()) {
            setErrorMsg("Please fill in your name and phone number.");
            return;
        }

        if (!products.length) {
            setErrorMsg("No products selected for checkout.");
            return;
        }

        setSubmitting(true);
        try {
            const items = products.map((p) => {
                const activeVar = getActiveVariant(p);
                return {
                    productId: p._id,
                    productSlug: p.slug,
                    productTitle: p.title,
                    productImage: getProductEffectiveImage(p),
                    variantId: activeVar?.id || undefined,
                    variantOptions: activeVar?.options || selectedVariantOptions[p._id] || undefined,
                    sku: activeVar?.sku || "",
                    price: getProductEffectivePrice(p),
                    quantity: quantities[p._id] || 1,
                };
            });

            const res = await fetch("/api/cartflows/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: form.name,
                    customerPhone: form.phone,
                    customerEmail: form.email,
                    shippingAddress: form.address,
                    shippingMethod: form.shippingMethod,
                    shippingCost: currentShippingCost,
                    paymentMethod: form.paymentMethod,
                    items,
                }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || "Order submission failed.");
            }

            setSuccessOrder(data);
            setForm({
                name: "",
                phone: "",
                email: "",
                address: "",
                shippingMethod: "inside",
                paymentMethod: "cod",
            });
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to process order.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full py-8 px-4 sm:px-6">
            <CartFlowsSuccessModal
                isOpen={!!successOrder}
                onClose={() => setSuccessOrder(null)}
                currencySymbol={currencySymbol}
                orderDetails={successOrder}
            />

            <div className="max-w-4xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-1">
                    <span className="inline-block bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        INSTANT CHECKOUT
                    </span>
                    <h2 className="text-2xl font-black text-gray-900">{title}</h2>
                </div>

                {errorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-2xl border border-amber-200/60 shadow-lg">
                    {/* LEFT COLUMN: Customer Details */}
                    <div className="md:col-span-6 space-y-3">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                            Customer Details
                        </h3>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Your Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                placeholder="Phone number"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Shipping Address</label>
                            <textarea
                                rows={2}
                                placeholder="Full shipping address..."
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Products, Variants, Shipping & Payment */}
                    <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                                Products & Payment
                            </h3>

                            {loadingProducts ? (
                                <div className="py-4 text-center text-xs text-gray-400">Loading products...</div>
                            ) : products.length === 0 ? (
                                <div className="text-xs text-gray-400">No products configured.</div>
                            ) : (
                                <div className="space-y-3">
                                    {products.map((p) => {
                                        const qty = quantities[p._id] || 1;
                                        const effectivePrice = getProductEffectivePrice(p);

                                        return (
                                            <div key={p._id} className="bg-gray-50 p-3 rounded-xl text-xs border border-gray-100 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-800 truncate pr-2">{p.title}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="font-mono text-emerald-600 font-bold">{fmt(effectivePrice * qty)}</span>
                                                        <div className="flex items-center border rounded">
                                                            <button type="button" onClick={() => updateQty(p._id, -1)} className="px-1.5 py-0.5 bg-gray-200 font-bold">-</button>
                                                            <span className="px-2 font-bold">{qty}</span>
                                                            <button type="button" onClick={() => updateQty(p._id, 1)} className="px-1.5 py-0.5 bg-gray-200 font-bold">+</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Variant Attributes Selection */}
                                                {p.priceType === "variant" && p.selectedAttributes?.length > 0 && (
                                                    <div className="pt-1.5 border-t border-dashed border-gray-200 space-y-1">
                                                        {p.selectedAttributes.map((attr: any) => (
                                                            <div key={attr.label} className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold text-gray-500">{attr.label}:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {attr.values?.map((val: string) => {
                                                                        const isSel = selectedVariantOptions[p._id]?.[attr.label] === val;
                                                                        return (
                                                                            <button
                                                                                key={val}
                                                                                type="button"
                                                                                onClick={() => selectVariantOption(p._id, attr.label, val)}
                                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                                                                    isSel ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"
                                                                                }`}
                                                                            >
                                                                                {val}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Shipping Radio */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Shipping Area</label>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <label className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer ${
                                        form.shippingMethod === "inside" ? "bg-amber-50 border-amber-500 font-bold" : "bg-white border-gray-200"
                                    }`}>
                                        <div className="flex items-center gap-1">
                                            <input type="radio" name="shippingMethod3" value="inside" checked={form.shippingMethod === "inside"} onChange={() => setForm({ ...form, shippingMethod: "inside" })} className="accent-amber-500" />
                                            <span>Inside</span>
                                        </div>
                                        <span className="text-[10px] text-amber-700 font-extrabold">{maxShippingInside > 0 ? fmt(maxShippingInside) : "FREE"}</span>
                                    </label>
                                    <label className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer ${
                                        form.shippingMethod === "outside" ? "bg-amber-50 border-amber-500 font-bold" : "bg-white border-gray-200"
                                    }`}>
                                        <div className="flex items-center gap-1">
                                            <input type="radio" name="shippingMethod3" value="outside" checked={form.shippingMethod === "outside"} onChange={() => setForm({ ...form, shippingMethod: "outside" })} className="accent-amber-500" />
                                            <span>Outside</span>
                                        </div>
                                        <span className="text-[10px] text-amber-700 font-extrabold">{maxShippingOutside > 0 ? fmt(maxShippingOutside) : "FREE"}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Selector */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={form.paymentMethod}
                                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
                                >
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="online">Online Payment</option>
                                </select>
                            </div>
                        </div>

                        {/* Total & Submit */}
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm font-black text-gray-900">
                                <span>Total Payable:</span>
                                <span className="text-xl text-amber-600">{fmt(totalAmount)}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? "Processing..." : `${buttonText} • ${fmt(totalAmount)}`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

const cartFlowsCheckoutLayout3Element = {
    type: "cartflows-checkout-3",
    category: "cartflows",
    label: "CartFlows One Page Checkout — Compact Express",
    icon: "solar:flash-bold-duotone",

    schema: {
        content: {
            title: "Express 1-Step Checkout",
            selected_products: [],
            button_text: "Complete Order Now",
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Compact Layout Settings",
            controls: [
                {
                    name: "title",
                    render: (val: any, onChange: any) => (
                        <Text label="Header Title" value={val ?? "Express 1-Step Checkout"} onChange={onChange} />
                    ),
                },
                {
                    name: "selected_products",
                    render: (val: any, onChange: any) => (
                        <ProductMultiSelect value={val || []} onChange={onChange} />
                    ),
                },
                {
                    name: "button_text",
                    render: (val: any, onChange: any) => (
                        <Text label="Submit Button CTA" value={val ?? "Complete Order Now"} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsCheckoutLayout3Frontend element={element} />,
};

export default cartFlowsCheckoutLayout3Element;
