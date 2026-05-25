import { MarketStock, PortfolioPosition, SeasonType, MacroEvent } from "../types/database.types";

/**
 * Initializes the default market stocks representing competitors and sector indices.
 */
export function initializeMarketStocks(playerCompanySymbol?: string, playerIpoPrice?: number): MarketStock[] {
    const baseStocks: MarketStock[] = [
        // Technology
        { symbol: "GOOG", companyName: "Search Co", sector: "Technology", currentPrice: 175.20, sharesOutstanding: 1_000_000_000, peRatio: 25, momentum: 0, volatility: 0.05, rsi: 50, priceHistory: [175.20] },
        { symbol: "PEAR", companyName: "Pear Computers", sector: "Technology", currentPrice: 190.50, sharesOutstanding: 800_000_000, peRatio: 30, momentum: 0.1, volatility: 0.04, rsi: 55, priceHistory: [190.50] },
        { symbol: "MCLD", companyName: "MicroCloud", sector: "Technology", currentPrice: 405.10, sharesOutstanding: 500_000_000, peRatio: 35, momentum: 0.2, volatility: 0.06, rsi: 60, priceHistory: [405.10] },
        { symbol: "SFLX", companyName: "StreamFlix", sector: "Technology", currentPrice: 600.00, sharesOutstanding: 450_000_000, peRatio: 45, momentum: -0.1, volatility: 0.08, rsi: 45, priceHistory: [600.00] },
        { symbol: "CRMS", companyName: "CloudCRM", sector: "Technology", currentPrice: 245.80, sharesOutstanding: 300_000_000, peRatio: 50, momentum: 0.05, volatility: 0.07, rsi: 52, priceHistory: [245.80] },
        
        // Energy
        { symbol: "XON", companyName: "Exxon Energy", sector: "Energy", currentPrice: 110.20, sharesOutstanding: 2_000_000_000, peRatio: 12, momentum: 0.02, volatility: 0.03, rsi: 48, priceHistory: [110.20] },
        { symbol: "NXG", companyName: "NextGen Solar", sector: "Energy", currentPrice: 45.30, sharesOutstanding: 150_000_000, peRatio: -10, momentum: 0.15, volatility: 0.12, rsi: 65, priceHistory: [45.30] },
        { symbol: "OPEC", companyName: "Opec Corp", sector: "Energy", currentPrice: 85.00, sharesOutstanding: 1_500_000_000, peRatio: 10, momentum: -0.05, volatility: 0.04, rsi: 42, priceHistory: [85.00] },
        { symbol: "WIND", companyName: "WindTech", sector: "Energy", currentPrice: 32.10, sharesOutstanding: 200_000_000, peRatio: 85, momentum: 0.08, volatility: 0.10, rsi: 58, priceHistory: [32.10] },
        { symbol: "PGLB", companyName: "PetroGlobal", sector: "Energy", currentPrice: 95.50, sharesOutstanding: 1_200_000_000, peRatio: 14, momentum: 0.01, volatility: 0.03, rsi: 50, priceHistory: [95.50] },

        // Healthcare
        { symbol: "PHRM", companyName: "PharmaCorp", sector: "Healthcare", currentPrice: 150.00, sharesOutstanding: 800_000_000, peRatio: 20, momentum: 0.04, volatility: 0.04, rsi: 54, priceHistory: [150.00] },
        { symbol: "MDTC", companyName: "MediTech", sector: "Healthcare", currentPrice: 88.50, sharesOutstanding: 400_000_000, peRatio: 25, momentum: -0.02, volatility: 0.05, rsi: 47, priceHistory: [88.50] },
        { symbol: "GBIO", companyName: "Global Bio", sector: "Healthcare", currentPrice: 210.20, sharesOutstanding: 300_000_000, peRatio: 40, momentum: 0.12, volatility: 0.09, rsi: 62, priceHistory: [210.20] },
        { symbol: "CARE", companyName: "CarePlus", sector: "Healthcare", currentPrice: 75.40, sharesOutstanding: 500_000_000, peRatio: 18, momentum: 0.01, volatility: 0.03, rsi: 51, priceHistory: [75.40] },
        { symbol: "VITA", companyName: "VitaGen", sector: "Healthcare", currentPrice: 42.80, sharesOutstanding: 150_000_000, peRatio: -5, momentum: -0.15, volatility: 0.15, rsi: 35, priceHistory: [42.80] },

        // Defense
        { symbol: "LKD", companyName: "Lockheed Dynamics", sector: "Defense", currentPrice: 450.00, sharesOutstanding: 250_000_000, peRatio: 18, momentum: 0.05, volatility: 0.03, rsi: 55, priceHistory: [450.00] },
        { symbol: "BAER", companyName: "Boeing Aero", sector: "Defense", currentPrice: 215.30, sharesOutstanding: 600_000_000, peRatio: 22, momentum: -0.08, volatility: 0.06, rsi: 42, priceHistory: [215.30] },
        { symbol: "SPCT", companyName: "SpaceTech", sector: "Defense", currentPrice: 310.50, sharesOutstanding: 100_000_000, peRatio: 80, momentum: 0.18, volatility: 0.12, rsi: 68, priceHistory: [310.50] },
        { symbol: "DEF", companyName: "Defendo", sector: "Defense", currentPrice: 125.00, sharesOutstanding: 350_000_000, peRatio: 15, momentum: 0.02, volatility: 0.04, rsi: 52, priceHistory: [125.00] },
        { symbol: "ORBT", companyName: "Orbit Corp", sector: "Defense", currentPrice: 85.20, sharesOutstanding: 200_000_000, peRatio: 35, momentum: 0.07, volatility: 0.08, rsi: 57, priceHistory: [85.20] },

        // Real Estate
        { symbol: "GLBP", companyName: "Global Properties", sector: "Real Estate", currentPrice: 65.40, sharesOutstanding: 500_000_000, peRatio: 14, momentum: 0.01, volatility: 0.04, rsi: 50, priceHistory: [65.40] },
        { symbol: "URET", companyName: "Urban REIT", sector: "Real Estate", currentPrice: 120.50, sharesOutstanding: 200_000_000, peRatio: 16, momentum: -0.04, volatility: 0.05, rsi: 46, priceHistory: [120.50] },
        { symbol: "MTRH", companyName: "Metro Homes", sector: "Real Estate", currentPrice: 45.80, sharesOutstanding: 300_000_000, peRatio: 12, momentum: 0.03, volatility: 0.06, rsi: 53, priceHistory: [45.80] },
        { symbol: "CEST", companyName: "Commercial Estates", sector: "Real Estate", currentPrice: 88.20, sharesOutstanding: 400_000_000, peRatio: 18, momentum: -0.10, volatility: 0.07, rsi: 40, priceHistory: [88.20] },
        { symbol: "LCRP", companyName: "LandCorp", sector: "Real Estate", currentPrice: 55.10, sharesOutstanding: 600_000_000, peRatio: 15, momentum: 0.02, volatility: 0.03, rsi: 51, priceHistory: [55.10] },

        // Broad Market
        { symbol: "VTI", companyName: "Total Market Index", sector: "Broad Market", currentPrice: 260.00, sharesOutstanding: 2_000_000_000, peRatio: 20, momentum: 0.02, volatility: 0.02, rsi: 52, priceHistory: [260.00] },
        { symbol: "QQQ", companyName: "Tech Index", sector: "Broad Market", currentPrice: 450.00, sharesOutstanding: 1_500_000_000, peRatio: 28, momentum: 0.04, volatility: 0.03, rsi: 55, priceHistory: [450.00] },
        { symbol: "DIA", companyName: "Industrial Index", sector: "Broad Market", currentPrice: 380.00, sharesOutstanding: 800_000_000, peRatio: 18, momentum: 0.01, volatility: 0.02, rsi: 50, priceHistory: [380.00] },
        { symbol: "IWM", companyName: "Small Cap Index", sector: "Broad Market", currentPrice: 200.00, sharesOutstanding: 1_200_000_000, peRatio: 25, momentum: -0.02, volatility: 0.04, rsi: 48, priceHistory: [200.00] },
        { symbol: "GLD", companyName: "Gold Trust", sector: "Broad Market", currentPrice: 220.00, sharesOutstanding: 500_000_000, peRatio: 0, momentum: 0.05, volatility: 0.02, rsi: 58, priceHistory: [220.00] },
    ];

    if (playerCompanySymbol && playerIpoPrice) {
        baseStocks.unshift({
            symbol: playerCompanySymbol,
            companyName: "Your Company",
            sector: "Technology",
            currentPrice: playerIpoPrice,
            sharesOutstanding: 100_000_000,
            peRatio: 50,
            momentum: 0,
            volatility: 0.08,
            rsi: 50,
            priceHistory: [playerIpoPrice, playerIpoPrice * 0.98, playerIpoPrice * 1.02] // Pre-fill some history
        });
    }

    return baseStocks;
}

