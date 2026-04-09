# Detailed GTM Strategy (SLG vs PLG) Functional Specification

This plan defines exactly how metric "drivers" (PMF, Quality, Sales) mathematically impact financial "levers" (Conversion, GMV, ARPU) to calculate overall Revenue.

## Functional Sensitivity Analysis

### 1. Global Drivers
The following weights are applied across multiple industries to modify the base conversion rates and volumes defined in the `INDUSTRY_PRICING_CONFIG`.

*   **PMF Multiplier (`pmfFactor`)**: 
    *   **Formula**: `0.5 + (metrics.pmf_score / 100)`
    *   **Impact**: Scales **Paid Conversion** (PLG) and **Transaction Volume** (SLG/FinTech/Marketplace). A 100-score startup earns 50% more revenue per user than a 50-score startup.
*   **Product Quality Multiplier (`qualityFactor`)**:
    *   **Formula**: `0.8 + (metrics.product_quality / 250)`
    *   **Impact**: Primarily scales **Retention** (implicit) and **IAP/SaaS Conversion**. High quality provides a ±20% swing on top of PMF.
*   **Sales Influence (`salesConversionBoost`)**:
    *   **Formula**: `1 + (Total_Sales_Skill_in_Team * 0.005)`
    *   **Impact**: Multiplies **Conversion Rate** for SLG contracts and high-ticket items. 100 points of Sales Skill = +50% Conversion.

---

## Industry-Specific Revenue Logic

### Marketplace
*   **Lever**: `avgVolume` (GMV per user)
*   **PLG Math**: `Base_GMV * pmfFactor * (1 + log10(users/1000) * 0.2)`
    *   *Why*: Network effects make the platform more valuable as it grows.
*   **SLG Math**: `(Base_GMV * 2.5) * qualityFactor * salesConversionBoost`
    *   *Why*: High-touch managed supply is more expensive but higher quality and trust.

### Mobile Game
*   **Lever**: `iapConversion` (Paid User %) and `adARPU`
*   **PLG Math**: `Base_IAP_CR * qualityFactor * (1 - (ad_intensity / 75))`
    *   *Why*: High ad frequency actively destroys IAP conversion logic.
*   **SLG Math**: `Price_Per_Seat * Licensed_Users * salesConversionBoost`
    *   *Why*: B2B deals depend entirely on the sales team's negotiation power.

### FinTech
*   **Lever**: `avgVolume` (Transacted GMV)
*   **PLG Math**: `Base_Vol * pmfFactor * qualityFactor`
    *   *Why*: Trust/Stability are the only things that drive consumer wallet share.
*   **SLG Math**: `(Contract_Vol) * (salesConversionBoost * 0.8)`
    *   *Why*: Enterprise rails depend on sales but usually have volume-based discounts.

### SaaS / Generic
*   **Lever**: `paidUsers` (Subscriber count)
*   **PLG Math**: `users * (Base_CR * pmfFactor * priceFactor)`
    *   *Why*: Conversion is a tension between Product Fit and Price.
*   **SLG Math**: `Leads * (Base_Contract_CR * salesConversionBoost)`
    *   *Why*: Enterprise conversion is purely a function of Sales Team efficacy.

---

## Verification Plan

### Automated Tests
- `npx tsc src/lib/engine/simulation.ts` to ensure formula syntax is correct.

### Manual Verification
- **Test Case 1**: In a Marketplace startup, double the user base. Check if `avgVolume` increases slightly due to the Network Effect.
- **Test Case 2**: In a Mobile Game, set Ad Intensity to 0. Check if IAP Revenue spikes. Then set Ad Intensity to 100 and check if IAP Revenue craters.
- **Test Case 3**: In an SLG SaaS startup, hire 3 high-level Sales People. Check if MRR increases proportionally to their skill boost.
