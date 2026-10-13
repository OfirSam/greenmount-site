/**
 * One-command rollback of the LIVE site to an earlier Netlify deploy (no rebuild, instant).
 *   npm run rollback                → the production deploy before the current one
 *   npm run rollback -- <deployId>  → a specific deploy (ids: Netlify → Deploys)
 * Same as clicking an older deploy in Netlify → Deploys → "Publish deploy".
 * To go forward again: `npm run deploy` (or publish the newer deploy in Netlify).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const api = (method, data) => {
	const r = spawnSync('npx', ['--yes', 'netlify-cli', 'api', method, '--data', JSON.stringify(data)], { encoding: 'utf8' });
	try {
		return JSON.parse(r.stdout);
	} catch {
		console.error(`netlify ${method} failed:\n`, r.stdout || r.stderr);
		process.exit(1);
	}
};

let siteId;
try {
	siteId = JSON.parse(readFileSync('.netlify/state.json', 'utf8')).siteId;
} catch {
	console.error('This folder is not linked to a Netlify site yet. Run: npx netlify-cli link');
	process.exit(1);
}

let deployId = process.argv[2];
if (!deployId) {
	const deploys = api('listSiteDeploys', { site_id: siteId, per_page: 20 }).filter(
		(d) => d.state === 'ready' && d.context === 'production',
	);
	if (deploys.length < 2) {
		console.error('No earlier production deploy to roll back to.');
		process.exit(1);
	}
	deployId = deploys[1].id;
	console.log(`Rolling back to ${deployId} (${deploys[1].created_at})`);
}
const d = api('restoreSiteDeploy', { site_id: siteId, deploy_id: deployId });
console.log(`✓ live site now serves deploy ${d.id} (${d.state})`);
