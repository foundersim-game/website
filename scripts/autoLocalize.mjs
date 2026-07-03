import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
});

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
const sourceFile = project.getSourceFile(pagePath);

if (!sourceFile) {
    console.error("Could not find page.tsx");
    process.exit(1);
}

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

const targets = [
    'product', 'marketing', 'founder', 'lifestyle', 'trade_stock', 'personal_trade', 'margin_loan',
    '10b51', 'philanthropy', 'analysts', 'pr_comms', 'options', 'subsidiary'
];

let modified = false;

function generateKey(text) {
    let key = text.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase().split(/\s+/).slice(0, 3).join('_');
    if (!key) key = "str_" + crypto.randomBytes(4).toString('hex');
    return key;
}

function processNode(node, category) {
    if (Node.isJsxText(node)) {
        let text = node.getLiteralText();
        let trimmed = text.trim();
        if (trimmed.length > 1 && !/^[0-9+-\.,$%]+$/.test(trimmed) && trimmed !== '}' && trimmed !== '{' && trimmed !== '&&' && trimmed !== '||') {
            let key = generateKey(trimmed);
            if (en.dashboard[category][key] && en.dashboard[category][key] !== trimmed) {
                key = key + "_" + crypto.randomBytes(2).toString('hex');
            }
            en.dashboard[category][key] = trimmed;
            es.dashboard[category][key] = trimmed;
            de.dashboard[category][key] = trimmed;

            // preserve leading and trailing whitespace
            const leadingWhitespace = text.match(/^\s*/)[0];
            const trailingWhitespace = text.match(/\s*$/)[0];
            
            node.replaceWithText(`${leadingWhitespace}{t("dashboard.${category}.${key}")}${trailingWhitespace}`);
            modified = true;
            return; // Node replaced, don't recurse into children of this node (it has none anyway)
        }
    } else if (Node.isStringLiteral(node)) {
        const parent = node.getParent();
        let shouldReplace = false;
        let replaceFormat = `t("dashboard.${category}.{key}")`;

        if (Node.isJsxAttribute(parent)) {
            const attrName = parent.getNameNode().getText();
            if (['title', 'description', 'placeholder', 'label'].includes(attrName)) {
                shouldReplace = true;
                replaceFormat = `{t("dashboard.${category}.{key}")}`;
            }
        } else if (Node.isCallExpression(parent)) {
            const expressionText = parent.getExpression().getText();
            // toast.success, toast.error, sheetHeader
            if (expressionText.startsWith('toast.') || expressionText === 'sheetHeader' || expressionText === 'toast') {
                shouldReplace = true;
                replaceFormat = `t("dashboard.${category}.{key}")`;
            }
        } else if (Node.isPropertyAssignment(parent)) {
            // inside toast object: { description: "..." }
            const propName = parent.getName();
            if (propName === 'description' || propName === 'title' || propName === 'desc') {
                shouldReplace = true;
                replaceFormat = `t("dashboard.${category}.{key}")`;
            }
        }

        if (shouldReplace) {
            let text = node.getLiteralValue();
            let trimmed = text.trim();
            if (trimmed.length > 1 && !/^[0-9+-\.,$%]+$/.test(trimmed) && !trimmed.startsWith('dashboard.')) {
                let key = generateKey(trimmed);
                if (en.dashboard[category][key] && en.dashboard[category][key] !== trimmed) {
                    key = key + "_" + crypto.randomBytes(2).toString('hex');
                }
                en.dashboard[category][key] = trimmed;
                es.dashboard[category][key] = trimmed;
                de.dashboard[category][key] = trimmed;

                node.replaceWithText(replaceFormat.replace('{key}', key));
                modified = true;
                return;
            }
        }
    }

    // Process children, collecting them into an array first to avoid iterator invalidation during mutation
    const children = node.getChildren();
    for (const child of children) {
        if (!child.wasForgotten()) {
            processNode(child, category);
        }
    }
}

// Find the category if blocks
const ifStatements = sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement);

for (const ifStmt of ifStatements) {
    const expr = ifStmt.getExpression();
    if (Node.isBinaryExpression(expr)) {
        const left = expr.getLeft().getText();
        const rightText = expr.getRight().getText().replace(/['"]/g, '');
        const op = expr.getOperatorToken().getText();

        if (left === 'category' && op === '===' && targets.includes(rightText)) {
            console.log(`Processing category: ${rightText}`);
            
            if (!en.dashboard[rightText]) en.dashboard[rightText] = {};
            if (!es.dashboard[rightText]) es.dashboard[rightText] = {};
            if (!de.dashboard[rightText]) de.dashboard[rightText] = {};

            const thenBlock = ifStmt.getThenStatement();
            processNode(thenBlock, rightText);
        } else if (left === 'category' && op === '===') {
            // Check if it's a multi-condition OR: category === "trade_stock" || category === "personal_trade"
            // Wait, the AST for multi-condition is a BinaryExpression where the left is a BinaryExpression.
            // Let's just catch simple `category === "X"` first.
        }
    } else if (Node.isBinaryExpression(expr) && expr.getOperatorToken().getText() === '||') {
        // e.g. category === "trade_stock" || category === "personal_trade"
        // Let's just process the first condition's right text for category grouping
        let categoryName = null;
        expr.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(b => {
            if (b.getLeft().getText() === 'category' && b.getOperatorToken().getText() === '===') {
                const right = b.getRight().getText().replace(/['"]/g, '');
                if (targets.includes(right)) {
                    categoryName = right;
                }
            }
        });

        if (categoryName) {
            console.log(`Processing multi-category: ${categoryName}`);
            if (!en.dashboard[categoryName]) en.dashboard[categoryName] = {};
            if (!es.dashboard[categoryName]) es.dashboard[categoryName] = {};
            if (!de.dashboard[categoryName]) de.dashboard[categoryName] = {};
            const thenBlock = ifStmt.getThenStatement();
            processNode(thenBlock, categoryName);
        }
    }
}

if (modified) {
    sourceFile.saveSync();
    fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
    fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
    fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
    console.log("Successfully auto-localized remaining sections!");
} else {
    console.log("No strings needed replacement.");
}
