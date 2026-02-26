
import { QuoteRequest, QuoteResponse, BusinessSettings, LawnSize, Frequency } from '../types';

export const calculateManualQuote = (request: QuoteRequest, settings: BusinessSettings): QuoteResponse => {
    let basePrice = 0;
    let duration = 30;

    // 1. Base Price by Lawn Size or Area
    if (settings.enableLawnMeasurement && request.lawn_area && settings.pricePerUnitArea) {
        basePrice = request.lawn_area * settings.pricePerUnitArea;
        // Estimate duration based on area (simple heuristic: 1 min per 10m2 + 15 min setup)
        duration = Math.max(15, Math.round(request.lawn_area / 10) + 15);
    } else {
        switch (request.lawn_size) {
            case LawnSize.SMALL:
                basePrice = settings.smallLawnPrice || 20;
                duration = 30;
                break;
            case LawnSize.MEDIUM:
                basePrice = settings.mediumLawnPrice || 35;
                duration = 45;
                break;
            case LawnSize.LARGE:
                basePrice = settings.largeLawnPrice || 60;
                duration = 90;
                break;
            case LawnSize.ESTATE:
                basePrice = settings.estateLawnPrice || 100;
                duration = 180;
                break;
            default:
                basePrice = settings.mediumLawnPrice || 35;
                duration = 45;
        }
    }

    // 2. Extras Calculation
    let extrasTotal = 0;
    request.extras.forEach(extra => {
        if (extra.includes('Fertilizer')) extrasTotal += settings.extraFertilizerPrice || 15;
        if (extra.includes('Edging')) extrasTotal += settings.extraEdgingPrice || 10;
        if (extra.includes('Weeding')) extrasTotal += settings.extraWeedingPrice || 25;
        if (extra.includes('Leaf')) extrasTotal += settings.extraLeafCleanupPrice || 20;
    });

    // 3. Frequency Discount
    let discount = 0;
    if (request.frequency === Frequency.WEEKLY) {
        discount = (basePrice + extrasTotal) * ((settings.weeklyDiscount || 0) / 100);
    } else if (request.frequency === Frequency.FORTNIGHTLY) {
        discount = (basePrice + extrasTotal) * ((settings.fortnightlyDiscount || 0) / 100);
    } else if (request.frequency === Frequency.MONTHLY) {
        discount = (basePrice + extrasTotal) * ((settings.monthlyDiscount || 0) / 100);
    }

    const finalPrice = basePrice + extrasTotal - discount;

    const explanationPrefix = request.lawn_area
        ? `Based on your measured area of ${request.lawn_area}${settings.areaUnit || 'm2'}`
        : `Based on your ${request.lawn_size?.toLowerCase() || 'medium'} lawn`;

    return {
        estimatedPrice: parseFloat(finalPrice.toFixed(2)),
        estimatedDurationMinutes: duration,
        explanation: `${explanationPrefix} and ${request.frequency.toLowerCase()} schedule.`,
        surchargesApplied: [],
        priceBreakdown: {
            base: parseFloat(basePrice.toFixed(2)),
            extras: extrasTotal,
            surcharges: 0,
            discount: parseFloat(discount.toFixed(2))
        }
    };
};
