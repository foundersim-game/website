import { GameEvent } from "@/components/EventModal";

// Event pool — 100+ predefined game events for a realistic startup simulation
export const PREDEFINED_EVENTS: GameEvent[] = [

    // ══════════════════════════════════════════
    // EARLY CONFLICT & CULTURE
    // ══════════════════════════════════════════
    {
        event_id: "cofounder_conflict",
        stage: "early_startup",
        title: "events.cofounder_conflict_title",
        description: "events.cofounder_conflict_desc",
        choices: [
            { text: "events.cofounder_conflict_choice_0", effects: { team_morale: -25, risk_appetite: -5 } },
            { text: "events.cofounder_conflict_choice_1", effects: { product_quality: -15, team_morale: 5, intelligence: 5 } },
            { text: "events.cofounder_conflict_choice_2", effects: { cash: -15000, team_morale: -20, employees: -1 } }
        ],
        repeatable: false
    },

    {
        event_id: "server_outage",
        stage: "mvp",
        title: "events.server_outage_title",
        description: "events.server_outage_desc",
        choices: [
            { text: "events.server_outage_choice_0", effects: { brand_awareness: 5, product_quality: -5 } },
            { text: "events.server_outage_choice_1", effects: { cash: -8500, team_morale: -5 } },
            { text: "events.server_outage_choice_2", effects: { brand_awareness: -15, reputation: -15 } }
        ],
        repeatable: true
    },
    {
        event_id: "viral_tweet",
        stage: "mvp",
        title: "events.viral_tweet_title",
        description: "events.viral_tweet_desc",
        choices: [
            { text: "events.viral_tweet_choice_0", effects: { brand_awareness: 15, networking: 5 } },
            { text: "events.viral_tweet_choice_1", effects: { product_quality: 5, brand_awareness: 5 } },
            { text: "events.viral_tweet_choice_2", effects: { networking: 10, brand_awareness: -5 } }
        ]
    },
    {
        event_id: "talent_poaching",
        stage: "early_startup",
        title: "events.talent_poaching_title",
        description: "events.talent_poaching_desc",
        choices: [
            { text: "events.talent_poaching_choice_0", effects: { cash: -12000, burn_rate: 1500, team_morale: 5 } },
            { text: "events.talent_poaching_choice_1", effects: { team_morale: 10, networking: -10 } },
            { text: "events.talent_poaching_choice_2", effects: { employees: -1, team_morale: -25, cash: 5000 } }
        ],
        repeatable: true
    },
    {
        event_id: "legal_threat",
        stage: "growth_stage",
        title: "events.legal_threat_title",
        description: "events.legal_threat_desc",
        choices: [
            { text: "events.legal_threat_choice_0", effects: { cash: -35000, reputation: 10, stress_tolerance: -15 } },
            { text: "events.legal_threat_choice_1", effects: { cash: -75000, risk_appetite: -5 } },
            { text: "events.legal_threat_choice_2", effects: { reputation: -20, stress_tolerance: -10, risk_appetite: 15 } }
        ]
    },

    {
        event_id: "security_breach",
        stage: "early_startup",
        title: "events.security_breach_title",
        description: "events.security_breach_desc",
        choices: [
            { text: "events.security_breach_choice_0", effects: { reputation: 15, brand_awareness: -15, cash: -10000 } },
            { text: "events.security_breach_choice_1", effects: { reputation: -45, product_quality: 10 } },
            { text: "events.security_breach_choice_2", effects: { cash: -35000, reputation: -10 } }
        ]
    },

    // ══════════════════════════════════════════
    // HIRING & TEAM DYNAMICS
    // ══════════════════════════════════════════
    {
        event_id: "team_overworked",
        stage: "early_startup",
        title: "events.team_overworked_title",
        description: "events.team_overworked_desc",
        choices: [
            { text: "events.team_overworked_choice_0", effects: { product_quality: -10, team_morale: 25 } },
            { text: "events.team_overworked_choice_1", effects: { cash: -8000, team_morale: 20 } },
            { text: "events.team_overworked_choice_2", effects: { team_morale: -35, product_quality: 15 } }
        ]
    },
    {
        event_id: "employee_raise_demand",
        stage: "early_startup",
        title: "events.employee_raise_demand_title",
        description: "events.employee_raise_demand_desc",
        choices: [
            { text: "events.employee_raise_demand_choice_0", effects: { cash: -3500, burn_rate: 3500, team_morale: 15 } },
            { text: "events.employee_raise_demand_choice_1", effects: { team_morale: 10, networking: 5, cash: -2000 } },
            { text: "events.employee_raise_demand_choice_2", effects: { employees: -1, team_morale: -30, technical_skill: -15 } }
        ]
    },
    {
        event_id: "toxic_employee",
        stage: "growth_stage",
        title: "events.toxic_employee_title",
        description: "events.toxic_employee_desc",
        choices: [
            { text: "events.toxic_employee_choice_0", effects: { team_morale: 20, cash: -3000, brand_awareness: -5 } },
            { text: "events.toxic_employee_choice_1", effects: { team_morale: 5, risk_appetite: -5 } },
            { text: "events.toxic_employee_choice_2", effects: { team_morale: -25, reputation: -10 } }
        ]
    },
    {
        event_id: "remote_work_debate",
        stage: "mvp",
        title: "events.remote_work_debate_title",
        description: "events.remote_work_debate_desc",
        choices: [
            { text: "events.remote_work_debate_choice_0", effects: { team_morale: 15, cash: 3000, burn_rate: -500 } },
            { text: "events.remote_work_debate_choice_1", effects: { team_morale: 5, product_quality: 5 } },
            { text: "events.remote_work_debate_choice_2", effects: { team_morale: -20, product_quality: 10 } }
        ]
    },
    {
        event_id: "team_offsite",
        stage: "early_startup",
        title: "events.team_offsite_title",
        description: "events.team_offsite_desc",
        choices: [
            { text: "events.team_offsite_choice_0", effects: { cash: -8000, team_morale: 30, networking: 10 } },
            { text: "events.team_offsite_choice_1", effects: { cash: -800, team_morale: 10 } },
            { text: "events.team_offsite_choice_2", effects: { team_morale: -5 } }
        ]
    },
    {
        event_id: "mass_resignation",
        stage: "growth_stage",
        title: "events.mass_resignation_title",
        description: "events.mass_resignation_desc",
        choices: [
            { text: "events.mass_resignation_choice_0", effects: { cash: -15000, team_morale: 15 } },
            { text: "events.mass_resignation_choice_1", effects: { team_morale: 10, product_quality: -10 } },
            { text: "events.mass_resignation_choice_2", effects: { employees: -3, burn_rate: 5000, team_morale: -10 } }
        ]
    },
    {
        event_id: "bad_hire",
        stage: "mvp",
        title: "events.bad_hire_title",
        description: "events.bad_hire_desc",
        choices: [
            { text: "events.bad_hire_choice_0", effects: { team_morale: -5, product_quality: 5 } },
            { text: "events.bad_hire_choice_1", effects: { employees: -1, team_morale: -10, reputation: 10 } },
            { text: "events.bad_hire_choice_2", effects: { risk_appetite: 5, reputation: -10 } }
        ]
    },
    {
        event_id: "culture_recognition",
        stage: "growth_stage",
        title: "events.culture_recognition_title",
        description: "events.culture_recognition_desc",
        choices: [
            { text: "events.culture_recognition_choice_0", effects: { brand_awareness: 20, team_morale: 15, networking: 5 } },
            { text: "events.culture_recognition_choice_1", effects: {} },
            { text: "events.culture_recognition_choice_2", effects: { brand_awareness: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // MARKET & COMPETITIVE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "competitor_price_war",
        stage: "growth_stage",
        title: "events.competitor_price_war_title",
        description: "events.competitor_price_war_desc",
        choices: [
            { text: "events.competitor_price_war_choice_0", effects: { cash: -8000, users: -150, brand_awareness: 5 } },
            { text: "events.competitor_price_war_choice_1", effects: { product_quality: 15, users: -250, brand_awareness: 10 } },
            { text: "events.competitor_price_war_choice_2", effects: { brand_awareness: 5, risk_appetite: 15 } }
        ]
    },
    {
        event_id: "copycat_launch",
        stage: "growth_stage",
        title: "events.copycat_launch_title",
        description: "events.copycat_launch_desc",
        choices: [
            { text: "events.copycat_launch_choice_0", effects: { product_quality: 15, burn_rate: 3500 } },
            { text: "events.copycat_launch_choice_1", effects: { brand_awareness: 15, users: 50 } },
            { text: "events.copycat_launch_choice_2", effects: { reputation: 10, cash: -12000 } }
        ]
    },
    {
        event_id: "industry_award",
        stage: "growth_stage",
        title: "events.industry_award_title",
        description: "events.industry_award_desc",
        choices: [
            { text: "events.industry_award_choice_0", effects: { cash: -3000, reputation: 25, brand_awareness: 15, networking: 10 } },
            { text: "events.industry_award_choice_1", effects: { cash: -1500, reputation: 10, brand_awareness: 5 } },
            { text: "events.industry_award_choice_2", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "economic_downturn",
        stage: "growth_stage",
        title: "events.economic_downturn_title",
        description: "events.economic_downturn_desc",
        choices: [
            { text: "events.economic_downturn_choice_0", effects: { cash: 8000, burn_rate: -2000, team_morale: -10 } },
            { text: "events.economic_downturn_choice_1", effects: { cash: -10000, brand_awareness: 20, risk_appetite: 10 } },
            { text: "events.economic_downturn_choice_2", effects: { product_quality: -5, brand_awareness: 5, users: 50 } }
        ]
    },
    {
        event_id: "platform_policy_change",
        stage: "mvp",
        title: "events.platform_policy_change_title",
        description: "events.platform_policy_change_desc",
        choices: [
            { text: "events.platform_policy_change_choice_0", effects: { product_quality: -15, cash: -5000 } },
            { text: "events.platform_policy_change_choice_1", effects: { risk_appetite: 10, brand_awareness: -5 } },
            { text: "events.platform_policy_change_choice_2", effects: { cash: -8000, users: 50 } }
        ]
    },
    {
        event_id: "api_shutdown",
        stage: "mvp",
        title: "events.api_shutdown_title",
        description: "events.api_shutdown_desc",
        choices: [
            { text: "events.api_shutdown_choice_0", effects: { cash: -15000, technical_debt: -10, product_quality: 10 } },
            { text: "events.api_shutdown_choice_1", effects: { cash: -3000, product_quality: -5 } },
            { text: "events.api_shutdown_choice_2", effects: { cash: -5000, reputation: 10 } }
        ]
    },
    {
        event_id: "cloud_bill_spike",
        stage: "growth_stage",
        title: "events.cloud_bill_spike_title",
        description: "events.cloud_bill_spike_desc",
        choices: [
            { text: "events.cloud_bill_spike_choice_0", effects: { technical_debt: 15, burn_rate: -2000 } },
            { text: "events.cloud_bill_spike_choice_1", effects: { cash: -5000, burn_rate: -3000 } },
            { text: "events.cloud_bill_spike_choice_2", effects: { burn_rate: 6000, cash: -10000 } }
        ],
        repeatable: true
    },
    {
        event_id: "competitor_funding",
        stage: "growth_stage",
        title: "events.competitor_funding_title",
        description: "events.competitor_funding_desc",
        choices: [
            { text: "events.competitor_funding_choice_0", effects: { networking: 15, risk_appetite: 10 } },
            { text: "events.competitor_funding_choice_1", effects: { product_quality: 10, brand_awareness: -5 } },
            { text: "events.competitor_funding_choice_2", effects: { team_morale: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // FUNDING & INVESTOR EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "investor_ghosting",
        stage: "early_startup",
        title: "events.investor_ghosting_title",
        description: "events.investor_ghosting_desc",
        choices: [
            { text: "events.investor_ghosting_choice_0", effects: { stress_tolerance: -5, networking: -5 } },
            { text: "events.investor_ghosting_choice_1", effects: { networking: 10, stress_tolerance: -5 } },
            { text: "events.investor_ghosting_choice_2", effects: { reputation: -10, stress_tolerance: 5 } }
        ]
    },
    {
        event_id: "angel_investment_offer",
        stage: "early_startup",
        title: "events.angel_investment_offer_title",
        description: "events.angel_investment_offer_desc",
        choices: [
            { text: "events.angel_investment_offer_choice_0", effects: { cash: 50000, networking: 20 } },
            { text: "events.angel_investment_offer_choice_1", effects: { networking: 5, cash: 50000 } },
            { text: "events.angel_investment_offer_choice_2", effects: { risk_appetite: 5 } }
        ]
    },
    {
        event_id: "investor_update_missed",
        stage: "growth_stage",
        title: "events.investor_update_missed_title",
        description: "events.investor_update_missed_desc",
        choices: [
            { text: "events.investor_update_missed_choice_0", effects: { reputation: 10, networking: 5 } },
            { text: "events.investor_update_missed_choice_1", effects: { networking: 15, stress_tolerance: -5 } },
            { text: "events.investor_update_missed_choice_2", effects: { reputation: -15, networking: -10 } }
        ]
    },
    {
        event_id: "down_round_pressure",
        stage: "growth_stage",
        title: "events.down_round_pressure_title",
        description: "events.down_round_pressure_desc",
        choices: [
            { text: "events.down_round_pressure_choice_0", effects: { cash: 200000, reputation: -20, risk_appetite: -10 } },
            { text: "events.down_round_pressure_choice_1", effects: { burn_rate: -5000, team_morale: -25, employees: -2 } },
            { text: "events.down_round_pressure_choice_2", effects: { networking: 20, risk_appetite: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // PRODUCT & TECHNICAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "product_hunt_launch",
        stage: "mvp",
        title: "events.product_hunt_launch_title",
        description: "events.product_hunt_launch_desc",
        choices: [
            { text: "events.product_hunt_launch_choice_0", effects: { brand_awareness: 25, users: 200, team_morale: -5 } },
            { text: "events.product_hunt_launch_choice_1", effects: { brand_awareness: 10, users: 80 } },
            { text: "events.product_hunt_launch_choice_2", effects: { product_quality: 5, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "critical_bug_in_prod",
        stage: "mvp",
        title: "events.critical_bug_in_prod_title",
        description: "events.critical_bug_in_prod_desc",
        choices: [
            { text: "events.critical_bug_in_prod_choice_0", effects: { cash: -12000, reputation: 15, brand_awareness: -5 } },
            { text: "events.critical_bug_in_prod_choice_1", effects: { reputation: -20, product_quality: 10 } },
            { text: "events.critical_bug_in_prod_choice_2", effects: { cash: -5000, reputation: 10 } }
        ],
        repeatable: true
    },
    {
        event_id: "tech_debt_crisis",
        stage: "growth_stage",
        title: "events.tech_debt_crisis_title",
        description: "events.tech_debt_crisis_desc",
        choices: [
            { text: "events.tech_debt_crisis_choice_0", effects: { technical_debt: -40, product_quality: 15, burn_rate: 3000 } },
            { text: "events.tech_debt_crisis_choice_1", effects: { technical_debt: -15, product_quality: 5 } },
            { text: "events.tech_debt_crisis_choice_2", effects: { technical_debt: 20, product_quality: -10 } }
        ]
    },
    {
        event_id: "ai_feature_opportunity",
        stage: "mvp",
        title: "events.ai_feature_opportunity_title",
        description: "events.ai_feature_opportunity_desc",
        choices: [
            { text: "events.ai_feature_opportunity_choice_0", effects: { cash: -15000, innovation: 20, brand_awareness: 15 } },
            { text: "events.ai_feature_opportunity_choice_1", effects: { product_quality: 20, innovation: 15 } },
            { text: "events.ai_feature_opportunity_choice_2", effects: { brand_awareness: -10 } }
        ]
    },
    {
        event_id: "uptime_achievement",
        stage: "growth_stage",
        title: "events.uptime_achievement_title",
        description: "events.uptime_achievement_desc",
        choices: [
            { text: "events.uptime_achievement_choice_0", effects: { brand_awareness: 15, reputation: 20, networking: 10 } },
            { text: "events.uptime_achievement_choice_1", effects: { brand_awareness: 20 } },
            { text: "events.uptime_achievement_choice_2", effects: { reputation: 15, networking: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // FINANCIAL & LEGAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "tax_audit",
        stage: "growth_stage",
        title: "events.tax_audit_title",
        description: "events.tax_audit_desc",
        choices: [
            { text: "events.tax_audit_choice_0", effects: { cash: -15000, reputation: 5 } },
            { text: "events.tax_audit_choice_1", effects: { cash: -8000, stress_tolerance: -5 } },
            { text: "events.tax_audit_choice_2", effects: { cash: -2000, risk_appetite: 10, stress_tolerance: -10 } }
        ]
    },
    {
        event_id: "gdpr_violation",
        stage: "growth_stage",
        title: "events.gdpr_violation_title",
        description: "events.gdpr_violation_desc",
        choices: [
            { text: "events.gdpr_violation_choice_0", effects: { cash: -10000, reputation: 15 } },
            { text: "events.gdpr_violation_choice_1", effects: { users: -200, reputation: 10 } },
            { text: "events.gdpr_violation_choice_2", effects: { risk_appetite: 5, reputation: -15 } }
        ]
    },
    {
        event_id: "contract_dispute",
        stage: "growth_stage",
        title: "events.contract_dispute_title",
        description: "events.contract_dispute_desc",
        choices: [
            { text: "events.contract_dispute_choice_0", effects: { reputation: 5, cash: -5000 } },
            { text: "events.contract_dispute_choice_1", effects: { cash: -8000, reputation: -5, networking: -5 } },
            { text: "events.contract_dispute_choice_2", effects: { cash: -24000, team_morale: -10, reputation: 15 } }
        ]
    },
    {
        event_id: "ip_registration",
        stage: "mvp",
        title: "events.ip_registration_title",
        description: "events.ip_registration_desc",
        choices: [
            { text: "events.ip_registration_choice_0", effects: { cash: -8000, reputation: 10 } },
            { text: "events.ip_registration_choice_1", effects: { cash: -25000, reputation: 20, networking: 5 } },
            { text: "events.ip_registration_choice_2", effects: { risk_appetite: 5 } }
        ]
    },
    {
        event_id: "regulatory_license",
        stage: "growth_stage",
        title: "events.regulatory_license_title",
        description: "events.regulatory_license_desc",
        choices: [
            { text: "events.regulatory_license_choice_0", effects: { cash: -20000, reputation: 15 } },
            { text: "events.regulatory_license_choice_1", effects: { risk_appetite: 10, reputation: -20 } },
            { text: "events.regulatory_license_choice_2", effects: { cash: -5000, networking: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // FOUNDER PERSONAL LIFE
    // ══════════════════════════════════════════
    {
        event_id: "relationship_strain",
        stage: "early_startup",
        title: "events.relationship_strain_title",
        description: "events.relationship_strain_desc",
        choices: [
            { text: "events.relationship_strain_choice_0", effects: { stress_tolerance: 15, team_morale: 5 } },
            { text: "events.relationship_strain_choice_1", effects: { stress_tolerance: -5 } },
            { text: "events.relationship_strain_choice_2", effects: { stress_tolerance: 10, networking: 5 } }
        ]
    },
    {
        event_id: "health_scare",
        stage: "early_startup",
        title: "events.health_scare_title",
        description: "events.health_scare_desc",
        choices: [
            { text: "events.health_scare_choice_0", effects: { founder_health: 20, stress_tolerance: 15, team_morale: -5 } },
            { text: "events.health_scare_choice_1", effects: { founder_health: 10, team_morale: 5, leadership: 5 } },
            { text: "events.health_scare_choice_2", effects: { founder_health: -20, risk_appetite: 5 } }
        ]
    },
    {
        event_id: "family_obligation",
        stage: "mvp",
        title: "events.family_obligation_title",
        description: "events.family_obligation_desc",
        choices: [
            { text: "events.family_obligation_choice_0", effects: { founder_health: 15, leadership: 10, product_quality: -5 } },
            { text: "events.family_obligation_choice_1", effects: { stress_tolerance: -10, founder_health: 5 } },
            { text: "events.family_obligation_choice_2", effects: { stress_tolerance: -20, reputation: -5 } }
        ]
    },
    {
        event_id: "gym_habit",
        stage: "mvp",
        title: "events.gym_habit_title",
        description: "events.gym_habit_desc",
        choices: [
            { text: "events.gym_habit_choice_0", effects: { founder_health: 25, stress_tolerance: 15 } },
            { text: "events.gym_habit_choice_1", effects: { founder_health: 10, stress_tolerance: 5 } },
            { text: "events.gym_habit_choice_2", effects: { founder_health: -5 } }
        ]
    },
    {
        event_id: "therapy_session",
        stage: "early_startup",
        title: "events.therapy_session_title",
        description: "events.therapy_session_desc",
        choices: [
            { text: "events.therapy_session_choice_0", effects: { stress_tolerance: 20, founder_health: 10, team_morale: 5 } },
            { text: "events.therapy_session_choice_1", effects: { stress_tolerance: 10 } },
            { text: "events.therapy_session_choice_2", effects: { stress_tolerance: -10, founder_health: -5 } }
        ]
    },
    {
        event_id: "mentor_dinner",
        stage: "early_startup",
        title: "events.mentor_dinner_title",
        description: "events.mentor_dinner_desc",
        choices: [
            { text: "events.mentor_dinner_choice_0", effects: { networking: 20, intelligence: 5, stress_tolerance: 5 } },
            { text: "events.mentor_dinner_choice_1", effects: { networking: 10 } },
            { text: "events.mentor_dinner_choice_2", effects: { networking: -5 } }
        ]
    },
    {
        event_id: "imposter_syndrome",
        stage: "early_startup",
        title: "events.imposter_syndrome_title",
        description: "events.imposter_syndrome_desc",
        choices: [
            { text: "events.imposter_syndrome_choice_0", effects: { networking: 15, reputation: 10, stress_tolerance: 5 } },
            { text: "events.imposter_syndrome_choice_1", effects: { stress_tolerance: -10, networking: 5 } },
            { text: "events.imposter_syndrome_choice_2", effects: { stress_tolerance: 5, networking: -10 } }
        ]
    },
    {
        event_id: "social_isolation",
        stage: "mvp",
        title: "events.social_isolation_title",
        description: "events.social_isolation_desc",
        choices: [
            { text: "events.social_isolation_choice_0", effects: { stress_tolerance: 15, founder_health: 10 } },
            { text: "events.social_isolation_choice_1", effects: { networking: 15, stress_tolerance: 10 } },
            { text: "events.social_isolation_choice_2", effects: { stress_tolerance: -15, founder_health: -5 } }
        ]
    },

    // ══════════════════════════════════════════
    // GROWTH & MEDIA
    // ══════════════════════════════════════════
    {
        event_id: "press_feature",
        stage: "growth_stage",
        title: "events.press_feature_title",
        description: "events.press_feature_desc",
        choices: [
            { text: "events.press_feature_choice_0", effects: { brand_awareness: 30, reputation: 15, networking: 10 } },
            { text: "events.press_feature_choice_1", effects: { brand_awareness: -5 } },
            { text: "events.press_feature_choice_2", effects: { brand_awareness: 15, reputation: -5 } }
        ]
    },
    {
        event_id: "key_customer_churn",
        stage: "growth_stage",
        title: "events.key_customer_churn_title",
        description: "events.key_customer_churn_desc",
        choices: [
            { text: "events.key_customer_churn_choice_0", effects: { intelligence: 10, product_quality: 5 } },
            { text: "events.key_customer_churn_choice_1", effects: { cash: -5000, users: 50 } },
            { text: "events.key_customer_churn_choice_2", effects: { product_quality: 10, brand_awareness: -5 } }
        ]
    },
    {
        event_id: "conference_speaking",
        stage: "growth_stage",
        title: "events.conference_speaking_title",
        description: "events.conference_speaking_desc",
        choices: [
            { text: "events.conference_speaking_choice_0", effects: { brand_awareness: 25, reputation: 20, networking: 15, cash: -2000 } },
            { text: "events.conference_speaking_choice_1", effects: { brand_awareness: 10, networking: 5 } },
            { text: "events.conference_speaking_choice_2", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "media_scandal",
        stage: "growth_stage",
        title: "events.media_scandal_title",
        description: "events.media_scandal_desc",
        choices: [
            { text: "events.media_scandal_choice_0", effects: { reputation: 5, brand_awareness: -10, team_morale: -5 } },
            { text: "events.media_scandal_choice_1", effects: { team_morale: 10, reputation: -5 } },
            { text: "events.media_scandal_choice_2", effects: { reputation: -20, team_morale: -10 } }
        ]
    },
    {
        event_id: "viral_product_review",
        stage: "mvp",
        title: "events.viral_product_review_title",
        description: "events.viral_product_review_desc",
        choices: [
            { text: "events.viral_product_review_choice_0", effects: { brand_awareness: 20, networking: 15, users: 300 } },
            { text: "events.viral_product_review_choice_1", effects: { brand_awareness: 25, users: 200 } },
            { text: "events.viral_product_review_choice_2", effects: { product_quality: 10, users: 150 } }
        ]
    },

    // ══════════════════════════════════════════
    // STRATEGIC PIVOTS & OPPORTUNITIES
    // ══════════════════════════════════════════
    {
        event_id: "enterprise_inbound",
        stage: "growth_stage",
        title: "events.enterprise_inbound_title",
        description: "events.enterprise_inbound_desc",
        choices: [
            { text: "events.enterprise_inbound_choice_0", effects: { cash: -15000, reputation: 20, brand_awareness: 10 } },
            { text: "events.enterprise_inbound_choice_1", effects: { networking: 10, risk_appetite: 10 } },
            { text: "events.enterprise_inbound_choice_2", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "pivot_pressure",
        stage: "mvp",
        title: "events.pivot_pressure_title",
        description: "events.pivot_pressure_desc",
        choices: [
            { text: "events.pivot_pressure_choice_0", effects: { product_quality: -15, brand_awareness: 10, networking: 10 } },
            { text: "events.pivot_pressure_choice_1", effects: { reputation: 15 } },
            { text: "events.pivot_pressure_choice_2", effects: { burn_rate: 2000, intelligence: 10 } }
        ]
    },
    {
        event_id: "partnership_opportunity",
        stage: "growth_stage",
        title: "events.partnership_opportunity_title",
        description: "events.partnership_opportunity_desc",
        choices: [
            { text: "events.partnership_opportunity_choice_0", effects: { users: 500, brand_awareness: 20, networking: 15 } },
            { text: "events.partnership_opportunity_choice_1", effects: { users: 300, brand_awareness: 15 } },
            { text: "events.partnership_opportunity_choice_2", effects: { networking: -5, risk_appetite: 5 } }
        ]
    },
    {
        event_id: "international_expansion",
        stage: "growth_stage",
        title: "events.international_expansion_title",
        description: "events.international_expansion_desc",
        choices: [
            { text: "events.international_expansion_choice_0", effects: { cash: -8000, burn_rate: 8000, users: 500, brand_awareness: 15 } },
            { text: "events.international_expansion_choice_1", effects: { users: 200, networking: 10 } },
            { text: "events.international_expansion_choice_2", effects: {} }
        ]
    },


    // ══════════════════════════════════════════
    // POSITIVE & MILESTONE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "nps_milestone",
        stage: "mvp",
        title: "events.nps_milestone_title",
        description: "events.nps_milestone_desc",
        choices: [
            { text: "events.nps_milestone_choice_0", effects: { brand_awareness: 15, users: 100 } },
            { text: "events.nps_milestone_choice_1", effects: { networking: 15, reputation: 10 } },
            { text: "events.nps_milestone_choice_2", effects: { product_quality: 15 } }
        ]
    },
    {
        event_id: "mrr_milestone",
        stage: "growth_stage",
        title: "events.mrr_milestone_title",
        description: "events.mrr_milestone_desc",
        choices: [
            { text: "events.mrr_milestone_choice_0", effects: { brand_awareness: 25, reputation: 15, networking: 10 } },
            { text: "events.mrr_milestone_choice_1", effects: { team_morale: 20, cash: -500 } },
            { text: "events.mrr_milestone_choice_2", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "first_enterprise_close",
        stage: "growth_stage",
        title: "events.first_enterprise_close_title",
        description: "events.first_enterprise_close_desc",
        choices: [
            { text: "events.first_enterprise_close_choice_0", effects: { team_morale: 25, brand_awareness: 15 } },
            { text: "events.first_enterprise_close_choice_1", effects: { networking: 15, burn_rate: 2000 } },
            { text: "events.first_enterprise_close_choice_2", effects: { brand_awareness: 10, networking: 20 } }
        ]
    },
    {
        event_id: "feature_idea_from_user",
        stage: "mvp",
        title: "events.feature_idea_from_user_title",
        description: "events.feature_idea_from_user_desc",
        choices: [
            { text: "events.feature_idea_from_user_choice_0", effects: { product_quality: 15, users: 100, team_morale: 5 } },
            { text: "events.feature_idea_from_user_choice_1", effects: { brand_awareness: 10, product_quality: 5 } },
            { text: "events.feature_idea_from_user_choice_2", effects: { intelligence: 5, cash: 2000 } }
        ]
    },
    {
        event_id: "superuser_emerged",
        stage: "mvp",
        title: "events.superuser_emerged_title",
        description: "events.superuser_emerged_desc",
        choices: [
            { text: "events.superuser_emerged_choice_0", effects: { cash: -2000, burn_rate: 2000, users: 200, team_morale: 10 } },
            { text: "events.superuser_emerged_choice_1", effects: { brand_awareness: 20, networking: 15 } },
            { text: "events.superuser_emerged_choice_2", effects: { users: 100 } }
        ]
    },

    // ══════════════════════════════════════════
    // ADDITIONAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "office_lease_crisis",
        stage: "growth_stage",
        title: "events.office_lease_crisis_title",
        description: "events.office_lease_crisis_desc",
        choices: [
            { text: "events.office_lease_crisis_choice_0", effects: { cash: 5000, burn_rate: -5000, team_morale: 5 } },
            { text: "events.office_lease_crisis_choice_1", effects: { cash: -2000, team_morale: 5 } },
            { text: "events.office_lease_crisis_choice_2", effects: { cash: -3000, burn_rate: -2000, team_morale: -5 } }
        ]
    },
    {
        event_id: "board_pressure",
        stage: "growth_stage",
        title: "events.board_pressure_title",
        description: "events.board_pressure_desc",
        choices: [
            { text: "events.board_pressure_choice_0", effects: { reputation: 15, stress_tolerance: -10 } },
            { text: "events.board_pressure_choice_1", effects: { networking: 10, team_morale: 5, burn_rate: 10000 } },
            { text: "events.board_pressure_choice_2", effects: { reputation: -10, risk_appetite: 10, stress_tolerance: -15 } }
        ]
    },
    {
        event_id: "data_privacy_law",
        stage: "growth_stage",
        title: "events.data_privacy_law_title",
        description: "events.data_privacy_law_desc",
        choices: [
            { text: "events.data_privacy_law_choice_0", effects: { reputation: 15, cash: -5000 } },
            { text: "events.data_privacy_law_choice_1", effects: { reputation: -5 } },
            { text: "events.data_privacy_law_choice_2", effects: { risk_appetite: 5, reputation: -15 } }
        ]
    },
    {
        event_id: "founder_opportunity_conference",
        stage: "mvp",
        title: "events.founder_opportunity_conference_title",
        description: "events.founder_opportunity_conference_desc",
        choices: [
            { text: "events.founder_opportunity_conference_choice_0", effects: { networking: 30, cash: -3000, stress_tolerance: -5 } },
            { text: "events.founder_opportunity_conference_choice_1", effects: { networking: 20, reputation: 10, cash: -3000 } },
            { text: "events.founder_opportunity_conference_choice_2", effects: { networking: -10 } }
        ]
    },

    // ══════════════════════════════════════════
    // PERSONAL LIFE & FOUNDER PSYCHOLOGY
    // ══════════════════════════════════════════
    {
        event_id: "relationship_strain",
        stage: "early_startup",
        title: "events.relationship_strain_title",
        description: "events.relationship_strain_desc",
        choices: [
            { text: "events.relationship_strain_choice_0", effects: { founder_burnout: -20, team_morale: -5, founder_health: 15 } },
            { text: "events.relationship_strain_choice_1", effects: { cash: -15000, burn_rate: 5000, founder_burnout: -10 } },
            { text: "events.relationship_strain_choice_2", effects: { founder_burnout: 15, founder_health: -10, intelligence: -5 } }
        ]
    },
    {
        event_id: "founder_health_scare",
        stage: "mvp",
        title: "events.founder_health_scare_title",
        description: "events.founder_health_scare_desc",
        choices: [
            { text: "events.founder_health_scare_choice_0", effects: { founder_health: 40, founder_burnout: -40, product_quality: -5, team_morale: -10 } },
            { text: "events.founder_health_scare_choice_1", effects: { founder_health: 20, founder_burnout: -15 } },
            { text: "events.founder_health_scare_choice_2", effects: { founder_health: -10, founder_burnout: 20, reputation: -5 } }
        ]
    },
    {
        event_id: "family_emergency",
        stage: "mvp",
        title: "events.family_emergency_title",
        description: "events.family_emergency_desc",
        choices: [
            { text: "events.family_emergency_choice_0", effects: { founder_health: 10, founder_burnout: -10, reputation: -5 } },
            { text: "events.family_emergency_choice_1", effects: { leadership: 5, team_morale: 5, founder_burnout: 5 } },
            { text: "events.family_emergency_choice_2", effects: { founder_burnout: 15, founder_health: -5, technical_skill: -3 } }
        ]
    },
    {
        event_id: "founder_therapy",
        stage: "early_startup",
        title: "events.founder_therapy_title",
        description: "events.founder_therapy_desc",
        choices: [
            { text: "events.founder_therapy_choice_0", effects: { cash: -600, founder_burnout: -8, intelligence: 5, leadership: 5 } },
            { text: "events.founder_therapy_choice_1", effects: { cash: -200, networking: 10, founder_burnout: -4 } },
            { text: "events.founder_therapy_choice_2", effects: { founder_burnout: 5 } }
        ]
    },
    {
        event_id: "sleep_deprivation",
        stage: "early_startup",
        title: "events.sleep_deprivation_title",
        description: "events.sleep_deprivation_desc",
        choices: [
            { text: "events.sleep_deprivation_choice_0", effects: { founder_health: 20, founder_burnout: -15, product_quality: 5, intelligence: 5 } },
            { text: "events.sleep_deprivation_choice_1", effects: { founder_burnout: 20, founder_health: -15, product_quality: -8, team_morale: -5 } },
            { text: "events.sleep_deprivation_choice_2", effects: { cash: -10000, burn_rate: 4000, founder_burnout: -10 } }
        ]
    },
    {
        event_id: "imposter_syndrome",
        stage: "early_startup",
        title: "events.imposter_syndrome_title",
        description: "events.imposter_syndrome_desc",
        choices: [
            { text: "events.imposter_syndrome_choice_0", effects: { networking: 10, reputation: 5, intelligence: 5 } },
            { text: "events.imposter_syndrome_choice_1", effects: { technical_skill: 5, intelligence: -3, founder_burnout: 5 } },
            { text: "events.imposter_syndrome_choice_2", effects: { networking: -10, founder_burnout: -5 } }
        ]
    },

    // ══════════════════════════════════════════
    // B2B SALES PIPELINE & ENTERPRISE
    // ══════════════════════════════════════════
    {
        event_id: "enterprise_rfp",
        stage: "growth_stage",
        title: "events.enterprise_rfp_title",
        description: "events.enterprise_rfp_desc",
        choices: [
            { text: "events.enterprise_rfp_choice_0", effects: { cash: 20000, product_quality: -5, technical_debt: 15, burn_rate: 3000 } },
            { text: "events.enterprise_rfp_choice_1", effects: { reputation: 10, networking: 5, cash: 5000 } },
            { text: "events.enterprise_rfp_choice_2", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "enterprise_pilot_success",
        stage: "growth_stage",
        title: "events.enterprise_pilot_success_title",
        description: "events.enterprise_pilot_success_desc",
        choices: [
            { text: "events.enterprise_pilot_success_choice_0", effects: { cash: 25000, reputation: 10, networking: 5 } },
            { text: "events.enterprise_pilot_success_choice_1", effects: { cash: 200000, brand_awareness: 10 } },
            { text: "events.enterprise_pilot_success_choice_2", effects: { networking: 20, cash: 15000, reputation: 5 } }
        ]
    },
    {
        event_id: "enterprise_churn",
        stage: "growth_stage",
        title: "events.enterprise_churn_title",
        description: "events.enterprise_churn_desc",
        choices: [
            { text: "events.enterprise_churn_choice_0", effects: { product_quality: 10, technical_debt: 20, burn_rate: 5000, team_morale: -10 } },
            { text: "events.enterprise_churn_choice_1", effects: { cash: -5000, reputation: 5 } },
            { text: "events.enterprise_churn_choice_2", effects: { team_morale: -15, brand_awareness: -5, product_quality: 5 } }
        ]
    },
    {
        event_id: "sales_team_miss",
        stage: "growth_stage",
        title: "events.sales_team_miss_title",
        description: "events.sales_team_miss_desc",
        choices: [
            { text: "events.sales_team_miss_choice_0", effects: { team_morale: 5, product_quality: 5, intelligence: 5 } },
            { text: "events.sales_team_miss_choice_1", effects: { team_morale: -20, cash: 5000, reputation: -5 } },
            { text: "events.sales_team_miss_choice_2", effects: { cash: -5000, team_morale: 10, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "channel_partnership",
        stage: "growth_stage",
        title: "events.channel_partnership_title",
        description: "events.channel_partnership_desc",
        choices: [
            { text: "events.channel_partnership_choice_0", effects: { users: 500, brand_awareness: 20, cash: 10000, networking: 10 } },
            { text: "events.channel_partnership_choice_1", effects: { users: 200, cash: 15000, networking: 5, reputation: 5 } },
            { text: "events.channel_partnership_choice_2", effects: { product_quality: 3 } }
        ]
    },

    // ══════════════════════════════════════════
    // BOARD PRESSURE & INVESTOR RELATIONS
    // ══════════════════════════════════════════
    {
        event_id: "board_ceo_pressure",
        stage: "growth_stage",
        title: "events.board_ceo_pressure_title",
        description: "events.board_ceo_pressure_desc",
        choices: [
            { text: "events.board_ceo_pressure_choice_0", effects: { leadership: -5, reputation: 5, networking: -10 } },
            { text: "events.board_ceo_pressure_choice_1", effects: { cash: -20000, burn_rate: 8000, leadership: 10, reputation: 5 } },
            { text: "events.board_ceo_pressure_choice_2", effects: { networking: 10, team_morale: -10, reputation: 5 } }
        ]
    },
    {
        event_id: "board_expansion",
        stage: "growth_stage",
        title: "events.board_expansion_title",
        description: "events.board_expansion_desc",
        choices: [
            { text: "events.board_expansion_choice_0", effects: { cash: 50000, networking: 10, leadership: -5 } },
            { text: "events.board_expansion_choice_1", effects: { reputation: 10, networking: 5, cash: 20000 } },
            { text: "events.board_expansion_choice_2", effects: { cash: -20000, reputation: 5, networking: -10 } }
        ]
    },
    {
        event_id: "investor_update_ghosted",
        stage: "mvp",
        title: "events.investor_update_ghosted_title",
        description: "events.investor_update_ghosted_desc",
        choices: [
            { text: "events.investor_update_ghosted_choice_0", effects: { networking: 5, intelligence: 5 } },
            { text: "events.investor_update_ghosted_choice_1", effects: { networking: -5, reputation: 3 } },
            { text: "events.investor_update_ghosted_choice_2", effects: { networking: 15, reputation: -5, risk_appetite: 10 } }
        ]
    },
    {
        event_id: "down_round_pressure",
        stage: "growth_stage",
        title: "events.down_round_pressure_title",
        description: "events.down_round_pressure_desc",
        choices: [
            { text: "events.down_round_pressure_choice_0", effects: { cash: 200000, reputation: -15, networking: 5 } },
            { text: "events.down_round_pressure_choice_1", effects: { cash: 100000, reputation: -5, networking: 5 } },
            { text: "events.down_round_pressure_choice_2", effects: { cash: 30000, team_morale: -25, burn_rate: -5000 } }
        ]
    },

    // ══════════════════════════════════════════
    // LEGAL & COMPLIANCE
    // ══════════════════════════════════════════
    {
        event_id: "gdpr_audit",
        stage: "growth_stage",
        title: "events.gdpr_audit_title",
        description: "events.gdpr_audit_desc",
        choices: [
            { text: "events.gdpr_audit_choice_0", effects: { cash: -25000, reputation: 10, brand_awareness: 5 } },
            { text: "events.gdpr_audit_choice_1", effects: { cash: -10000, reputation: 0, risk_appetite: -5 } },
            { text: "events.gdpr_audit_choice_2", effects: { reputation: -15, risk_appetite: 10, cash: 5000 } }
        ]
    },
    {
        event_id: "ip_lawsuit",
        stage: "growth_stage",
        title: "events.ip_lawsuit_title",
        description: "events.ip_lawsuit_desc",
        choices: [
            { text: "events.ip_lawsuit_choice_0", effects: { cash: -30000, reputation: 5, risk_appetite: 10 } },
            { text: "events.ip_lawsuit_choice_1", effects: { cash: -50000, burn_rate: 4167, reputation: -5 } },
            { text: "events.ip_lawsuit_choice_2", effects: { technical_debt: 15, product_quality: -5, cash: -10000 } }
        ]
    },
    {
        event_id: "data_breach",
        stage: "mvp",
        title: "events.data_breach_title",
        description: "events.data_breach_desc",
        choices: [
            { text: "events.data_breach_choice_0", effects: { reputation: 10, brand_awareness: -5, technical_debt: -10, product_quality: 5 } },
            { text: "events.data_breach_choice_1", effects: { reputation: -10, technical_debt: -10 } },
            { text: "events.data_breach_choice_2", effects: { reputation: -20, brand_awareness: -10, team_morale: -5 } }
        ]
    },
    {
        event_id: "employment_lawyer",
        stage: "mvp",
        title: "events.employment_lawyer_title",
        description: "events.employment_lawyer_desc",
        choices: [
            { text: "events.employment_lawyer_choice_0", effects: { cash: -15000, reputation: 5, team_morale: 5 } },
            { text: "events.employment_lawyer_choice_1", effects: { cash: -25000, reputation: -5, team_morale: -10 } },
            { text: "events.employment_lawyer_choice_2", effects: { cash: -10000, brand_awareness: 5, culture_score: 10 } }
        ]
    },
    {
        event_id: "soc2_requirement",
        stage: "growth_stage",
        title: "events.soc2_requirement_title",
        description: "events.soc2_requirement_desc",
        choices: [
            { text: "events.soc2_requirement_choice_0", effects: { cash: -30000, reputation: 15, technical_debt: -10, brand_awareness: 10 } },
            { text: "events.soc2_requirement_choice_1", effects: { cash: -15000, reputation: 8, brand_awareness: 5 } },
            { text: "events.soc2_requirement_choice_2", effects: { product_quality: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // CXO DEPARTURES & TEAM DISRUPTION
    // ══════════════════════════════════════════
    {
        event_id: "cto_departure",
        stage: "growth_stage",
        title: "events.cto_departure_title",
        description: "events.cto_departure_desc",
        choices: [
            { text: "events.cto_departure_choice_0", effects: { cash: -30000, burn_rate: 5000, technical_debt: -5 } },
            { text: "events.cto_departure_choice_1", effects: { technical_debt: 25, product_quality: -15, team_morale: -10, cash: -10000 } },
            { text: "events.cto_departure_choice_2", effects: { technical_debt: 10, product_quality: -5, cash: -5000 } }
        ]
    },
    {
        event_id: "cmo_failure",
        stage: "growth_stage",
        title: "events.cmo_failure_title",
        description: "events.cmo_failure_desc",
        choices: [
            { text: "events.cmo_failure_choice_0", effects: { cash: -20000, burn_rate: -3000, team_morale: -5, brand_awareness: 5 } },
            { text: "events.cmo_failure_choice_1", effects: { team_morale: -5, brand_awareness: 5 } },
            { text: "events.cmo_failure_choice_2", effects: { cash: -5000, burn_rate: -2000, brand_awareness: 10 } }
        ]
    },
    {
        event_id: "cofounder_burnout_leave",
        stage: "mvp",
        title: "events.cofounder_burnout_leave_title",
        description: "events.cofounder_burnout_leave_desc",
        choices: [
            { text: "events.cofounder_burnout_leave_choice_0", effects: { team_morale: 10, technical_debt: 15, product_quality: -10, founder_burnout: 10 } },
            { text: "events.cofounder_burnout_leave_choice_1", effects: { team_morale: -5, founder_burnout: 15, product_quality: -3 } },
            { text: "events.cofounder_burnout_leave_choice_2", effects: { cash: -15000, technical_debt: 5, product_quality: -3 } }
        ]
    },

    // ══════════════════════════════════════════
    // MARKET & COMPETITIVE THREATS
    // ══════════════════════════════════════════
    {
        event_id: "well_funded_competitor",
        stage: "growth_stage",
        title: "events.well_funded_competitor_title",
        description: "events.well_funded_competitor_desc",
        choices: [
            { text: "events.well_funded_competitor_choice_0", effects: { product_quality: 5, team_morale: 5 } },
            { text: "events.well_funded_competitor_choice_1", effects: { cash: 50000, networking: 10, founder_burnout: 10 } },
            { text: "events.well_funded_competitor_choice_2", effects: { product_quality: 10, brand_awareness: 5, users: -30 } }
        ]
    },
    {
        event_id: "product_copycat",
        stage: "mvp",
        title: "events.product_copycat_title",
        description: "events.product_copycat_desc",
        choices: [
            { text: "events.product_copycat_choice_0", effects: { cash: -5000, users: 100, brand_awareness: 5, revenue: -500 } },
            { text: "events.product_copycat_choice_1", effects: { product_quality: 10, brand_awareness: 10, technical_debt: 5 } },
            { text: "events.product_copycat_choice_2", effects: { brand_awareness: 15, reputation: -5, networking: 5 } }
        ]
    },
    {
        event_id: "big_tech_entry",
        stage: "growth_stage",
        title: "events.big_tech_entry_title",
        description: "events.big_tech_entry_desc",
        choices: [
            { text: "events.big_tech_entry_choice_0", effects: { reputation: 15, brand_awareness: 10, users: -50 } },
            { text: "events.big_tech_entry_choice_1", effects: { product_quality: -10, technical_debt: 20, cash: -15000, users: -30 } },
            { text: "events.big_tech_entry_choice_2", effects: { brand_awareness: 20, reputation: 5, networking: 10 } }
        ]
    },


    // ══════════════════════════════════════════
    // PRODUCT MILESTONES & POSITIVE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "product_hunt_launch",
        stage: "mvp",
        title: "events.product_hunt_launch_title",
        description: "events.product_hunt_launch_desc",
        choices: [
            { text: "events.product_hunt_launch_choice_0", effects: { users: 800, brand_awareness: 20, reliability: -10, product_quality: -3 } },
            { text: "events.product_hunt_launch_choice_1", effects: { users: 400, brand_awareness: 15, product_quality: 5 } },
            { text: "events.product_hunt_launch_choice_2", effects: { users: 600, brand_awareness: 25, networking: 15 } }
        ]
    },
    {
        event_id: "app_store_feature",
        stage: "mvp",
        title: "events.app_store_feature_title",
        description: "events.app_store_feature_desc",
        choices: [
            { text: "events.app_store_feature_choice_0", effects: { users: 1000, brand_awareness: 30, product_quality: 5 } },
            { text: "events.app_store_feature_choice_1", effects: { users: 600, brand_awareness: 20 } },
            { text: "events.app_store_feature_choice_2", effects: { brand_awareness: 5, product_quality: 5 } }
        ]
    },
    {
        event_id: "top_startup_list",
        stage: "growth_stage",
        title: "events.top_startup_list_title",
        description: "events.top_startup_list_desc",
        choices: [
            { text: "events.top_startup_list_choice_0", effects: { brand_awareness: 20, networking: 15, reputation: 15 } },
            { text: "events.top_startup_list_choice_1", effects: { cash: 50000, networking: 20, founder_burnout: 5 } },
            { text: "events.top_startup_list_choice_2", effects: { product_quality: 5, team_morale: 10 } }
        ]
    },

    {
        event_id: "nps_breakout",
        stage: "growth_stage",
        title: "events.nps_breakout_title",
        description: "events.nps_breakout_desc",
        choices: [
            { text: "events.nps_breakout_choice_0", effects: { brand_awareness: 20, reputation: 15, networking: 10 } },
            { text: "events.nps_breakout_choice_1", effects: { product_quality: 15, intelligence: 5 } },
            { text: "events.nps_breakout_choice_2", effects: { users: 200, brand_awareness: 15 } }
        ]
    },

    // ══════════════════════════════════════════
    // FUNDRAISING & FINANCIAL STRESS
    // ══════════════════════════════════════════
    {
        event_id: "term_sheet_competition",
        stage: "growth_stage",
        title: "events.term_sheet_competition_title",
        description: "events.term_sheet_competition_desc",
        choices: [
            { text: "events.term_sheet_competition_choice_0", effects: { cash: 500000, networking: 30, reputation: 20 } },
            { text: "events.term_sheet_competition_choice_1", effects: { cash: 500000, reputation: 10, networking: 10 } },
            { text: "events.term_sheet_competition_choice_2", effects: { cash: 600000, networking: 15, founder_burnout: 10 } }
        ]
    },
    {
        event_id: "payroll_crisis",
        stage: "mvp",
        title: "events.payroll_crisis_title",
        description: "events.payroll_crisis_desc",
        choices: [
            { text: "events.payroll_crisis_choice_0", effects: { cash: 40000, founder_burnout: 20, founder_health: -5 } },
            { text: "events.payroll_crisis_choice_1", effects: { team_morale: -25, cash: 2000 } },
            { text: "events.payroll_crisis_choice_2", effects: { cash: 20000, founder_burnout: 15 } }
        ]
    },
    {
        event_id: "runway_crisis",
        stage: "mvp",
        title: "events.runway_crisis_title",
        description: "events.runway_crisis_desc",
        choices: [
            { text: "events.runway_crisis_choice_0", effects: { cash: 30000, team_morale: -30, burn_rate: -8000, employees: -2 } },
            { text: "events.runway_crisis_choice_1", effects: { cash: 15000, team_morale: 10, founder_burnout: 15 } },
            { text: "events.runway_crisis_choice_2", effects: { cash: 50000, founder_burnout: 20, networking: 10 } }
        ]
    },
    {
        event_id: "revenue_milestone",
        stage: "growth_stage",
        title: "events.revenue_milestone_title",
        description: "events.revenue_milestone_desc",
        choices: [
            { text: "events.revenue_milestone_choice_0", effects: { team_morale: 30, cash: -3000, reputation: 5 } },
            { text: "events.revenue_milestone_choice_1", effects: { brand_awareness: 25, networking: 15, reputation: 20 } },
            { text: "events.revenue_milestone_choice_2", effects: { team_morale: 10, founder_burnout: 5, product_quality: 5 } }
        ]
    },
    {
        event_id: "major_server_meltdown",
        stage: "growth_stage",
        title: "events.major_server_meltdown_title",
        description: "events.major_server_meltdown_desc",
        choices: [
            { text: "events.major_server_meltdown_choice_0", effects: { users: -500, product_quality: -15, reputation: -20, team_morale: -10 } },
            { text: "events.major_server_meltdown_choice_1", effects: { cash: -45000, product_quality: -5, team_morale: -20, technical_debt: 20 } },
            { text: "events.major_server_meltdown_choice_2", effects: { cash: -100000, reputation: 25, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "platform_ban_hammer",
        stage: "growth_stage",
        title: "events.platform_ban_hammer_title",
        description: "events.platform_ban_hammer_desc",
        choices: [
            { text: "events.platform_ban_hammer_choice_0", effects: { cash: -10000, networking: 25, stress_tolerance: -15, risk_appetite: 15 } },
            { text: "events.platform_ban_hammer_choice_1", effects: { technical_debt: 40, product_quality: -20, cash: -30000, team_morale: -15 } },
            { text: "events.platform_ban_hammer_choice_2", effects: { cash: -60000, reputation: 10, risk_appetite: 20 } }
        ]
    },
    {
        event_id: "toxic_culture_crisis",
        stage: "growth_stage",
        title: "events.toxic_culture_crisis_title",
        description: "events.toxic_culture_crisis_desc",
        choices: [
            { text: "events.toxic_culture_crisis_choice_0", effects: { cash: -50000, team_morale: 20, internal_stability: 10 } },
            { text: "events.toxic_culture_crisis_choice_1", effects: { employees: -4, product_quality: -25, team_morale: -30, technical_debt: 35 } },
            { text: "events.toxic_culture_crisis_choice_2", effects: { team_morale: 15, product_quality: -10, technical_debt: 10 } }
        ],
    },
    {
        event_id: "compute_shortage",
        scenario: "ai_rush",
        title: "events.compute_shortage_title",
        description: "events.compute_shortage_desc",
        choices: [
            { text: "events.compute_shortage_choice_0", effects: { cash: -50000, innovation: 10, burn_rate: 10000 } },
            { text: "events.compute_shortage_choice_1", effects: { technical_debt: 20, innovation: -5 } },
            { text: "events.compute_shortage_choice_2", effects: { product_quality: -10, burn_rate: -5000, intelligence: 5 } }
        ]
    },
    {
        event_id: "hype_cycle_peak",
        scenario: "ai_rush",
        title: "events.hype_cycle_peak_title",
        description: "events.hype_cycle_peak_desc",
        choices: [
            { text: "events.hype_cycle_peak_choice_0", effects: { innovation: 15, networking: 10 } },
            { text: "events.hype_cycle_peak_choice_1", effects: { cash: -20000, brand_awareness: 20, reputation: -10 } },
            { text: "events.hype_cycle_peak_choice_2", effects: { users: 500, risk_appetite: 15 } }
        ]
    },
    {
        event_id: "server_meltdown",
        scenario: "viral",
        title: "events.server_meltdown_title",
        description: "events.server_meltdown_desc",
        choices: [
            { text: "events.server_meltdown_choice_0", effects: { users: -2000, technical_debt: -30, reliability: 20 } },
            { text: "events.server_meltdown_choice_1", effects: { cash: -15000, burn_rate: 8000 } },
            { text: "events.server_meltdown_choice_2", effects: { brand_awareness: 10, reliability: -40, users: -500 } }
        ]
    },
    {
        event_id: "forced_monetization",
        scenario: "viral",
        title: "events.forced_monetization_title",
        description: "events.forced_monetization_desc",
        choices: [
            { text: "events.forced_monetization_choice_0", effects: { revenue: 5000, users: -5000, pmf_score: -10 } },
            { text: "events.forced_monetization_choice_1", effects: { revenue: 2000, brand_awareness: -15, team_morale: -5 } },
            { text: "events.forced_monetization_choice_2", effects: { cash: 10000, reputation: 10, brand_awareness: 5 } }
        ]
    }
];

export function getRandomEvent(stage: string, seenIds: string[] = [], scenarioId?: string): GameEvent | null {
    // Event triggering frequency is now controlled globally by the caller

    // Map game phases to event stages
    const mappedStage = (stage || "").toLowerCase();
    
    const validEvents = PREDEFINED_EVENTS.filter(e => {
        // Exclude if already seen and not repeatable
        if (e.event_id && seenIds.includes(e.event_id) && !e.repeatable) return false;

        // If event has a scenario requirement, it must match
        if (e.scenario && e.scenario !== scenarioId) return false;
        
        // If no scenario required, check stage
        if (!e.scenario && e.stage) {
            const eventStage = e.stage.toLowerCase();
            
            // Exact match
            if (eventStage === mappedStage) return true;
            
            // Logical mapping
            if (mappedStage === "idea phase" && eventStage === "mvp") return true;
            if (mappedStage === "early startup" && eventStage === "early_startup") return true;
            if (mappedStage === "traction" && eventStage === "early_startup") return true;
            if (mappedStage === "growth" && eventStage === "growth_stage") return true;
            if (mappedStage === "scaling" && eventStage === "growth_stage") return true;
            
            // Fallbacks for any/wildcard
            if (mappedStage === "any" || eventStage === "any") return true;
            if (eventStage === "early_startup" && (mappedStage === "growth" || mappedStage === "scaling")) return true; // Growth can still have early problems
            
            return false;
        }
        return true;
    });

    if (validEvents.length === 0) return null;

    // Prioritize scenario-specific events if they exist (40% bias)
    const scenarioSpecific = validEvents.filter(e => e.scenario === scenarioId);
    const pool = (scenarioSpecific.length > 0 && Math.random() < 0.4) ? scenarioSpecific : validEvents;

    return pool[Math.floor(Math.random() * pool.length)];
}