export const MACRO_EVENTS: Omit<MacroEvent, 'id' | 'startMonth'>[] = [
    { name: "Fed Rate Hike", description: "Interest rates increased to combat inflation.", durationMonths: 6, affectedSectors: [{ sector: "Technology", momentumShift: -0.15, volatilityMultiplier: 1.5 }, { sector: "Real Estate", momentumShift: -0.2, volatilityMultiplier: 1.5 }, { sector: "Broad Market", momentumShift: -0.05, volatilityMultiplier: 1.2 }] },
    { name: "Fed Rate Cut", description: "Interest rates slashed to stimulate growth.", durationMonths: 6, affectedSectors: [{ sector: "Technology", momentumShift: 0.2, volatilityMultiplier: 1.3 }, { sector: "Real Estate", momentumShift: 0.25, volatilityMultiplier: 1.2 }, { sector: "Broad Market", momentumShift: 0.1, volatilityMultiplier: 1.1 }] },
    { name: "Global Oil Shock", description: "Supply chain disruptions spike oil prices.", durationMonths: 4, affectedSectors: [{ sector: "Energy", momentumShift: 0.3, volatilityMultiplier: 2.0 }, { sector: "Broad Market", momentumShift: -0.08, volatilityMultiplier: 1.4 }] },
    { name: "Healthcare Subsidies", description: "Government announces massive healthcare spending.", durationMonths: 5, affectedSectors: [{ sector: "Healthcare", momentumShift: 0.25, volatilityMultiplier: 1.3 }] },
    { name: "Tech Antitrust Lawsuit", description: "Major tech firms face breakup threats.", durationMonths: 8, affectedSectors: [{ sector: "Technology", momentumShift: -0.25, volatilityMultiplier: 2.0 }] },
    { name: "Global Pandemic Scare", description: "A new virus variant causes market panic.", durationMonths: 3, affectedSectors: [{ sector: "Real Estate", momentumShift: -0.3, volatilityMultiplier: 2.5 }, { sector: "Healthcare", momentumShift: 0.2, volatilityMultiplier: 1.8 }, { sector: "Broad Market", momentumShift: -0.15, volatilityMultiplier: 2.0 }] },
    { name: "Geopolitical Conflict", description: "Tensions escalate overseas.", durationMonths: 6, affectedSectors: [{ sector: "Defense", momentumShift: 0.3, volatilityMultiplier: 1.5 }, { sector: "Energy", momentumShift: 0.15, volatilityMultiplier: 1.8 }, { sector: "Broad Market", momentumShift: -0.1, volatilityMultiplier: 1.5 }] },
    { name: "Tech Earnings Boom", description: "SaaS and AI firms report record profits.", durationMonths: 4, affectedSectors: [{ sector: "Technology", momentumShift: 0.25, volatilityMultiplier: 1.2 }, { sector: "Broad Market", momentumShift: 0.05, volatilityMultiplier: 1.0 }] },
    { name: "Housing Bubble Burst", description: "Mortgage defaults hit record highs.", durationMonths: 9, affectedSectors: [{ sector: "Real Estate", momentumShift: -0.4, volatilityMultiplier: 2.5 }, { sector: "Broad Market", momentumShift: -0.1, volatilityMultiplier: 1.5 }] },
    { name: "Breakthrough Cancer Drug", description: "FDA approves revolutionary treatment.", durationMonths: 3, affectedSectors: [{ sector: "Healthcare", momentumShift: 0.3, volatilityMultiplier: 1.8 }] },
    { name: "Renewable Energy Mandate", description: "New global treaties force green energy adoption.", durationMonths: 6, affectedSectors: [{ sector: "Energy", momentumShift: 0.2, volatilityMultiplier: 1.5 }] },
    { name: "Supply Chain Crisis", description: "Global shipping grinds to a halt.", durationMonths: 5, affectedSectors: [{ sector: "Technology", momentumShift: -0.15, volatilityMultiplier: 1.4 }, { sector: "Broad Market", momentumShift: -0.05, volatilityMultiplier: 1.2 }] },
    { name: "Peace Treaty Signed", description: "Major global conflicts officially end.", durationMonths: 4, affectedSectors: [{ sector: "Defense", momentumShift: -0.2, volatilityMultiplier: 1.5 }, { sector: "Broad Market", momentumShift: 0.15, volatilityMultiplier: 1.1 }] },
];

