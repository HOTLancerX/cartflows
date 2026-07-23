"use client";

import React from "react";
import { Icon } from "@iconify/react";

export interface CartFlowsSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    currencySymbol?: string;
    orderDetails: {
        orderNumber: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        shippingAddress?: string;
        shippingMethod?: string;
        shippingCost?: number;
        paymentMethod: string;
        itemsSubtotal?: number;
        totalAmount: number;
        items: any[];
    } | null;
}

export default function CartFlowsSuccessModal({
    isOpen,
    onClose,
    currencySymbol = "$",
    orderDetails,
}: CartFlowsSuccessModalProps) {
    if (!isOpen || !orderDetails) return null;

    const fmt = (amount: number) =>
        `${currencySymbol} ${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`.trim();

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center border border-gray-100 relative overflow-hidden">
                {/* Success Icon Badge */}
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Icon icon="solar:check-circle-bold" width={48} className="animate-bounce" />
                </div>

                {/* Main Heading */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900">Order Placed Successfully!</h2>
                    <p className="text-xs text-gray-500">
                        Thank you for your purchase. We will contact you shortly to confirm delivery.
                    </p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-medium">Order Number:</span>
                        <span className="font-mono font-bold text-gray-900 text-sm">{orderDetails.orderNumber}</span>
                    </div>

                    <div className="space-y-2 border-b border-gray-200 pb-2">
                        <p className="font-bold text-gray-700">Order Items ({orderDetails.items.length}):</p>
                        {orderDetails.items.map((it: any, idx: number) => {
                            const variantText = it.variantOptions
                                ? Object.entries(it.variantOptions)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(", ")
                                : "";
                            return (
                                <div key={idx} className="flex justify-between items-start text-gray-600 text-[11px]">
                                    <div className="pr-2 min-w-0">
                                        <p className="font-bold text-gray-800 truncate">• {it.productTitle} (x{it.quantity})</p>
                                        {variantText && (
                                            <p className="text-indigo-600 font-medium text-[10px]">{variantText}</p>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-900 shrink-0">
                                        {fmt(it.price * it.quantity)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-1 text-gray-600">
                        <div className="flex justify-between">
                            <span>Customer Name:</span>
                            <span className="font-semibold text-gray-800">{orderDetails.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phone Contact:</span>
                            <span className="font-semibold text-gray-800">{orderDetails.customerPhone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping Cost:</span>
                            <span className="font-semibold text-gray-800">
                                {orderDetails.shippingCost && orderDetails.shippingCost > 0
                                    ? fmt(orderDetails.shippingCost)
                                    : "FREE"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="font-semibold text-emerald-700 uppercase">
                                {orderDetails.paymentMethod}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                        <span>Total Amount:</span>
                        <span className="text-emerald-600 text-base">{fmt(orderDetails.totalAmount)}</span>
                    </div>
                </div>

                {/* Close CTA Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-lg transition active:scale-[0.98]"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}
