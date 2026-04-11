import { LocalNotifications } from '@capacitor/local-notifications';

const MESSAGES: Record<string, string[]> = {
  Bootstrapping: [
    "Your startup is burning cash! Log in before your runway runs out.",
    "Your co-founder needs your help on a critical update."
  ],
  "Angel Investment": [
    "Your Angel investors are requesting an update. Time to drive growth!",
    "Your ad campaign finished. Let's launch another one to keep the momentum."
  ],
  "Seed Round": [
    "The board is asking about our PMF score. Let's get it up!",
    "Your team is waiting for the next feature release."
  ],
  "Series A": [
    "A competitor just announced a major pivot. We need to scale faster!",
    "Don't lose your unicorn trajectory! Let's get back to building."
  ],
  Default: [
    "Your startup needs you. Come back and build the next unicorn!",
    "The market never sleeps. Keep your growth rate high!"
  ]
};

const HAIL_MARY_MESSAGES = [
  "Your CTO is threatening to quit! Come back to fix team morale.",
  "Your startup has been idle for 3 days. Are we shutting down?",
  "Investors are getting nervous about the silence. Release an update!"
];

function getRandomMessage(stage: string, hailMary: boolean = false): string {
  if (hailMary) {
    return HAIL_MARY_MESSAGES[Math.floor(Math.random() * HAIL_MARY_MESSAGES.length)];
  }
  const pool = MESSAGES[stage] || MESSAGES.Default;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getSafeDaytime(hoursFromNow: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);

  const targetHour = d.getHours();
  // Safe window 10 AM to 11 PM
  if (targetHour < 10) {
    d.setHours(10, 0, 0, 0); // push to 10 AM same day
  } else if (targetHour >= 23) {
    d.setDate(d.getDate() + 1); // push to next day
    d.setHours(10, 0, 0, 0);    // at 10 AM
  }
  
  return d;
}

export const notificationService = {
  async askPermissions() {
    try {
      const currentPerms = await LocalNotifications.checkPermissions();
      
      // If the permission is in the unasked 'prompt' state, request it
      if (currentPerms.display === 'prompt') {
        const resp = await LocalNotifications.requestPermissions();
        return resp.display === 'granted';
      }
      
      // Otherwise, they already granted or denied it. Never ask again.
      return currentPerms.display === 'granted';
    } catch {
      return false; // usually means unsupported environment
    }
  },

  async clearAll() {
    try {
      // Clear pending
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.warn("Failed to clear notifications:", e);
    }
  },

  async scheduleAbsenceReminders(stage?: string) {
    try {
      const perms = await LocalNotifications.checkPermissions();
      if (perms.display !== 'granted') return;

      await this.clearAll();

      const stg = stage || "Default";
      
      const tenHours = getSafeDaytime(10);
      const seventyTwoHours = getSafeDaytime(72);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Your Startup Misses You",
            body: getRandomMessage(stg, false),
            id: 101, // arbitrary unique id
            schedule: { at: tenHours },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          },
          {
            title: "🚨 Emergency at HQ",
            body: getRandomMessage(stg, true),
            id: 102,
            schedule: { at: seventyTwoHours },
          }
        ]
      });
      console.log("[Notification] Scheduled for:", tenHours.toLocaleString(), "and", seventyTwoHours.toLocaleString());
    } catch (e) {
      console.warn("Failed to schedule notifications:", e);
    }
  }
};
