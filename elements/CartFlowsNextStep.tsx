"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/builder/controls";

function CartFlowsNextStepFrontend({ element }: { element: any }) {
    const s = element.schema;
    const buttonText = s.content?.button_text || "Continue to Next Step →";
    const subtext = s.content?.subtext || "Fast & Secure Checkout • 100% Satisfaction Guaranteed";

    return (
        <div className="text-center space-y-2 max-w-md mx-auto py-2">
            <button
                type="button"
                onClick={() => {
                    alert("Proceeding to next step in sales funnel.");
                }}
                className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-lg font-black shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
                <span>{buttonText}</span>
                <Icon icon="solar:arrow-right-bold" width={20} />
            </button>
            {subtext && <p className="text-xs text-gray-500 font-medium">{subtext}</p>}
        </div>
    );
}

const cartFlowsNextStepElement = {
    type: "cartflows-next-step",
    category: "cartflows",
    label: "CartFlows Next Step",
    icon: "solar:arrow-right-bold-duotone",

    schema: {
        content: {
            button_text: "Continue to Next Step →",
            subtext: "Fast & Secure Checkout • 100% Satisfaction Guaranteed",
        },
    },

    controls: [
        {
            tab: "Content",
            section: "Button Settings",
            controls: [
                {
                    name: "button_text",
                    render: (val: any, onChange: any) => (
                        <Text label="Button Label" value={val ?? "Continue to Next Step →"} onChange={onChange} />
                    ),
                },
                {
                    name: "subtext",
                    render: (val: any, onChange: any) => (
                        <Text label="Security Sub-text" value={val ?? "Fast & Secure Checkout..."} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <CartFlowsNextStepFrontend element={element} />,
};

export default cartFlowsNextStepElement;
