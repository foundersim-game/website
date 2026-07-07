import fs from 'fs';

// Helper to replace unescaped entities in specific lines
function replaceEntities(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    for (const repl of replacements) {
        const i = repl.line - 1;
        // Basic naive replacement, carefully targeted
        if (repl.from && repl.to) {
             lines[i] = lines[i].replace(repl.from, repl.to);
        }
    }
    fs.writeFileSync(file, lines.join('\n'));
}

// 1. src/app/dashboard/page.tsx
replaceEntities('src/app/dashboard/page.tsx', [
    { line: 3662, from: "Can't afford this perk.", to: "Can&apos;t afford this perk." },
    { line: 3672, from: "Don't have enough cash.", to: "Don&apos;t have enough cash." },
    { line: 11802, from: "Let's go!", to: "Let&apos;s go!" },
    { line: 11844, from: "Let's go!", to: "Let&apos;s go!" },
    { line: 12110, from: "Let's Play", to: "Let&apos;s Play" }
]);

// 2. src/app/story-mode/[campaignId]/play/page.tsx
replaceEntities('src/app/story-mode/[campaignId]/play/page.tsx', [
    { line: 114, from: 'No campaign found or it doesn\'t exist.', to: 'No campaign found or it doesn&apos;t exist.' }
]);

// 3. src/components/HowToPlay.tsx
replaceEntities('src/components/HowToPlay.tsx', [
    { line: 111, from: 'Select "Custom Pitch"', to: 'Select &quot;Custom Pitch&quot;' }
]);

// 4. src/components/ThemeProvider.tsx
replaceEntities('src/components/ThemeProvider.tsx', [
    { line: 60, from: '//@ts-ignore', to: '//@ts-expect-error' },
    { line: 60, from: '// @ts-ignore', to: '// @ts-expect-error' }
]);

// 5. src/components/story/ActProgressBar.tsx
replaceEntities('src/components/story/ActProgressBar.tsx', [
    { line: 75, from: 'Hover to see "Time remaining"', to: 'Hover to see &quot;Time remaining&quot;' }
]);

// 6. src/components/story/StoryDashboard.tsx
replaceEntities('src/components/story/StoryDashboard.tsx', [
    { line: 993, from: "Your company's inner circle", to: "Your company&apos;s inner circle" }
]);
console.log("ESLint fixes applied");
