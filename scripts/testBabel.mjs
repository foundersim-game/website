import fs from 'fs';
import path from 'path';
import babel from '@babel/core';
import traverse from '@babel/traverse';
import generator from '@babel/generator';

// We just want to check if we can parse page.tsx without errors
const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
const code = fs.readFileSync(pagePath, 'utf8');

try {
    const ast = babel.parse(code, {
        filename: 'page.tsx',
        presets: [
            ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
            ['@babel/preset-react', { runtime: 'automatic' }]
        ],
        plugins: []
    });
    console.log("Successfully parsed page.tsx!");
} catch (e) {
    console.error("Failed to parse page.tsx:", e);
}
