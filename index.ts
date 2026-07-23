/**
 * plugin/cartflows/index.ts
 *
 * CartFlows One Page Checkout Plugin for CMS.
 *
 * Features:
 *  — Multiple One-Page Checkout Page Builder Elements (Modern Light, Dark Premium, Express Compact)
 *  — Multi-Product Selection
 *  — 2-Column Responsive Layout (Left: Customer Details; Right: Products, Payment, Totals)
 *  — Post-Submission Success Popup Modal (Order Confirmed with order ID & summary)
 */

import { addBuilderElement, type PluginMeta } from "@/hook";
import cartFlowsCheckoutLayout1Element from "./elements/CartFlowsCheckoutLayout1";
import cartFlowsCheckoutLayout2Element from "./elements/CartFlowsCheckoutLayout2";
import cartFlowsCheckoutLayout3Element from "./elements/CartFlowsCheckoutLayout3";

// ─── Plugin Metadata ──────────────────────────────────────────────────────────

export const PLUGINS: PluginMeta = {
    nx: "com.system.cartflows",
    name: "cartflows",
    version: "2.0.0",
    description: "CartFlows One Page Checkout with multi-product selection, 2-column layout, and post-submission success popup modal.",
    author: "System",
    path: "https://github.com/HOTLancerX/cartflows.git",
    icon: "solar:cart-check-bold",
    color: "from-emerald-500 to-teal-600",
};

// ─── Hook Registration ────────────────────────────────────────────────────────

export function register() {
    // ── Builder Elements ──────────────────────────────────────────────────────
    addBuilderElement(cartFlowsCheckoutLayout1Element, PLUGINS.nx);
    addBuilderElement(cartFlowsCheckoutLayout2Element, PLUGINS.nx);
    addBuilderElement(cartFlowsCheckoutLayout3Element, PLUGINS.nx);
}
