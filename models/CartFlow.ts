/**
 * plugin/cartflows/models/CartFlow.ts
 *
 * Mongoose model for Sales Funnels & Steps in CartFlows plugin.
 */

import mongoose, { Schema, type Document } from "mongoose";

export interface ICartFlowStep {
    id: string;
    type: "landing" | "checkout" | "upsell" | "downsell" | "thankyou";
    title: string;
    slug: string;
    productId?: string;
    productQuantity?: number;
    discountType?: "percentage" | "fixed" | "none";
    discountValue?: number;
    orderBump?: {
        enabled: boolean;
        productId?: string;
        title?: string;
        subtitle?: string;
        description?: string;
        price?: number;
        originalPrice?: number;
        image?: string;
        position?: "before_checkout" | "after_checkout" | "above_payment";
    };
    upsellOffer?: {
        productId?: string;
        title?: string;
        subtitle?: string;
        description?: string;
        price?: number;
        originalPrice?: number;
        image?: string;
        acceptNextStepId?: string;
        declineNextStepId?: string;
    };
    nextStepId?: string;
}

export interface ICartFlow extends Document {
    name: string;
    slug: string;
    status: "active" | "draft" | "archived";
    steps: ICartFlowStep[];
    analytics: {
        views: number;
        orders: number;
        totalRevenue: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CartFlowStepSchema = new Schema<ICartFlowStep>({
    id: { type: String, required: true },
    type: { type: String, enum: ["landing", "checkout", "upsell", "downsell", "thankyou"], required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    productId: { type: String, default: "" },
    productQuantity: { type: Number, default: 1 },
    discountType: { type: String, enum: ["percentage", "fixed", "none"], default: "none" },
    discountValue: { type: Number, default: 0 },
    orderBump: {
        enabled: { type: Boolean, default: false },
        productId: { type: String, default: "" },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },
        price: { type: Number, default: 0 },
        originalPrice: { type: Number, default: 0 },
        image: { type: String, default: "" },
        position: { type: String, enum: ["before_checkout", "after_checkout", "above_payment"], default: "after_checkout" },
    },
    upsellOffer: {
        productId: { type: String, default: "" },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },
        price: { type: Number, default: 0 },
        originalPrice: { type: Number, default: 0 },
        image: { type: String, default: "" },
        acceptNextStepId: { type: String, default: "" },
        declineNextStepId: { type: String, default: "" },
    },
    nextStepId: { type: String, default: "" },
}, { _id: false });

const CartFlowSchema = new Schema<ICartFlow>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
        steps: [CartFlowStepSchema],
        analytics: {
            views: { type: Number, default: 0 },
            orders: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
        },
    },
    { timestamps: true, collection: "cartflows" }
);

export default (mongoose.models.CartFlow as mongoose.Model<ICartFlow>) ||
    mongoose.model<ICartFlow>("CartFlow", CartFlowSchema);
