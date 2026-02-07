
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type TriggerType = 'in_session' | 'post_session';

export interface AchievementDef {
    id: string;
    icon: string; // Lucide icon name or emoji
    title: string;
    description: string; // Internal description / Evidence template
    rarity: Rarity;
    triggerType: TriggerType;
    humorOptions: string[];
}

export const ACHIEVEMENTS: AchievementDef[] = [
    {
        id: 'night_owl',
        icon: 'Moon',
        title: 'Night Owl',
        description: 'Completed a session between 00:00 and 04:00.',
        rarity: 'rare',
        triggerType: 'post_session',
        humorOptions: [
            "The world sleeps, but you? You file taxes.",
            "Vampires and admins. The only ones awake.",
            "3 AM. The witching hour for productivity."
        ]
    },
    {
        id: 'unbroken_focus',
        icon: 'Zap',
        title: 'Unbroken Flow',
        description: 'Completed a session with zero pauses.',
        rarity: 'uncommon',
        triggerType: 'post_session',
        humorOptions: [
            "Bladder of steel.",
            "No pauses. Just pure, unadulterated admin.",
            "You didn't even blink, did you?"
        ]
    },
    {
        id: 'quick_wrap',
        icon: 'Wind',
        title: 'Irish Goodbye',
        description: 'Finished wrap-up in under 20 seconds.',
        rarity: 'common',
        triggerType: 'post_session',
        humorOptions: [
            "In, out, done.",
            "Leaving the crime scene quickly.",
            "Wrap up speed record broken."
        ]
    },
    {
        id: 'first_step',
        icon: 'Footprints',
        title: 'First Step',
        description: 'Completed the first task of the session.',
        rarity: 'common',
        triggerType: 'in_session',
        humorOptions: [
            "One down. Infinity to go.",
            "The hardest part is starting. Or so they say.",
            "Momentum is building."
        ]
    }
];

export function getAchievement(id: string): AchievementDef | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

export function getRandomHumor(id: string): string {
    const ach = getAchievement(id);
    if (!ach || ach.humorOptions.length === 0) return "Achievement unlocked.";
    const index = Math.floor(Math.random() * ach.humorOptions.length);
    return ach.humorOptions[index];
}
