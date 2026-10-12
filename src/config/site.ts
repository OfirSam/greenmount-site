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
		title: 'MMA, קיקבוקסינג ואומנויות לחימה בגליל העליון | GREENMOUNT קיבוץ גונן',
		description:
			"GREENMOUNT בקיבוץ גונן, הגליל העליון: MMA, קיקבוקסינג, ג'יו ג'יטסו, ג'ודו וכושר פונקציונלי לילדים, נוער ובוגרים. אימון ניסיון ללא התחייבות.",
		ogDescription:
			"מקום לגדול בו – בגוף, בביטחון ובדרך. ג'יו ג'יטסו, ג'ודו, קיקבוקסינג, MMA וכושר פונקציונלי לכל הגילאים.",
		twitterDescription: 'מקום לגדול בו – בגוף, בביטחון ובדרך.',
		ogImage: '/og-image.jpg',
	},

	/** Other names people search for (Hebrew spelling etc.) – used in structured data */
	alternateNames: ['גרינמאונט', 'גרין מאונט', 'GREENMOUNT MMA', 'Green Mount MMA'],

	location: {
		short: 'קיבוץ גונן · הגליל העליון',
		// Shown next to the map + used in structured data (areaServed). Keep it factual.
		area: 'המועדון נמצא בקיבוץ גונן שבעמק החולה, בגליל העליון – קרוב לקריית שמונה וליישובי אצבע הגליל.',
		areaServed: ['הגליל העליון', 'עמק החולה', 'אצבע הגליל', 'קריית שמונה', 'מועצה אזורית גליל עליון'],
		locality: 'קיבוץ גונן',
		region: 'הגליל העליון',
		// TODO: כתובת מדויקת (רחוב/מבנה בתוך הקיבוץ). ריק = לא מוצג
		address: '',
		// TODO: שעות פעילות, שורה לכל טווח. ריק = לא מוצג
		hours: [] as string[],
		// TODO: הערות הגעה/חניה (לא חובה)
		directions: '',
		// Kibbutz Gonen (OpenStreetMap). TODO: replace with the club's exact pin once known
		geo: { lat: 33.1239, lng: 35.6463 } as { lat: number; lng: number } | null,
		// What the map / navigation links search for (switch to "lat,lng" once geo is known)
		mapQuery: 'קיבוץ גונן',
	},

	/** Phone in international format – same number as WhatsApp. */
	phone: '+972525089079',
	phoneDisplay: '052-508-9079',

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
		// TODO: קישור לביקורות בגוגל (Google Business Profile). ריק = לא מוצג
		googleReviews: '',
	},

	/**
	 * Instagram feed via Behold.so (see README → אינסטגרם).
	 * TODO: הדביקו כאן את כתובת ה-JSON feed מ-Behold. ריק = מוצגות תמונות קבועות + כפתור מעקב.
	 */
	instagram: {
		beholdFeedUrl: '',
		postsToShow: 6,
	},

	/** Hero background video (files live in public/assets/video/). */
	heroVideo: {
		mp4: '/assets/video/hero.mp4',
		webm: '/assets/video/hero.webm',
		mp4Mobile: '/assets/video/hero-mobile.mp4',
	},

	analytics: {
		// Tracking runs ONLY on these hostnames – staging / preview / local URLs never send data
		hosts: ['greenmount.co.il', 'www.greenmount.co.il'],
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

	// mobileLabel (optional) = different text in the mobile menu
	nav: [
		{ href: '#coach', label: 'הכירו אותנו' },
		{ href: '#kids', label: 'ילדים' },
		{ href: '#disciplines', label: 'תחומי אימון', mobileLabel: 'נוער ובוגרים' },
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
