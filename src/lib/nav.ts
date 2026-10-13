import { getEntry } from 'astro:content';
import { site } from '@/config/site';

/** Real (non-placeholder) timetable rows. */
export async function getTimetable() {
	return (await getEntry('schedule', 'main'))!.data.items.filter((c) => !c.todo);
}

/** Site nav without links to sections that aren't rendered (e.g. schedule before it has real classes). */
export async function getNav() {
	const hasTimetable = (await getTimetable()).length > 0;
	return site.nav.filter((item) => item.href !== '#schedule' || hasTimetable);
}
