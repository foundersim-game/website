import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

files.forEach(f => {
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (data.dashboard && data.dashboard.skills) {
        const s = data.dashboard.skills;
        // Fix the mismatches by copying from the injected keys to the real IDs
        s.security_first = s.security_champion;
        s.growth_hacking = s.growth_hacker;
        s.viral_loops = s.retention_loop;
        s.brand_strategy = s.brand_storyteller;
        s.pr_mastery = s.pr_master;
        s.people_management = s.team_builder;
        s.culture_builder = s.culture_architect;
        s.board_mastery = s.board_management;
        s.term_sheet_reader = s.term_sheet_literacy;
        s.valuation_mastery = s.valuation_expert;
        s.lp_relationships = s.lp_networker;
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected correct skill IDs!");
