/**
 * Runs before every build: fails loudly on a YAML syntax error in src/data/
 * (Astro's loader only logs it and silently keeps the previous content).
 * Field-level checks (missing/wrong fields) are done by the schemas in src/content.config.ts.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

let failed = false;
for (const file of readdirSync('src/data').filter((f) => /\.ya?ml$/.test(f))) {
	try {
		parse(readFileSync(`src/data/${file}`, 'utf8'));
	} catch (err) {
		failed = true;
		console.error(`\n✗ src/data/${file}\n${err.message}\n  טיפ: טקסט שמכיל ": " (נקודתיים ורווח) צריך להיות בתוך מירכאות "..."\n`);
	}
}
if (failed) process.exit(1);
console.log('✓ data files OK');
