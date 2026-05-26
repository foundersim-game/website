import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Add states
state_old = '    const [marketStocks, setMarketStocks] = useState<MarketStock[]>([]);'
state_new = '''    const [marketStocks, setMarketStocks] = useState<MarketStock[]>([]);
    const [tradeSectorFilter, setTradeSectorFilter] = useState("All");
    const [tradeSelectedSymbol, setTradeSelectedSymbol] = useState<string | null>(null);
    const [tradeQtyPct, setTradeQtyPct] = useState(10);'''
content = content.replace(state_old, state_new)

# Find and replace TradePanel
# It starts at: const TradePanel = () => {
# and ends at: return <TradePanel />;

trade_panel_start = content.find('const TradePanel = () => {')
trade_panel_end = content.find('return <TradePanel />;', trade_panel_start) + len('return <TradePanel />;')

trade_panel_code = content[trade_panel_start:trade_panel_end]

new_code = trade_panel_code.replace('const TradePanel = () => {', '')
new_code = new_code.replace('const [sectorFilter, setSectorFilter] = useState("All");', '')
new_code = new_code.replace('const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);', '')
new_code = new_code.replace('const [qtyPct, setQtyPct] = useState(10); // % of available cash to deploy', '')
new_code = new_code.replace('sectorFilter', 'tradeSectorFilter')
new_code = new_code.replace('setSectorFilter', 'setTradeSectorFilter')
new_code = new_code.replace('selectedSymbol', 'tradeSelectedSymbol')
new_code = new_code.replace('setSelectedSymbol', 'setTradeSelectedSymbol')
new_code = new_code.replace('qtyPct', 'tradeQtyPct')
new_code = new_code.replace('setQtyPct', 'setTradeQtyPct')
new_code = new_code.replace('return <TradePanel />;', '')

# The code originally ended with:
#             );
#         };
#
#         return <TradePanel />;
# We need to remove the trailing '};'

new_code = new_code.rsplit('};', 1)[0]
content = content[:trade_panel_start] + new_code + content[trade_panel_end:]

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

with open('src/components/PublicMarketTicker.tsx', 'r') as f:
    ticker = f.read()
ticker = ticker.replace('animate-[marquee_20s_linear_infinite]', 'animate-[marquee_90s_linear_infinite]')
with open('src/components/PublicMarketTicker.tsx', 'w') as f:
    f.write(ticker)
