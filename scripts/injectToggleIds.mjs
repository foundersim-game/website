import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

files.forEach(f => {
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (data.dashboard && data.dashboard.lifestyle) {
        data.dashboard.lifestyle.pvt_chef = data.dashboard.lifestyle.private_chef;
        data.dashboard.lifestyle.pvt_chef_desc = data.dashboard.lifestyle.private_chef_desc;
        
        data.dashboard.lifestyle.pvt_trainer = data.dashboard.lifestyle.performance_coach;
        data.dashboard.lifestyle.pvt_trainer_desc = data.dashboard.lifestyle.performance_coach_desc;
        
        data.dashboard.lifestyle.tailored_clothing = data.dashboard.lifestyle.bespoke_tailoring;
        data.dashboard.lifestyle.tailored_clothing_desc = data.dashboard.lifestyle.bespoke_tailoring_desc;
        
        data.dashboard.lifestyle.mental_health = data.dashboard.lifestyle.concierge_therapy;
        data.dashboard.lifestyle.mental_health_desc = data.dashboard.lifestyle.concierge_therapy_desc;
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected correct lifestyle IDs!");
