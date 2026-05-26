import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Remove from Dashboard (search for the exact lines)
states_str = """    const [tradeSectorFilter, setTradeSectorFilter] = useState("All");
    const [tradeSelectedSymbol, setTradeSelectedSymbol] = useState<string | null>(null);
    const [tradeQtyPct, setTradeQtyPct] = useState(10);"""

content = content.replace(states_str, "")

# Add to ActionSheet right after `const emp = employees[safeIdx];`
insert_target = "    const emp = employees[safeIdx];"
insert_idx = content.find(insert_target) + len(insert_target)

content = content[:insert_idx] + "\n" + states_str + content[insert_idx:]

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

