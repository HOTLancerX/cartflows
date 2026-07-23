/**
 * plugin/cartflows/lib/builderData.tsx
 *
 * Server-side renderers for CartFlows builder elements.
 * Auto-discovered by hook/builderDataHooks.ts via require.context.
 */

import { registerBuilderElement } from "@/hook/builderDataHooks";
import connectDB from "@/lib/mongodb";
import CartFlow from "@/plugin/cartflows/models/CartFlow";
import Post from "@/models/post";
import PostInfo from "@/models/post_info";

registerBuilderElement("cartflows-checkout", async (schema) => {
    await connectDB();
    const c = schema?.content ?? {};
    const title = c.title || "Express Checkout";
    const flowSlug = c.flow_slug || "";

    let flow = null;
    let product = null;
    let orderBump = null;

    if (flowSlug) {
        flow = (await CartFlow.findOne({ slug: flowSlug, status: "active" }).lean()) as any;
        if (flow) {
            const checkoutStep = (flow.steps || []).find((s: any) => s.type === "checkout");
            if (checkoutStep?.productId) {
                const prodPost = (await Post.findById(checkoutStep.productId).lean()) as any;
                if (prodPost) {
                    const infoDocs = (await PostInfo.find({ postId: prodPost._id }).lean()) as any[];
                    const infoMap: Record<string, string> = {};
                    infoDocs.forEach((d) => (infoMap[d.name] = d.value));

                    product = {
                        title: prodPost.title,
                        slug: prodPost.slug,
                        info: infoMap,
                    };
                }
            }
            if (checkoutStep?.orderBump?.enabled && checkoutStep?.orderBump?.productId) {
                const bumpPost = (await Post.findById(checkoutStep.orderBump.productId).lean()) as any;
                if (bumpPost) {
                    orderBump = {
                        title: checkoutStep.orderBump.title || bumpPost.title,
                        description: checkoutStep.orderBump.description,
                        price: checkoutStep.orderBump.price || 0,
                    };
                }
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {product && (
                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                    <span className="font-bold text-gray-800">{product.title}</span>
                    <span className="text-emerald-600 font-extrabold">Server-Rendered Checkout</span>
                </div>
            )}
            {orderBump && (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-xs font-medium">
                    <span className="font-bold text-amber-800">Order Bump:</span> {orderBump.title} (+${orderBump.price})
                </div>
            )}
        </div>
    );
});

registerBuilderElement("cartflows-order-bump", async (schema) => {
    const c = schema?.content ?? {};
    const title = c.title || "Special One-Time Offer!";
    const description = c.description || "Add this exclusive deal right now.";
    const price = c.price ?? 19.99;

    return (
        <div className="border-2 border-dashed border-amber-400 bg-amber-50/50 rounded-2xl p-5 max-w-xl mx-auto">
            <h4 className="font-bold text-gray-900 text-base">{title}</h4>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
            <p className="text-sm font-extrabold text-amber-700 mt-2">+${Number(price).toFixed(2)}</p>
        </div>
    );
});

registerBuilderElement("cartflows-offer", async (schema) => {
    const c = schema?.content ?? {};
    const title = c.title || "Wait! Upgrade Your Order";
    const price = c.price ?? 29.99;

    return (
        <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <div className="text-3xl font-extrabold text-emerald-400">${Number(price).toFixed(2)}</div>
        </div>
    );
});

registerBuilderElement("cartflows-next-step", async (schema) => {
    const c = schema?.content ?? {};
    const buttonText = c.button_text || "Continue to Next Step →";

    return (
        <div className="text-center py-2 max-w-md mx-auto">
            <button className="w-full py-4 px-8 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg shadow-lg">
                {buttonText}
            </button>
        </div>
    );
});
