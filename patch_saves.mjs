import fs from 'fs';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add imports if needed
    if (!content.includes('secureSave')) {
        // Find last import
        const lines = content.split('\n');
        const lastImportIndex = lines.reduce((acc, line, i) => line.startsWith('import ') ? i : acc, -1);
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, 'import { secureSave, secureLoad } from "@/lib/security";');
            content = lines.join('\n');
        }
    }

    // Replace JSON.parse(localStorage.getItem("founder_sim_state")) with secureLoad
    content = content.replace(/JSON\.parse\(localStorage\.getItem\("founder_sim_state"\)\s*\|\|\s*"{}"\)/g, '(secureLoad("founder_sim_state") || {})');
    content = content.replace(/JSON\.parse\(localStorage\.getItem\("founder_sim_state"\)\s*\|\|\s*"null"\)/g, '(secureLoad("founder_sim_state"))');
    content = content.replace(/JSON\.parse\(\s*localStorage\.getItem\("founder_sim_state"\)\s*as string\s*\)/g, 'secureLoad("founder_sim_state")');
    content = content.replace(/const d = JSON\.parse\(fullState\);/g, 'const d = secureLoad("founder_sim_state") || JSON.parse(fullState);');

    // Replace setItem for state
    content = content.replace(/localStorage\.setItem\("founder_sim_state",\s*JSON\.stringify\((.*?)\)\);/g, 'secureSave("founder_sim_state", $1);');

    // For saves list
    content = content.replace(/JSON\.parse\(localStorage\.getItem\("founder_sim_saves"\)\s*\|\|\s*"\[\]"\)/g, '(secureLoad("founder_sim_saves") || [])');
    content = content.replace(/const existingSaves: SaveSlot\[\] = existingSavesRaw \? JSON\.parse\(existingSavesRaw\) : \[\];/g, 'const existingSaves: SaveSlot[] = secureLoad("founder_sim_saves") || [];');
    content = content.replace(/localStorage\.setItem\("founder_sim_saves",\s*JSON\.stringify\((.*?)\)\);/g, 'secureSave("founder_sim_saves", $1);');
    
    // For specific cases in dashboard
    content = content.replace(/localStorage\.removeItem\("founder_sim_state"\);/g, 'localStorage.removeItem("founder_sim_state");');

    fs.writeFileSync(filePath, content);
}

replaceInFile('src/app/dashboard/page.tsx');
replaceInFile('src/app/page.tsx');
replaceInFile('src/app/create-founder/page.tsx');

console.log("Patched saves");
