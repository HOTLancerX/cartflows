/**
 * plugin/cartflows/lib/builderData.tsx
 *
 * Server-side renderers for CartFlows One Page Checkout builder elements.
 * Auto-discovered by hook/builderDataHooks.ts via require.context.
 */

import { registerBuilderElement } from "@/hook/builderDataHooks";
import connectDB from "@/lib/mongodb";
import Post from "@/models/post";
import PostInfo from "@/models/post_info";

async function fetchProductsForServer(selectedIds: string[]) {
    await connectDB();
    const query: any = { type: "product", status: "published" };
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
        query._id = { $in: selectedIds };
    }

    const posts = (await Post.find(query).limit(10).lean()) as any[];
    if (!posts.length) return [];

    const infoDocs = (await PostInfo.find({ postId: { $in: posts.map((p) => p._id) } }).lean()) as any[];
    const infoMap: Record<string, Record<string, string>> = {};
    infoDocs.forEach((d) => {
        const key = String(d.postId);
        if (!infoMap[key]) infoMap[key] = {};
        infoMap[key][d.name] = d.value;
    });

    return posts.map((p) => {
        const info = infoMap[String(p._id)] || {};
        let price = 0;
        let priceType = "single";
        try {
            const variate = JSON.parse(info._variate || "{}");
            priceType = variate.priceType || "single";
            price = parseFloat(variate.sellingprice || variate.regularprice || "0") || 0;
        } catch {
            price = 0;
        }

        return {
            _id: String(p._id),
            title: p.title,
            priceType,
            price,
        };
    });
}

registerBuilderElement("cartflows-checkout-1", async (schema) => {
    const c = schema?.content ?? {};
    const title = c.title || "Complete Your Order — One Page Checkout";
    const selectedIds = c.selected_products || [];
    const products = await fetchProductsForServer(selectedIds);

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <p className="text-xs font-bold text-gray-700">Customer Form (Server Preview)</p>
                    <div className="h-8 bg-white rounded-lg border border-gray-200" />
                    <div className="h-8 bg-white rounded-lg border border-gray-200" />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <p className="text-xs font-bold text-gray-700">Selected Products & Variants ({products.length})</p>
                    {products.map((p) => (
                        <div key={p._id} className="flex justify-between text-xs bg-white p-2 rounded-lg border">
                            <span>
                                {p.title} {p.priceType === "variant" ? "(Variant)" : ""}
                            </span>
                            <span className="font-bold text-emerald-600">${p.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

registerBuilderElement("cartflows-checkout-2", async (schema) => {
    const c = schema?.content ?? {};
    const title = c.title || "VIP Fast One Page Checkout";
    const selectedIds = c.selected_products || [];
    const products = await fetchProductsForServer(selectedIds);

    return (
        <div className="max-w-5xl mx-auto bg-slate-900 text-white rounded-3xl p-8 border border-indigo-500/30 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-indigo-200">Customer Information (Dark Preview)</p>
                    <div className="h-8 bg-slate-950 rounded-lg border border-white/10" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-indigo-200">Order Items & Variants ({products.length})</p>
                    {products.map((p) => (
                        <div key={p._id} className="flex justify-between text-xs bg-slate-950 p-2 rounded-lg border border-white/10">
                            <span>
                                {p.title} {p.priceType === "variant" ? "(Variant)" : ""}
                            </span>
                            <span className="font-bold text-emerald-400">${p.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

registerBuilderElement("cartflows-checkout-3", async (schema) => {
    const c = schema?.content ?? {};
    const title = c.title || "Express 1-Step Checkout";
    const selectedIds = c.selected_products || [];
    const products = await fetchProductsForServer(selectedIds);

    return (
        <div className="max-w-4xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">{title}</h2>
            <div className="p-4 bg-white rounded-2xl border border-amber-200 text-xs">
                <p className="font-bold text-gray-800">
                    Compact Express One Page Checkout ({products.length} Products)
                </p>
            </div>
        </div>
    );
});
