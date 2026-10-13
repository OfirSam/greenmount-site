/**
 * One-command rollback of the LIVE site to an earlier Netlify deploy (no rebuild, instant).
 *   npm run rollback                → the version before the UX redesign (2026-10-13)
 *   npm run rollback -- <deployId>  → any earlier deploy (ids: Netlify → Deploys, or `npx netlify-cli api listSiteDeploys`)
 * To go forward again, run `npm run deploy` (or "Publish deploy" on the newer deploy in Netlify).
 * Code-level undo of the redesign: `git revert -m 1 <merge commit>` – see README §9.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SITE_ID = JSON.parse(readFileSync('.netlify/state.json', 'utf8')).siteId;
const PRE_UX_V2 = '6accccaca93c8125e67d47b3'; // live version before the UX redesign
const deployId = process.argv[2] || PRE_UX_V2;

const r = spawnSync(
	'npx',
	['--yes', 'netlify-cli', 'api', 'restoreSiteDeploy', '--data', JSON.stringify({ site_id: SITE_ID, deploy_id: deployId })],
	{ encoding: 'utf8' },
);
try {
	const d = JSON.parse(r.stdout);
	console.log(`✓ live site now serves deploy ${d.id} (${d.state})`);
} catch {
	console.error('rollback failed:\n', r.stdout || r.stderr);
	process.exit(1);
}
