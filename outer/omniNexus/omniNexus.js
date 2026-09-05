// ==UserScript==
// @name         omniNexus
// @version      1.0
// @author       Priboy313
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function() {
	'use strict';

	const CONFIG = {
		systemRoot: "omniNexus",
		workspace: "Base",
		role: "dodev",
		dashboardHost: "google.com",
		dashboardPath: "/priboy313",
		ttlMinutes: 60,
		provider: "github", // "github" | "custom" | "local"
		sources: {
			github: {
				username: "Priboy313",
				repo: "Priboy313.github.io",
				branch: "main"
			},
			custom: {
				baseUrl: "https://my-domain.com/scripts"
			},
			local: {
				baseUrl: "http://127.0.0.1:8080/outer"
			}
		}
	};

	const CACHE_PREFIX = `nexus_${CONFIG.workspace}_`;
	const ROUTER_CACHE_KEY = CACHE_PREFIX + 'router';
	const SETTINGS_KEY = CACHE_PREFIX + 'settings';
	const HASH_CACHE_KEY = CACHE_PREFIX + 'commit_hash';

	const currentUrl = window.location.href;
	const isDashboard = currentUrl.includes(CONFIG.dashboardHost + CONFIG.dashboardPath);

	let routerCache = GM_getValue(ROUTER_CACHE_KEY, { timestamp: 0, routes: [] });

	let activeRoute = null;
	for (const route of routerCache.routes) {
		if (new RegExp(route.pattern, 'i').test(currentUrl)) {
			activeRoute = route;
			break;
		}
	}

	if (!activeRoute && !isDashboard) return;

	if (isDashboard) {
		window.stop();
		document.documentElement.innerHTML = `
			<head><title>${CONFIG.workspace} Hub</title></head>
			<body style="background:#0f172a;color:#38bdf8;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
				<h2>[OmniNexus:${CONFIG.workspace}] Initializing core...</h2>
			</body>`;

		updateSystem().finally(() => executeWorker('dashboard.js', 'dashboard'));
	} else {
		const isCacheExpired = (Date.now() - routerCache.timestamp) > (CONFIG.ttlMinutes * 60 * 1000);
		if (isCacheExpired) {
			updateSystem();
		}

		if (activeRoute && activeRoute.worker) {
			executeWorker(activeRoute.worker, activeRoute.moduleId);
		}
	}

	function request(options) {
		return new Promise((resolve, reject) => {
			options.onload = res => (res.status === 200) ? resolve(res) : reject(res.status);
			options.onerror = reject;
			GM_xmlhttpRequest(options);
		});
	}

	function getRouterUrl() {
		const src = CONFIG.sources[CONFIG.provider];
		const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/router.json`;
		if (CONFIG.provider === 'github') {
			return `https://raw.githubusercontent.com/${src.username}/${src.repo}/${src.branch}/${path}?t=${Date.now()}`;
		}
		return `${src.baseUrl}/${path}?t=${Date.now()}`;
	}

	function getWorkerUrl(workerName, hash) {
		const src = CONFIG.sources[CONFIG.provider];
		const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/${workerName}`;
		if (CONFIG.provider === 'github') {
			return `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
		}
		return `${src.baseUrl}/${path}?t=${Date.now()}`;
	}

	async function updateSystem() {
		try {
			const routerRes = await request({ method: 'GET', url: getRouterUrl() });
			const newRouter = JSON.parse(routerRes.responseText);

			let commitHash = 'main';
			if (CONFIG.provider === 'github') {
				const src = CONFIG.sources.github;
				const apiUrl = `https://api.github.com/repos/${src.username}/${src.repo}/commits/${src.branch}`;
				const hashRes = await request({
					method: 'GET',
					url: apiUrl,
					headers: { "Accept": "application/vnd.github.v3+json" }
				});
				commitHash = JSON.parse(hashRes.responseText).sha;
				GM_setValue(HASH_CACHE_KEY, commitHash);
			}

			GM_setValue(ROUTER_CACHE_KEY, {
				timestamp: Date.now(),
				routes: newRouter.routes || []
			});

			return commitHash;
		} catch (e) {
			console.error(`[OmniNexus:${CONFIG.workspace}] Sync error:`, e);
		}
	}

	function executeWorker(workerFileName, moduleId) {
		const hash = GM_getValue(HASH_CACHE_KEY, 'main');
		const workerUrl = getWorkerUrl(workerFileName, hash);
		const globalSettings = GM_getValue(SETTINGS_KEY, {});
		const moduleSettings = globalSettings[moduleId] || {};
		const settingsJSON = JSON.stringify(moduleSettings);

		request({ method: 'GET', url: workerUrl })
			.then(res => {
				const workerFn = new Function('settingsJSON', 'role', 'GM_getValue', 'GM_setValue', 'CONFIG', res.responseText);
				workerFn(settingsJSON, CONFIG.role, GM_getValue, GM_setValue, CONFIG);
			})
			.catch(err => console.error(`[OmniNexus] Failed to load ${workerFileName}:`, err));
	}
})();