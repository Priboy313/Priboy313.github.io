// ==UserScript==
// @name         omniNexus
// @version      1.5
// @author       Priboy313
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @connect      127.0.0.1
// @connect      localhost
// @connect      my-domain.com // Заменить на кастомный сервер
// @connect      api.github.com
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// ==/UserScript==

(function() {
	'use strict';

	const CONFIG = {
		systemRoot: "omniNexus", // Название корневой папки Нексуса 
		workspace: "Base", // Название конкретного пространства, где лежат модули

		// Базовый домен, на котором разворачиваем Нексус
		dashboardHost: "google.com",
		// Путь к конкретной странице на домене, лучше брать несуществующий на самом сайте
		dashboardPath: "/priboy313",

		provider: "github", // github | custom | local | file

		sources: {
			github: {
				// Данные репозитория и его владельца
				username: "Priboy313",
				repo: "Priboy313.github.io",
				branch: "main",
				token: ["ghp", "_", "jxnJlaxiJLsgkzg6mqaKq7YtJH5ob414f3Lw"].join("")
			},
			custom: {
				// Адрес собственного сервера, если Гитхаб чем-то не устраивает
				baseUrl: "https://my-domain.com/omni-nexus"
			},
			local: {
				// Вставляем адрес локального СЕРВЕРА (например, LiveServer VSCode)
				baseUrl: "http://127.0.0.1:5500"
			},
			file: {
				// Путь до локальной папки с файлами проекта, напрямую, без сервера
				baseUrl: "file:///C:/Users/USER_NAME/Desktop/omniNexus"
			}
		},

		role: "dodev",
		ttlMinutes: 60, // Время жизни кэша коммита
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
			options.onload = res => {
				const isSuccess = res.status === 200 || (res.status === 0 && res.responseText);
				if (isSuccess) resolve(res);
				else reject(res.status);
			};
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

	function getCoreUrl(hash) {
		const src = CONFIG.sources[CONFIG.provider];
		const path = `outer/${CONFIG.systemRoot}/_core/NexusBehaviour.js`;

		if (CONFIG.provider === 'github') {
			return `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
		}
		if (CONFIG.provider === 'file') {
			return `${src.baseUrl}/${path}`;
		}
		return `${src.baseUrl}/${path}?t=${Date.now()}`;
	}

	function getWorkerUrl(workerName, hash) {
		const src = CONFIG.sources[CONFIG.provider];
		const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/${workerName}`;

		if (CONFIG.provider === 'github') {
			return `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
		}
		if (CONFIG.provider === 'file') {
			return `${src.baseUrl}/${path}`;
		}
		return `${src.baseUrl}/${path}?t=${Date.now()}`;
	}

	async function updateRouter(hash) {
		try {
			let routerUrl;
			const src = CONFIG.sources[CONFIG.provider];
			const path = `outer/${CONFIG.systemRoot}/${CONFIG.workspace}/router.json`;

			if (CONFIG.provider === 'github') {
				routerUrl = `https://cdn.jsdelivr.net/gh/${src.username}/${src.repo}@${hash}/${path}`;
			} else if (CONFIG.provider === 'file') {
				routerUrl = `${src.baseUrl}/${path}`;
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

	async function executeWorker(workerFileName, moduleId, hash) {
		const coreUrl = getCoreUrl(hash);
		const workerUrl = getWorkerUrl(workerFileName, hash);

		const globalSettings = GM_getValue(SETTINGS_KEY, {});
		const moduleSettings = globalSettings[moduleId] || {};
		const settingsJSON = JSON.stringify(moduleSettings);

		try {
			const [coreRes, workerRes] = await Promise.all([
				request({ method: 'GET', url: coreUrl }),
				request({ method: 'GET', url: workerUrl })
			]);

			const NexusBehaviour = new Function(coreRes.responseText + '; return NexusBehaviour;')();

			const WorkerClass = new Function('NexusBehaviour', workerRes.responseText + '; return typeof ModuleClass !== "undefined" ? ModuleClass : null;')(NexusBehaviour);

			if (WorkerClass) {
				new WorkerClass({
					settingsJSON,
					role: CONFIG.role,
					GM_getValue,
					GM_setValue,
					CONFIG
				});
			} else {
				console.error(`[omniNexus] ${workerFileName} не вернул ModuleClass`);
			}
		} catch (err) {
			console.error(`[omniNexus] Ошибка выполнения ${workerFileName} (${hash}):`, err);
		}
	}
})();