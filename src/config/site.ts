/**
 * ─────────────────────────────────────────────────────────────
 *  GREENMOUNT – הגדרות האתר (קובץ אחד לכל פרטי הקשר והמעקב)
 *  Site config: contact details, WhatsApp, socials, analytics.
 *  ערכו כאן בלבד – כל הכפתורים באתר נבנים מהקובץ הזה.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
	name: 'GREENMOUNT',
	url: 'https://greenmount.co.il',
	locale: 'he_IL',

	seo: {
		title: 'GREENMOUNT – אומנויות לחימה וכושר | קיבוץ גונן',
		description:
			"מועדון אומנויות לחימה וכושר GREENMOUNT בקיבוץ גונן. ג'יו ג'יטסו, ג'ודו, קיקבוקסינג, MMA וכושר פונקציונלי לילדים, נוער ובוגרים. הגיעו לאימון ניסיון.",
		ogDescription:
			"מקום לגדול בו – בגוף, בביטחון ובדרך. ג'יו ג'יטסו, ג'ודו, קיקבוקסינג, MMA וכושר פונקציונלי לכל הגילאים.",
		twitterDescription: 'מקום לגדול בו – בגוף, בביטחון ובדרך.',
		ogImage: '/og-image.jpg',
	},

	location: {
		short: 'קיבוץ גונן · הגליל העליון',
		// TODO: כתובת מדויקת (רחוב/מבנה בתוך הקיבוץ)
		address: 'TODO: כתובת מדויקת, קיבוץ גונן',
		// TODO: שעות פעילות
		hours: 'TODO: שעות פעילות',
	},

	/**
	 * WhatsApp – מספר אחד לכל האתר (ללא + ורווחים).
	 * המספר נלקח מהאתר הקיים – לוודא שהוא עדכני.
	 */
	whatsapp: {
		number: '972525089079',
		messages: {
			general: 'היי! אני רוצה לשמוע פרטים על אימון ניסיון 🥋',
			trial: 'היי! אני רוצה לקבוע אימון ניסיון 🥋 מתי אפשר?',
			kids: 'היי! אשמח לשמוע פרטים על האימונים לילדים ולקבוע אימון ניסיון 🥋',
			youth: 'היי! אשמח לשמוע פרטים על האימונים לנוער 🥋',
			adults: 'היי! אשמח לשמוע פרטים על האימונים לבוגרים 🥋',
			schedule: 'היי! אשמח לשמוע איזו קבוצה מתאימה לי ומה מערכת השעות 🥋',
			'muay-thai': 'היי! אשמח לשמוע פרטים על אימוני איגרוף תאילנדי / קיקבוקסינג 🥊',
			mma: 'היי! אשמח לשמוע פרטים על אימוני MMA 🥋',
			bjj: "היי! אשמח לשמוע פרטים על אימוני ג'יו ג'יטסו ברזילאי 🥋",
			judo: "היי! אשמח לשמוע פרטים על אימוני ג'ודו 🥋",
			'fitness-women': 'היי! אשמח לשמוע פרטים על כושר פונקציונלי לנשים 💪',
			'fitness-men': 'היי! אשמח לשמוע פרטים על כושר פונקציונלי לגברים 💪',
		},
	},

	social: {
		instagram: 'https://www.instagram.com/greenmount_mma',
		instagramHandle: '@greenmount_mma',
		facebook: 'https://www.facebook.com/share/1EAUGDvVtA/',
		tiktok: 'https://www.tiktok.com/@neta_grinberg',
	},

	/** Hero background video (files live in public/assets/video/). */
	heroVideo: {
		mp4: '/assets/video/hero.mp4',
		webm: '/assets/video/hero.webm',
		mp4Mobile: '/assets/video/hero-mobile.mp4',
	},

	analytics: {
		// Google Analytics 4 – פעיל באתר הקיים
		ga4: 'G-VH93JV5K4J',
		// TODO: Meta Pixel ID (ריק = לא נטען)
		metaPixel: '',
		// TODO: TikTok Pixel ID (ריק = לא נטען)
		tiktokPixel: '',
		// Google Sheets tracker (Apps Script) – פעיל באתר הקיים
		sheetsTrackerUrl:
			'https://script.google.com/macros/s/AKfycbzy1RoAna1HLpN6WQrQZp3xmEAiNcdq83hMQmNRnBoDC_Uk0UztF5UjZwuxorRT6ES1/exec',
	},

	nav: [
		{ href: '#coach', label: 'המאמן' },
		{ href: '#kids', label: 'ילדים' },
		{ href: '#disciplines', label: 'תחומי אימון' },
		{ href: '#schedule', label: 'מערכת שעות' },
		{ href: '#gallery', label: 'גלריה' },
		{ href: '#faq', label: 'שאלות' },
		{ href: '#trial', label: 'צרו קשר' },
	],
} as const;

export type WhatsAppContext = keyof typeof site.whatsapp.messages;

/** Builds a wa.me link with a prefilled Hebrew message for the given context. */
export function waLink(context: WhatsAppContext = 'general'): string {
	const text = encodeURIComponent(site.whatsapp.messages[context]);
	return `https://wa.me/${site.whatsapp.number}?text=${text}`;
}
