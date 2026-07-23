import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/post";
import PostInfo from "@/models/post_info";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const posts = (await Post.find({ type: "product", status: "published" })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()) as any[];

        if (!posts.length) {
            return NextResponse.json({ products: [] });
        }

        const postIds = posts.map((p) => p._id);
        const infoDocs = (await PostInfo.find({ postId: { $in: postIds } }).lean()) as any[];

        const infoMap: Record<string, Record<string, string>> = {};
        infoDocs.forEach((doc) => {
            const pid = String(doc.postId);
            if (!infoMap[pid]) infoMap[pid] = {};
            infoMap[pid][doc.name] = doc.value;
        });

        const products = posts.map((p) => {
            const info = infoMap[String(p._id)] || {};
            let priceType: "single" | "variant" = "single";
            let price = 0;
            let originalPrice = 0;
            let stock = 0;
            let selectedAttributes: any[] = [];
            let variants: any[] = [];
            let variantDisplayStyle = "list";

            try {
                const variate = JSON.parse(info._variate || "{}");
                priceType = variate.priceType === "variant" ? "variant" : "single";
                price = parseFloat(variate.sellingprice || variate.regularprice || "0") || 0;
                originalPrice = parseFloat(variate.regularprice || "0") || 0;
                stock = parseInt(variate.stock || "0") || 0;
                selectedAttributes = Array.isArray(variate.selectedAttributes) ? variate.selectedAttributes : [];
                variants = Array.isArray(variate.variants) ? variate.variants : [];
                variantDisplayStyle = variate.variantDisplayStyle || "list";
            } catch {
                priceType = "single";
            }

            let images: string[] = [];
            try {
                images = JSON.parse(info.images || "[]");
            } catch {
                images = [];
            }

            const shippingInsideRate = parseFloat(info.shippingInsideRate || "0") || 0;
            const shippingOutsideRate = parseFloat(info.shippingOutsideRate || "0") || 0;
            const shippingInsideLabel = info.shippingInsideLabel || "Shipping Inside";
            const shippingOutsideLabel = info.shippingOutsideLabel || "Shipping Outside";
            const orderNote = info.orderNote || "";
            const warranty = info.warranty || "";

            return {
                _id: String(p._id),
                title: p.title,
                slug: p.slug,
                priceType,
                price,
                originalPrice,
                stock,
                selectedAttributes,
                variants,
                variantDisplayStyle,
                images,
                image: images[0] || "",
                shippingInsideRate,
                shippingOutsideRate,
                shippingInsideLabel,
                shippingOutsideLabel,
                orderNote,
                warranty,
            };
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("CartFlows products API GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
