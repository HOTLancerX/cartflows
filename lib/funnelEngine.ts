/**
 * plugin/cartflows/lib/funnelEngine.ts
 *
 * Funnel calculation & step transition utilities for CartFlows plugin.
 */

export interface FunnelPriceCalc {
    originalPrice: number;
    discountedPrice: number;
    savingsAmount: number;
}

export function calculateFunnelPrice(
    basePrice: number,
    discountType: "percentage" | "fixed" | "none" = "none",
    discountValue: number = 0
): FunnelPriceCalc {
    const originalPrice = Math.max(0, basePrice);
    let discountedPrice = originalPrice;

    if (discountType === "percentage" && discountValue > 0) {
        const pct = Math.min(100, Math.max(0, discountValue));
        discountedPrice = Math.round(originalPrice * (1 - pct / 100) * 100) / 100;
    } else if (discountType === "fixed" && discountValue > 0) {
        discountedPrice = Math.max(0, originalPrice - discountValue);
    }

    const savingsAmount = Math.max(0, originalPrice - discountedPrice);

    return {
        originalPrice,
        discountedPrice,
        savingsAmount,
    };
}

export function getNextStepSlug(
    steps: { id: string; slug: string }[],
    currentStepId: string,
    customNextStepId?: string
): string | null {
    if (customNextStepId) {
        const target = steps.find((s) => s.id === customNextStepId);
        if (target) return target.slug;
    }

    const currIndex = steps.findIndex((s) => s.id === currentStepId);
    if (currIndex >= 0 && currIndex < steps.length - 1) {
        return steps[currIndex + 1].slug;
    }

    return null;
}
