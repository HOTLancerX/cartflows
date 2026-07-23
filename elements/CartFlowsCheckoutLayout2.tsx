"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import useSettings from "@/lib/useSettings";
import { Text } from "@/components/builder/controls";
import ProductMultiSelect from "../controls/ProductMultiSelect";
import CartFlowsSuccessModal from "../components/CartFlowsSuccessModal";

interface LocationItem {
    id: string;
    title: string;
    parentId?: string;
}

function CartFlowsCheckoutLayout2Frontend({ element }: { element: any }) {
    const { settings } = useSettings();
    const currencySymbol = settings?.product_currency_symbol || settings?.currency_symbol || "$";

    const fmt = (amount: number) =>
        `${currencySymbol} ${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`.trim();

    const s = element.schema;
    const title = s.content?.title || "VIP Fast One Page Checkout";
    const selectedProductIds: string[] = s.content?.selected_products || [];
    const buttonText = s.content?.button_text || "Confirm & Pay Now";

    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, Record<string, string>>>({});

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        state: "",
        city: "",
        zipCode: "",
        shippingMethod: "inside" as "inside" | "outside",
        paymentMethod: "cod",
        notes: "",
    });

    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [states, setStates] = useState<LocationItem[]>([]);
    const [cities, setCities] = useState<LocationItem[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successOrder, setSuccessOrder] = useState<any | null>(null);

    useEffect(() => {
        fetch("/api/location/category?type=location&status=published")
            .then((r) => (r.ok ? r.json() : {}))
            .then((data) => {
                const locs = ((data as any).categories || []).map((loc: any) => ({
                    id: String(loc.id || loc._id),
                    title: loc.title,
                    parentId: loc.parentId ? String(loc.parentId) : undefined,
                }));
                setLocations(locs);
                setStates(locs.filter((l: LocationItem) => !l.parentId));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (form.state) {
            setCities(locations.filter((loc) => loc.parentId === form.state));
        } else {
            setCities([]);
        }
    }, [form.state, locations]);

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
                    state: form.state,
                    city: form.city,
                    zipCode: form.zipCode,
                    shippingMethod: form.shippingMethod,
                    shippingCost: currentShippingCost,
                    paymentMethod: form.paymentMethod,
                    notes: form.notes,
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
                state: "",
                city: "",
                zipCode: "",
                shippingMethod: "inside",
                paymentMethod: "cod",
                notes: "",
            });
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to process order.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full py-10 px-4 sm:px-6 bg-slate-950 text-white">
            <CartFlowsSuccessModal
                isOpen={!!successOrder}
                onClose={() => setSuccessOrder(null)}
                currencySymbol={currencySymbol}
                orderDetails={successOrder}
            />

            <div className="max-w-5xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-indigo-500/20 shadow-2xl p-6 sm:p-10 space-y-8">
                <div className="border-b border-indigo-500/20 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            VIP EXPRESS CHECKOUT
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">{title}</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        <Icon icon="solar:lock-keyhole-bold" className="text-emerald-400" width={16} />
                        100% Encrypted & Secure
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs font-bold text-rose-300 flex items-center gap-2">
                        <Icon icon="solar:danger-triangle-bold" width={18} />
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Customer Form */}
                    <div className="lg:col-span-6 space-y-5 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-base font-bold text-indigo-200 flex items-center gap-2 border-b border-white/10 pb-3">
                            <Icon icon="solar:user-bold" className="text-emerald-400" width={20} />
                            Step 1: Your Information
                        </h3>

                        <div className="flex flex-wrap -mx-2 gap-y-4">
                            <div className="w-full md:w-1/2 px-2">
                                <label className="block text-xs font-bold text-indigo-200 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition"
                                />
                            </div>

                            <div className="w-full md:w-1/2 px-2">
                                <label className="block text-xs font-bold text-indigo-200 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone number"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition"
                                />
                            </div>

                            <div className="w-full px-2">
                                <label className="block text-xs font-bold text-indigo-200 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition"
                                />
                            </div>

                            <div className="w-full px-2">
                                <label className="block text-xs font-bold text-indigo-200 mb-1">Shipping Address</label>
                                <textarea
                                    rows={2}
                                    placeholder="House/Street/City address..."
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition"
                                />
                            </div>

                            {states.length > 0 && (
                                <div className="w-full md:w-1/2 px-2">
                                    <label className="block text-xs font-bold text-indigo-200 mb-1">State / Region</label>
                                    <select
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white outline-none focus:border-emerald-400"
                                    >
                                        <option value="">Select State</option>
                                        {states.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {cities.length > 0 && (
                                <div className="w-full md:w-1/2 px-2">
                                    <label className="block text-xs font-bold text-indigo-200 mb-1">City</label>
                                    <select
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-white outline-none focus:border-emerald-400"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="w-full px-2">
                                <label className="block text-xs font-bold text-indigo-200 mb-1">Order Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Delivery notes..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Products, Variants, Shipping, Payment, Total */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                            <h3 className="text-base font-bold text-indigo-200 flex items-center gap-2 border-b border-white/10 pb-3">
                                <Icon icon="solar:bag-bold" className="text-emerald-400" width={20} />
                                Step 2: Order Items & Payment
                            </h3>

                            {loadingProducts ? (
                                <div className="py-6 text-center text-xs text-indigo-300 flex items-center justify-center gap-2">
                                    <Icon icon="svg-spinners:ring-resize" width={18} />
                                    Loading products...
                                </div>
                            ) : products.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No products configured for this layout.</p>
                            ) : (
                                <div className="space-y-4">
                                    {products.map((p) => {
                                        const qty = quantities[p._id] || 1;
                                        const effectivePrice = getProductEffectivePrice(p);
                                        const effectiveImage = getProductEffectiveImage(p);

                                        return (
                                            <div
                                                key={p._id}
                                                className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {effectiveImage ? (
                                                            <img
                                                                src={effectiveImage}
                                                                alt={p.title}
                                                                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                                                <Icon icon="solar:box-bold" width={20} />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{p.title}</p>
                                                            <p className="text-xs text-emerald-400 font-extrabold">{fmt(effectivePrice)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center border border-white/20 rounded-lg overflow-hidden shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(p._id, -1)}
                                                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3 text-xs font-bold text-white">{qty}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(p._id, 1)}
                                                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Variant Attributes Chips */}
                                                {p.priceType === "variant" && p.selectedAttributes?.length > 0 && (
                                                    <div className="pt-2 border-t border-dashed border-white/10 space-y-2">
                                                        {p.selectedAttributes.map((attr: any) => (
                                                            <div key={attr.label} className="flex flex-col gap-1">
                                                                <span className="text-[11px] font-bold text-indigo-300">
                                                                    Select {attr.label}:
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {attr.values?.map((val: string) => {
                                                                        const isSel =
                                                                            selectedVariantOptions[p._id]?.[attr.label] === val;
                                                                        return (
                                                                            <button
                                                                                key={val}
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    selectVariantOption(p._id, attr.label, val)
                                                                                }
                                                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                                                                    isSel
                                                                                        ? "bg-emerald-500 text-white font-bold"
                                                                                        : "bg-white/10 text-indigo-200 hover:bg-white/20"
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

                            {/* SHIPPING METHOD SELECTOR */}
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <label className="block text-xs font-bold text-indigo-200">Shipping Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label
                                        className={`p-3 rounded-xl border flex flex-col cursor-pointer transition ${
                                            form.shippingMethod === "inside"
                                                ? "bg-emerald-500/20 border-emerald-400 font-bold text-emerald-300"
                                                : "bg-slate-950 border-white/10 text-indigo-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="shippingMethod2"
                                                value="inside"
                                                checked={form.shippingMethod === "inside"}
                                                onChange={() => setForm({ ...form, shippingMethod: "inside" })}
                                                className="accent-emerald-400"
                                            />
                                            <span className="text-xs">Inside City</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-400 font-bold mt-1 ml-5">
                                            {maxShippingInside > 0 ? fmt(maxShippingInside) : "FREE"}
                                        </span>
                                    </label>

                                    <label
                                        className={`p-3 rounded-xl border flex flex-col cursor-pointer transition ${
                                            form.shippingMethod === "outside"
                                                ? "bg-emerald-500/20 border-emerald-400 font-bold text-emerald-300"
                                                : "bg-slate-950 border-white/10 text-indigo-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="shippingMethod2"
                                                value="outside"
                                                checked={form.shippingMethod === "outside"}
                                                onChange={() => setForm({ ...form, shippingMethod: "outside" })}
                                                className="accent-emerald-400"
                                            />
                                            <span className="text-xs">Outside City</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-400 font-bold mt-1 ml-5">
                                            {maxShippingOutside > 0 ? fmt(maxShippingOutside) : "FREE"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* PAYMENT METHOD SELECTOR */}
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <label className="block text-xs font-bold text-indigo-200">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label
                                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                                            form.paymentMethod === "cod"
                                                ? "bg-emerald-500/20 border-emerald-400 font-bold text-emerald-300"
                                                : "bg-slate-950 border-white/10 text-indigo-200"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod2"
                                            value="cod"
                                            checked={form.paymentMethod === "cod"}
                                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                            className="accent-emerald-400"
                                        />
                                        <span className="text-xs">Cash on Delivery</span>
                                    </label>
                                    <label
                                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                                            form.paymentMethod === "online"
                                                ? "bg-emerald-500/20 border-emerald-400 font-bold text-emerald-300"
                                                : "bg-slate-950 border-white/10 text-indigo-200"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod2"
                                            value="online"
                                            checked={form.paymentMethod === "online"}
                                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                            className="accent-emerald-400"
                                        />
                                        <span className="text-xs">Online Payment</span>
                                    </label>
                                </div>
                            </div>

                            {/* TOTAL BREAKDOWN */}
                            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-indigo-300">
                                <div className="flex justify-between">
                                    <span>Items Subtotal</span>
                                    <span className="font-bold text-white">{fmt(itemsSubtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping Charge</span>
                                    <span className="font-bold text-emerald-400">
                                        {currentShippingCost > 0 ? fmt(currentShippingCost) : "FREE"}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/10 text-base font-black text-white">
                                    <span>Total Payable:</span>
                                    <span className="text-emerald-400">{fmt(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base sm:text-lg font-black shadow-xl shadow-emerald-500/25 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" width={20} />
                                    <span>Processing Order...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:fire-bold" width={22} />
                                    <span>{buttonText} • {fmt(totalAmount)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

const cartFlowsCheckoutLayout2Element = {
    type: "cartflows-checkout-2",
    category: "cartflows",
    label: "CartFlows One Page Checkout — Dark Premium",
    icon: "solar:fire-bold-duotone",

    schema: {
        content: {
            title: "VIP Fast One Page Checkout",
            selected_products: [],
            button_text: "Confirm & Pay Now",
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Dark Layout Settings",
            controls: [
                {
                    name: "title",
                    render: (val: any, onChange: any) => (
                        <Text label="Header Title" value={val ?? "VIP Fast One Page Checkout"} onChange={onChange} />
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
                        <Text label="Submit Button CTA" value={val ?? "Confirm & Pay Now"} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsCheckoutLayout2Frontend element={element} />,
};

export default cartFlowsCheckoutLayout2Element;
