const fs = require('fs');

const storylines = {
  "storyline_tutorial_0_title": "WELCOME ABOARD 🚀",
  "storyline_tutorial_0_message": "I've backed over a hundred startups. Most failed — not because of bad ideas, but because their founders didn't know which numbers to watch.\n\nI'm here so you don't make those same mistakes. Think of me as your co-pilot.",
  "storyline_tutorial_0_buttonText": "NICE TO MEET YOU, SAM",

  "storyline_tutorial_1_title": "THE COCKPIT 📊",
  "storyline_tutorial_1_message": "This top panel is your cockpit. Watch these every month:\n\n• 💰 Cash & Runway — your lifeline. Zero cash = game over.\n• 🔥 Burnout — if this hits 100, you crash.\n• 📈 PMF Score — how well you fit the market.\n• 👥 Users — your proof of traction.",
  "storyline_tutorial_1_buttonText": "GOT IT",

  "storyline_tutorial_2_title": "YOUR FIRST MONTH ⚡",
  "storyline_tutorial_2_message": "Each month you get Focus Hours — your most valuable resource. Spend them on one action.\n\nTap the ⚡ action button at the bottom to see your options. Product, growth, or team — choose carefully.",
  "storyline_tutorial_2_buttonText": "UNDERSTOOD",

  "storyline_tutorial_3_title": "YOUR NEMESIS: CHADLY 😈",
  "storyline_tutorial_3_message": "See the Rivals tab? Open it now. There's a startup called Chadly — that's your competition.\n\nWatch his users and valuation. When Chad shows up in person, you'll know what you're dealing with.",
  "storyline_tutorial_3_buttonText": "I'LL KEEP AN EYE OUT",

  "storyline_tutorial_4_title": "THE GAME PLAN 🏁",
  "storyline_tutorial_4_message": "You win by outlasting — not by spending the most.\n\nGrow users, hit PMF, raise smart, stay alive. I'll check in every month for the next 6 months.\n\nAnd Chad's going to show up. Don't panic when he does.",
  "storyline_tutorial_4_buttonText": "LET'S BUILD",

  "storyline_sam_expert_welcome_title": "WELCOME BACK 🚀",
  "storyline_sam_expert_welcome_message": "Good to see you again. I know you know the ropes, so I'll skip the tutorial. I'll still be checking in every month to make sure you don't do anything stupid.",
  "storyline_sam_expert_welcome_buttonText": "THANKS, SAM",

  "storyline_sam_month_3_title": "MONTH 3 CHECK-IN: RUNWAY 💰",
  "storyline_sam_month_3_message": "Three months in. First thing I want you to check — your runway number.\n\nIf you have less than 6 months of cash left and you're not profitable yet, that's a five-alarm fire. Don't wait — reduce burn or start fundraising conversations now.\n\nCash is oxygen. Never let it surprise you.",
  "storyline_sam_month_3_buttonText": "CHECKING BURN RATE",

  "storyline_sam_month_4_title": "MONTH 4: HIRING 👥",
  "storyline_sam_month_4_message": "You're probably thinking about hiring. Good instinct — but don't rush it.\n\nHire when a specific bottleneck is costing you users or revenue. Not before. Every salary is a commitment you can't easily unwind.\n\nThe best first hires are people who remove constraints, not people who look good on a pitch deck.",
  "storyline_sam_month_4_buttonText": "NOTED",

  "storyline_sam_month_6_title": "MONTH 6: INVESTOR SIGNALS 🤝",
  "storyline_sam_month_6_message": "If investors are starting to notice you, they'll send signals — intro requests, questions about metrics, casual coffee chats. Don't dismiss these.\n\nBut don't let fundraising distract you from building either. One founder focused entirely on pitching while their PMF score collapsed.\n\nFundraise in parallel, not in place of building.",
  "storyline_sam_month_6_buttonText": "MAKES SENSE",

  "storyline_sam_island_farewell_title": "TIME TO FLY SOLO 🏖️",
  "storyline_sam_island_farewell_message": "Six months in — and look at you. You know your runway, you've seen Chad's move, and you're still standing.\n\nI think you're ready to sail solo.\n\nI earned a place on my private island doing exactly what I've been teaching you. I'm going there now. But if things get serious — tap 'Consult Sam' and I'll swim back.",
  "storyline_sam_island_farewell_buttonText": "THANKS FOR EVERYTHING",

  "storyline_act1_chad_rebuttal_title": "IGNORE THE NOISE 🎧",
  "storyline_act1_chad_rebuttal_message": "Chad loves to talk. That's all it is. Every company I've backed that Chad-types wrote off went on to raise on their own terms. Don't react. Execute.",
  "storyline_act1_chad_rebuttal_buttonText": "STAYING FOCUSED",

  "storyline_fundraise_rebuttal_title": "IGNORE HIS ROUND SIZE 💡",
  "storyline_fundraise_rebuttal_message": "Big raises don't equal big results. More money means more pressure, more dilution, more runway to miss the point. Focus on your unit economics — those will outlast any headline funding number.",
  "storyline_fundraise_rebuttal_buttonText": "UNDERSTOOD",

  "storyline_users_rebuttal_title": "QUALITY > QUANTITY 📊",
  "storyline_users_rebuttal_message": "Chadly has users. You have the right users. Know the difference. One churned-mass user base crashes; one retained power base compounds. Build for retention, not vanity.",
  "storyline_users_rebuttal_buttonText": "CHARTING COURSE",

  "storyline_burnout_support_title": "THE FOUNDER'S TRAP ⚠️",
  "storyline_burnout_support_message": "Chad's playing you. He wants you burned out and distracted. The best thing you can do right now is rest. A clear mind makes better decisions than any hustle.",
  "storyline_burnout_support_buttonText": "TAKING A BREATH",

  "storyline_valuation_milestone_title": "THIS IS REAL 🚀",
  "storyline_valuation_milestone_message": "Look at what you've built. That valuation isn't a number on a slide — it's a reflection of real users, real revenue, and real decisions. Chad can't buy that.",
  "storyline_valuation_milestone_buttonText": "JUST GETTING STARTED",

  "storyline_act3_support_title": "THE FINAL STRETCH 🏁",
  "storyline_act3_support_message": "You and Chadly are the last ones standing. Everything you've built leads to this moment. Stay disciplined, stay focused. The market will crown the right winner.",
  "storyline_act3_support_buttonText": "LET'S FINISH THIS",

  "storyline_victory_title": "YOU DID IT. 🏆",
  "storyline_victory_message": "Chadly's valuation is in your rearview mirror. You proved that sustainable beats flashy every single time. I'm proud of what you built — and so should you be.",
  "storyline_victory_buttonText": "THANKS, SAM 🙏",

  "storyline_act1_intro_title": "OH, YOU LAUNCHED 😏",
  "storyline_act1_intro_choiceALabel": "SAM'S WAY: Stay disciplined",
  "storyline_act1_intro_choiceADescription": "Focus on product quality and retention fundamentals",
  "storyline_act1_intro_choiceBLabel": "CHAD'S WAY: Match the energy",
  "storyline_act1_intro_choiceBDescription": "Go aggressive on growth — higher risk, higher ceiling",

  "storyline_taunt_fundraise_title": "CUTE ROUND 💸",
  "storyline_taunt_fundraise_choiceALabel": "SAM'S WAY: Focus on fundamentals",
  "storyline_taunt_fundraise_choiceADescription": "Strengthen unit economics instead of chasing headlines",
  "storyline_taunt_fundraise_choiceBLabel": "CHAD'S WAY: Double down on growth",
  "storyline_taunt_fundraise_choiceBDescription": "Spend it all on aggressive marketing this month",

  "storyline_taunt_users_title": "YOUR USERS vs MINE 📈",
  "storyline_taunt_users_choiceALabel": "SAM'S WAY: Double down on retention",
  "storyline_taunt_users_choiceADescription": "Build for LTV and stickiness, not vanity numbers",
  "storyline_taunt_users_choiceBLabel": "CHAD'S WAY: Go for volume",
  "storyline_taunt_users_choiceBDescription": "Run a full paid acquisition push to close the gap",

  "storyline_taunt_burnout_title": "BREAKING DOWN? 😈",
  "storyline_taunt_burnout_choiceALabel": "SAM'S WAY: Rest and recover",
  "storyline_taunt_burnout_choiceADescription": "Recharge — a clear mind is your best competitive advantage",
  "storyline_taunt_burnout_choiceBLabel": "CHAD'S WAY: Push through anyway",
  "storyline_taunt_burnout_choiceBDescription": "Ignore the burnout and keep shipping — risky but fast",

  "storyline_taunt_generic_a_title": "STILL HERE? 🙄",
  "storyline_taunt_generic_a_choiceALabel": "SAM'S WAY: Build smarter",
  "storyline_taunt_generic_a_choiceADescription": "Focus on technical debt and architecture for long-term scale",
  "storyline_taunt_generic_a_choiceBLabel": "CHAD'S WAY: Outspend him",
  "storyline_taunt_generic_a_choiceBDescription": "Match Chadly's aggression with a bold marketing push",

  "storyline_taunt_generic_b_title": "CATCHING UP YET? 📊",
  "storyline_taunt_generic_b_choiceALabel": "SAM'S WAY: Stay the course",
  "storyline_taunt_generic_b_choiceADescription": "Trust your unit economics and long-term moat",
  "storyline_taunt_generic_b_choiceBLabel": "CHAD'S WAY: Raise a bigger round",
  "storyline_taunt_generic_b_choiceBDescription": "Pitch investors aggressively to close the valuation gap",

  "storyline_taunt_act3_title": "THE ENDGAME 🏁",
  "storyline_taunt_act3_choiceALabel": "SAM'S WAY: Execute the playbook",
  "storyline_taunt_act3_choiceADescription": "Stay disciplined — great companies aren't built in a sprint",
  "storyline_taunt_act3_choiceBLabel": "CHAD'S WAY: All in",
  "storyline_taunt_act3_choiceBDescription": "Take a massive swing — everything on growth this month",

  "storyline_chad_loses_title": "...FINE. 😤",
  "storyline_chad_loses_message": "You beat Chadly. I don't know how. You weren't supposed to win. I'll be back — Core doesn't die, it pivots. Watch your back.",
  "storyline_chad_loses_buttonText": "SEE YOU AROUND, CHAD"
};

['en', 'es', 'de'].forEach(lang => {
  const filePath = `src/locales/${lang}.json`;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.storyline = { ...(data.storyline || {}), ...storylines };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
