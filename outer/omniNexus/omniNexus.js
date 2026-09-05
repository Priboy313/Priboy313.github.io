// ==UserScript==
// @name         omniNexus
// @version      1.2
// @author       Priboy313
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @connect      127.0.0.1
// @connect      localhost
// @connect      api.github.com
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// ==/UserScript==

(function() {
	'use strict';

	const CONFIG = {
		systemRoot: "omniNexus",
		workspace: "Base",
		role: "dodev",
		dashboardHost: "google.com",
		dashboardPath: "/priboy313",
		ttlMinutes: 60, // Время жизни кэша коммита
		provider: "github", // "github" | "custom" | "local"
		sources: {
			github: {
				username: "Priboy313",
				repo: "Priboy313.github.io",
				branch: "main",
				token: ["ghp", "_", "jxnJlaxiJLsgkzg6mqaKq7YtJH5ob414f3Lw"].join("")
			},
			custom: {
				baseUrl: "https://my-domain.com/scripts"
			},
			local: {
				baseUrl: "http://127.0.0.1:5500"
			}
		}
	};

	const CACHE_PREFIX = `nexus_${CONFIG.workspace}_`;
	const ROUTER_CACHE_KEY = CACHE_PREFIX + 'router';
	const SETTINGS_KEY = CACHE_PREFIX + 'settings';
	const HASH_CACHE_KEY = CACHE_PREFIX + 'commit_hash';

	const currentUrl = window.location.href;

	let routerCache = GM_getValue(ROUTER_CACHE_KEY, { timestamp: 0, routes: [] });

	let activeRoute = null;
	for (const route of routerCache.routes) {
		if (new RegExp(route.pattern, 'i').test(currentUrl)) {
			activeRoute = route;
			break;
		}
	}

	const isDashboardHome = !activeRoute && new RegExp(`${CONFIG.dashboardHost}${CONFIG.dashboardPath}\\/?(\\?.*)?$`, 'i').test(currentUrl);

	if (!activeRoute && !isDashboardHome) return;

	if (currentUrl.includes(CONFIG.dashboardHost)) {
		window.stop();
		document.documentElement.innerHTML = `
			<head><title>${CONFIG.workspace} Hub</title></head>
			<body style="background:#0f172a;color:#38bdf8;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
				<h2>[omniNexus:${CONFIG.workspace}] Loading...</h2>
			</body>`;
	}

	init();

	async function init() {
		try {
			const ttlMs = CONFIG.ttlMinutes * 60 * 1000;
			const cachedHashData = GM_getValue(HASH_CACHE_KEY, null);
			const isExpired = !cachedHashData || (Date.now() - cachedHashData.timestamp > ttlMs);

			const needUpdate = isDashboardHome || isExpired;
			
			const currentHash = await resolveCommitHash(needUpdate);

			if (needUpdate) {
				await updateRouter(currentHash);
			}

			if (isDashboardHome) {
				await executeWorker('dashboard.js', 'dashboard', currentHash);
			} else if (activeRoute && activeRoute.worker) {
				await executeWorker(activeRoute.worker, activeRoute.moduleId, currentHash);
			}
		} catch (err) {
			console.error(`[omniNexus:${CONFIG.workspace}] Ошибка инициализации:`, err);
		}
	}

	function request(options) {
		return new Promise((resolve, reject) => {
			options.onload = res => (res.status === 200) ? resolve(res) : reject(res.status);
			options.onerror = reject;
			GM_xmlhttpRequest(options);
		});
	}

	async function resolveCommitHash(forceUpdate) {
		if (CONFIG.provider !== 'github') return 'latest';

		const cached = GM_getValue(HASH_CACHE_KEY, null);

		if (!forceUpdate && cached && cached.hash) {
			return cached.hash;
		}

		const src = CONFIG.sources.github;
		const apiUrl = `https://api.github.com/repos/${src.username}/${src.repo}/commits/${src.branch}`;
		const headers = { "Accept": "application/vnd.github.v3+json" };
		if (src.token && src.token.trim()) {
			headers["Authorization"] = `token ${src.token.trim()}`;
		}

		try {
			const res = await request({ method: 'GET', url: apiUrl, headers });
			const latestSha = JSON.parse(res.responseText).sha;

			GM_setValue(HASH_CACHE_KEY, {
				hash: latestSha,
				timestamp: Date.now()
			});

			return latestSha;
		} catch (e) {
			console.warn("[omniNexus] Ошибка получения свежего коммита из API, используем прошлый кэш:", e);
			return cached ? cached.hash : 'main';
		}
	}

	async function updateRouter(hash) {
		try {
			let routerUrl;
			const src = CONFIG.sources[CONFIG.provider];
			const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/router.json`;

			if (CONFIG.provider === 'github') {
				routerUrl = `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
			} else {
				routerUrl = `${src.baseUrl}/${path}?t=${Date.now()}`;
			}

			const res = await request({ method: 'GET', url: routerUrl });
			const newRouter = JSON.parse(res.responseText);

			GM_setValue(ROUTER_CACHE_KEY, {
				timestamp: Date.now(),
				routes: newRouter.routes || []
			});
		} catch (e) {
			console.error("[omniNexus] Ошибка обновления router.json:", e);
		}
	}

	function getWorkerUrl(workerName, hash) {
		const src = CONFIG.sources[CONFIG.provider];
		const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/${workerName}`;

		if (CONFIG.provider === 'github') {
			return `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
		}
		return `${src.baseUrl}/${path}?t=${Date.now()}`;
	}

	async function executeWorker(workerFileName, moduleId, hash) {
		const workerUrl = getWorkerUrl(workerFileName, hash);
		const globalSettings = GM_getValue(SETTINGS_KEY, {});
		const moduleSettings = globalSettings[moduleId] || {};
		const settingsJSON = JSON.stringify(moduleSettings);

		try {
			const res = await request({ method: 'GET', url: workerUrl });
			const workerFn = new Function('settingsJSON', 'role', 'GM_getValue', 'GM_setValue', 'CONFIG', res.responseText);
			workerFn(settingsJSON, CONFIG.role, GM_getValue, GM_setValue, CONFIG);
		} catch (err) {
			console.error(`[omniNexus] Ошибка загрузки ${workerFileName} (${hash}):`, err);
		}
	}
})();