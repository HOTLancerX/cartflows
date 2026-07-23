/**
 * plugin/cartflows/index.ts
 *
 * CartFlows Sales Funnel Plugin for CMS.
 *
 * Features:
 *  — Admin Sales Funnel Manager → /admin/cartflows
 *  — Custom Checkout Steps with Order Bumps
 *  — Post-Purchase 1-Click Upsells & Downsells
 *  — Thank You Pages & Funnel Conversion Analytics
 *  — Page Builder Elements for custom sales funnel landing pages
 */

import { addHook, addBuilderElement, type PluginMeta } from "@/hook";
import CartFlowsManager from "./settings/CartFlowsManager";
import CartFlowsCheckoutPage from "./pages/CartFlowsCheckoutPage";
import CartFlowsOfferPage from "./pages/CartFlowsOfferPage";
import CartFlowsThankYouPage from "./pages/CartFlowsThankYouPage";

import cartFlowsCheckoutElement from "./elements/CartFlowsCheckout";
import cartFlowsOrderBumpElement from "./elements/CartFlowsOrderBump";
import cartFlowsOfferElement from "./elements/CartFlowsOffer";
import cartFlowsNextStepElement from "./elements/CartFlowsNextStep";

// ─── Plugin Metadata ──────────────────────────────────────────────────────────

export const PLUGINS: PluginMeta = {
    nx: "com.system.cartflows",
    name: "cartflows",
    version: "1.0.0",
    description: "Sales funnels, custom checkout steps, order bumps, and 1-click post-purchase upsells/downsells.",
    author: "System",
    path: "https://github.com/HOTLancerX/cartflows.git",
    icon: "solar:funnel-bold",
    color: "from-emerald-500 to-teal-600",
};

// ─── Hook Registration ────────────────────────────────────────────────────────

export function register() {
    // ── Admin Sidebar Navigation ──────────────────────────────────────────────
    addHook("admin.nav", [
        {
            key: "cartflows",
            label: "CartFlows Funnels",
            icon: "solar:funnel-bold",
            slug: "cartflows",
            parent: "",
            position: 22,
        },
    ], PLUGINS.nx);

    // ── Admin Page: Sales Funnel Manager ──────────────────────────────────────
    addHook("admin.pages", [
        {
            key: "cartflows",
            label: "CartFlows Sales Funnel Manager",
            type: "cartflows-settings",
            style: "left",
            position: 37,
            path: CartFlowsManager,
        },
    ], PLUGINS.nx);

    // ── Public Funnel Steps ───────────────────────────────────────────────────
    addHook("root.pages", [
        {
            key: "cartflows-checkout",
            label: "CartFlows Checkout Step",
            type: "cartflows-checkout",
            slug: "funnel/[flowSlug]/checkout",
            style: "left",
            position: 15,
            active: true,
            component: CartFlowsCheckoutPage,
        },
        {
            key: "cartflows-offer",
            label: "CartFlows Upsell Step",
            type: "cartflows-offer",
            slug: "funnel/[flowSlug]/upsell",
            style: "left",
            position: 16,
            active: true,
            component: CartFlowsOfferPage,
        },
        {
            key: "cartflows-thankyou",
            label: "CartFlows Thank You Step",
            type: "cartflows-thankyou",
            slug: "funnel/[flowSlug]/thankyou",
            style: "left",
            position: 17,
            active: true,
            component: CartFlowsThankYouPage,
        },
    ], PLUGINS.nx);

    // ── Builder Elements ──────────────────────────────────────────────────────
    addBuilderElement(cartFlowsCheckoutElement, PLUGINS.nx);
    addBuilderElement(cartFlowsOrderBumpElement, PLUGINS.nx);
    addBuilderElement(cartFlowsOfferElement, PLUGINS.nx);
    addBuilderElement(cartFlowsNextStepElement, PLUGINS.nx);
}