export function checkMacroEventSpawn(currentEvent: MacroEvent | null | undefined, month: number): MacroEvent | null {
    if (currentEvent && currentEvent.startMonth + currentEvent.durationMonths > month) {
        return currentEvent; // Event still active
    }
    
    // 5% chance per month to spawn a new event if none active
    if (!currentEvent && Math.random() < 0.05) {
        const template = MACRO_EVENTS[Math.floor(Math.random() * MACRO_EVENTS.length)];
        return {
            ...template,
            id: `macro_${Date.now()}`,
            startMonth: month
        };
    }
    return null; // Event ended or none spawned
}

/**
 * Simulates one month of market activity for all public stocks.
 * Modifies the array in place or returns a new one.
 */
export function processMarketMonth(stocks: MarketStock[], currentSeason: SeasonType, activeEvent?: MacroEvent | null): MarketStock[] {
    return stocks.map(stock => {
        let baseVol = stock.volatility || 0.05;
        let eventMomentum = 0;
        
        // Apply Macro Event Multipliers
        if (activeEvent) {
            const effect = activeEvent.affectedSectors.find(e => e.sector === stock.sector);
            if (effect) {
                baseVol *= effect.volatilityMultiplier;
                eventMomentum = effect.momentumShift * 0.1; // scale down for monthly tick
            }
        }

        let randomMove = (Math.random() + Math.random() + Math.random() - 1.5) * baseVol;

        // Apply macro season effects (now with noise)
        let macroEffect = 0;
        const macroNoise = (Math.random() - 0.5) * 0.02; // Monthly macro jitter
        if (currentSeason === "Bull Market") macroEffect = 0.015 + macroNoise;
        if (currentSeason === "Bear Market") macroEffect = -0.02 + macroNoise;
        if (currentSeason === "AI Boom" && stock.sector === "Technology") macroEffect = 0.04 + macroNoise;

        // Apply momentum (mean reverting, capped)
        const momentumEffect = Math.max(-0.05, Math.min(0.05, stock.momentum * 0.015));
        
        // Final price multiplier
        let changePct = randomMove + macroEffect + momentumEffect + eventMomentum;
        
        // Add "sector noise" - correlated movement for stocks in same sector
        const sectorNoise = (Math.random() - 0.5) * 0.01;
        changePct += sectorNoise;

        changePct = Math.max(-0.3, Math.min(0.4, changePct)); 
        
        // Occasionally trigger an idiosyncratic "bad month" or "good month"
        if (Math.random() < 0.05) changePct += (Math.random() - 0.5) * 0.2; 

        const newPrice = Math.max(0.01, stock.currentPrice * (1 + changePct));
        
        // Update momentum towards mean (stronger decay to prevent runaway)
        let newMomentum = stock.momentum * 0.7 + (changePct * 1.5);
        newMomentum = Math.max(-1, Math.min(1, newMomentum));

        // Update Price History
        const history = [...(stock.priceHistory || [stock.currentPrice])];
        history.push(newPrice);
        if (history.length > 12) history.shift();

        // Calculate simplified RSI (14 period approx)
        let gains = 0;
        let losses = 0;
        for (let i = 1; i < history.length; i++) {
            const diff = history[i] - history[i-1];
            if (diff > 0) gains += diff;
            else losses += Math.abs(diff);
        }
        
        let rsi = 50;
        if (history.length > 2) {
            const avgGain = gains / (history.length - 1);
            const avgLoss = losses / (history.length - 1);
            
            if (avgLoss === 0) rsi = 100;
            else if (avgGain === 0) rsi = 0;
            else {
                const rs = avgGain / avgLoss;
                rsi = 100 - (100 / (1 + rs));
            }
            
            // "Noise injection" to RSI to keep it from being perfectly binary 100/0 when trends are strong
            if (rsi > 98) rsi = 95 + Math.random() * 4;
            if (rsi < 2) rsi = 1 + Math.random() * 4;
        }

        // ── IDIOSYNCRATIC NEWS EVENTS ──
        let recentNews = "";
        let newsMomentumImpact = 0;
        
        // Every stock generates news every month based on a distribution
        const roll = Math.random();
        if (roll < 0.05) { // 5% Highly Positive
            const highlyPositive = ["Blowout Earnings Report", "Breakthrough Product Revealed", "Major Competitor Bankrupt", "Wins Massive Government Contract", "Analyst Upgrade to Strong Buy"];
            recentNews = highlyPositive[Math.floor(Math.random() * highlyPositive.length)];
            newsMomentumImpact = 0.5 + Math.random() * 0.5; // Huge momentum swing up
        } else if (roll < 0.25) { // 20% Positive
            const positive = ["Beats Revenue Estimates", "Expands to New Markets", "New Executive Hire", "Positive Sector Outlook", "Minor Product Success"];
            recentNews = positive[Math.floor(Math.random() * positive.length)];
            newsMomentumImpact = 0.1 + Math.random() * 0.3; // Moderate up
        } else if (roll < 0.75) { // 50% Neutral
            const neutral = ["In-Line Earnings", "Maintains Market Share", "Routine Board Meeting", "No Major Changes Reported", "Industry Growth Stable", "Consolidating Operations"];
            recentNews = neutral[Math.floor(Math.random() * neutral.length)];
            newsMomentumImpact = (Math.random() - 0.5) * 0.1; // Tiny variance
        } else if (roll < 0.95) { // 20% Negative
            const negative = ["Misses Revenue Estimates", "Minor Layoffs Announced", "Supply Chain Delays", "Analyst Downgrade to Hold", "Increased Competition"];
            recentNews = negative[Math.floor(Math.random() * negative.length)];
            newsMomentumImpact = -(0.1 + Math.random() * 0.3); // Moderate down
        } else { // 5% Highly Negative
            const highlyNegative = ["CEO Abruptly Resigns", "Faces Regulatory Probe", "Massive Data Breach", "Product Recall Announced", "Analyst Downgrade to Sell"];
            recentNews = highlyNegative[Math.floor(Math.random() * highlyNegative.length)];
            newsMomentumImpact = -(0.5 + Math.random() * 0.5); // Huge momentum swing down
        }

        // Apply news impact immediately to price and momentum
        const finalPrice = Math.max(0.01, newPrice * (1 + (newsMomentumImpact * 0.1))); // Instant 5-10% pop/drop
        let finalMomentum = Math.max(-1, Math.min(1, newMomentum + newsMomentumImpact));

        return {
            ...stock,
            currentPrice: finalPrice,
            momentum: finalMomentum,
            priceHistory: history,
            rsi: rsi,
            recentNews: recentNews
        };
    });
}

