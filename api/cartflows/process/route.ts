import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {
    getOrdersCollection,
    generateOrderNumber,
    initializeOrdersCollection,
    type OrderItem,
} from "@/plugin/product/models/Order";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        await initializeOrdersCollection();
        const ordersCol = await getOrdersCollection();

        const body = await req.json();
        const {
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            state,
            city,
            zipCode,
            shippingMethod = "inside",
            shippingCost = 0,
            paymentMethod = "cod",
            notes = "",
            items = [],
        } = body;

        if (!customerName || (!customerPhone && !customerEmail)) {
            return NextResponse.json({ error: "Customer name and contact info required" }, { status: 400 });
        }

        if (!items || !items.length) {
            return NextResponse.json({ error: "No products selected for checkout" }, { status: 400 });
        }

        const orderItems: OrderItem[] = items.map((it: any) => ({
            productId: it.productId || "",
            productSlug: it.productSlug || "",
            productTitle: it.productTitle || "Product",
            productImage: it.productImage || "",
            variantId: it.variantId || undefined,
            variantOptions: it.variantOptions || undefined,
            sku: it.sku || "",
            price: parseFloat(it.price) || 0,
            quantity: parseInt(it.quantity) || 1,
            subtotal: (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1),
        }));

        const itemsSubtotal = orderItems.reduce((sum, it) => sum + it.subtotal, 0);
        const finalShippingCost = parseFloat(shippingCost) || 0;
        const totalAmount = itemsSubtotal + finalShippingCost;

        const orderNumber = generateOrderNumber();
        const now = new Date();

        const newOrderObj = {
            orderNumber,
            userEmail: customerEmail || "",
            items: orderItems,
            shippingAddress: {
                name: customerName,
                phone: customerPhone || "",
                email: customerEmail || "",
                address: shippingAddress || "",
                state: state || "",
                city: city || "",
                zipCode: zipCode || "",
            },
            shippingMethod: shippingMethod === "outside" ? "outside" : "inside",
            shippingCost: finalShippingCost,
            subtotal: itemsSubtotal,
            total: totalAmount,
            status: "pending" as const,
            paymentStatus: "pending" as const,
            paymentMethod,
            notes: notes || "",
            timeline: [
                {
                    status: "pending",
                    note: "CartFlows One Page Checkout Order",
                    createdBy: "system",
                    createdByName: "CartFlows One Page Checkout",
                    createdAt: now,
                },
            ],
            inventoryUpdated: false,
            createdAt: now,
            updatedAt: now,
        };

        await ordersCol.insertOne(newOrderObj as any);

        return NextResponse.json({
            success: true,
            orderNumber,
            itemsSubtotal,
            shippingCost: finalShippingCost,
            totalAmount,
            customerName,
            customerPhone,
            customerEmail,
            shippingAddress,
            shippingMethod,
            paymentMethod,
            items: orderItems,
        });
    } catch (error: any) {
        console.error("CartFlows process order POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to process checkout order" }, { status: 500 });
    }
}