/**
 * Executes a trade for a portfolio (Corporate or Personal).
 * Returns the updated cash balance and the updated portfolio array.
 * If there's insufficient cash/shares, throws an error or returns null.
 */
export function executeTrade(
    portfolio: PortfolioPosition[], 
    cash: number, 
    symbol: string, 
    shares: number, // Positive for buy, negative for sell
    currentPrice: number
): { newCash: number, newPortfolio: PortfolioPosition[] } {
    
    const cost = shares * currentPrice;

    // Check cash for buy
    if (shares > 0 && cash < cost) {
        throw new Error("Insufficient cash");
    }

    const posIndex = portfolio.findIndex(p => p.symbol === symbol);
    let newPortfolio = [...portfolio];

    if (shares > 0) {
        // Buy logic
        if (posIndex >= 0) {
            const pos = newPortfolio[posIndex];
            const totalValue = (pos.shares * pos.averageCost) + cost;
            const newShares = pos.shares + shares;
            newPortfolio[posIndex] = {
                ...pos,
                shares: newShares,
                averageCost: totalValue / newShares
            };
        } else {
            newPortfolio.push({
                symbol,
                shares,
                averageCost: currentPrice
            });
        }
    } else {
        // Sell logic (shares is negative)
        const sellAmount = Math.abs(shares);
        if (posIndex === -1 || newPortfolio[posIndex].shares < sellAmount) {
            throw new Error("Insufficient shares to sell");
        }
        
        const pos = newPortfolio[posIndex];
        const newShares = pos.shares - sellAmount;
        
        if (newShares === 0) {
            newPortfolio.splice(posIndex, 1);
        } else {
            newPortfolio[posIndex] = {
                ...pos,
                shares: newShares
            };
        }
    }

    return {
        newCash: cash - cost, // cost is negative if selling, so cash increases
        newPortfolio
    };
}

/**
 * Calculates the total market value of a portfolio
 */
export function getPortfolioValue(portfolio: PortfolioPosition[], stocks: MarketStock[]): number {
    return portfolio.reduce((total, pos) => {
        const stock = stocks.find(s => s.symbol === pos.symbol);
        const price = stock ? stock.currentPrice : pos.averageCost; // Fallback to average cost if delisted
        return total + (pos.shares * price);
    }, 0);
}
