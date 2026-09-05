(function(settingsJSON, role = "user", GM_getValue, GM_setValue, CONFIG) {

	const SCRIPT_ID = 'nexusDashboard';
	const ROLE = role;

	const ROUTER_CACHE_KEY = `nexus_${CONFIG.workspace}_router`;
	const HASH_CACHE_KEY = `nexus_${CONFIG.workspace}_commit_hash`;
	const SETTINGS_KEY = `nexus_${CONFIG.workspace}_settings`;

	function print(...args) {
		if (ROLE === "dodev") {
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	function addCustomCSS() {
		const style = document.createElement('style');
		style.id = `custom-${SCRIPT_ID}-css`;
		style.textContent = `
			* { box-sizing: border-box; }
			body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; padding: 40px 20px; display: flex; justify-content: center; }
			.container { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 32px; }
			
			/* Брендовый заголовок */
			header { border-bottom: 1px solid #1e293b; padding-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
			.brand-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #f8fafc; display: flex; align-items: center; gap: 10px; }
			.brand-title span { color: #38bdf8; }
			.brand-subtitle { font-size: 14px; color: #64748b; margin-top: 6px; }
			.meta-pill { font-family: monospace; font-size: 12px; background: #1e293b; border: 1px solid #334155; padding: 6px 12px; border-radius: 20px; color: #94a3b8; }

			/* Список модулей */
			.section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 16px 0; font-weight: 600; }
			.modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
			.module-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.15s; }
			.module-card:hover { border-color: #38bdf8; transform: translateY(-2px); }
			.module-card h3 { margin: 0 0 8px 0; font-size: 16px; color: #f8fafc; }
			.module-card p { margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.4; flex-grow: 1; }
			.module-btn { background: #334155; border: 1px solid #475569; color: #38bdf8; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; }
			.module-card:hover .module-btn { background: #0284c7; color: #fff; border-color: #0284c7; }

			/* Нижний блок настроек */
			details { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; font-size: 14px; }
			summary { cursor: pointer; color: #94a3b8; font-weight: 600; user-select: none; }
			textarea { width: 100%; height: 180px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 10px; margin-top: 12px; font-family: monospace; font-size: 12px; }
			.save-btn { margin-top: 8px; background: #0284c7; border: none; color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
		`;
		document.head.appendChild(style);
	}

	function runImmediate() {
		document.documentElement.innerHTML = `<head><title>${CONFIG.workspace} Hub</title></head><body><div class="container" id="app"></div></body>`;
		addCustomCSS();
	}

	function runOnLoad() {
		render();
	}

	function render() {
		const app = document.getElementById('app');
		const routerData = GM_getValue(ROUTER_CACHE_KEY, { routes: [] });
		const hashRaw = GM_getValue(HASH_CACHE_KEY, 'main');
		const hash = (typeof hashRaw === 'object' && hashRaw !== null) ? (hashRaw.hash || 'main') : String(hashRaw || 'main');

		let modulesHTML = '';
		if (routerData.routes.length === 0) {
			modulesHTML = '<div style="color:#64748b;font-size:14px;">Нет зарегистрированных модулей в этом спейсе.</div>';
		} else {
			routerData.routes.forEach(m => {
				modulesHTML += `
					<a class="module-card" href="${m.launchUrl || '#'}" target="${m.launchUrl?.startsWith('http') ? '_self' : '_blank'}">
						<div>
							<h3>${m.name || m.moduleId}</h3>
							<p>${m.desc || 'Модуль системы omniNexus'}</p>
						</div>
						<div class="module-btn">Запустить ➔</div>
					</a>
				`;
			});
		}

		app.innerHTML = `
			<header>
				<div>
					<h1 class="brand-title">⚡ omniNexus <span>// ${CONFIG.workspace}</span></h1>
					<div class="brand-subtitle">Environment Hub & Launcher</div>
				</div>
				<div class="meta-pill">${CONFIG.provider.toUpperCase()} : ${hash.substring(0, 7)}</div>
			</header>

			<div>
				<div class="section-title">Доступные модули</div>
				<div class="modules-grid">
					${modulesHTML}
				</div>
			</div>

			<details>
				<summary>⚙️ Конфигурация спейса (${CONFIG.workspace})</summary>
				<textarea id="settings-area">${JSON.stringify(globalSettings, null, 2)}</textarea>
				<button class="save-btn" id="save-btn">Сохранить</button>
			</details>
		`;

		document.getElementById('save-btn').onclick = () => {
			try {
				const val = JSON.parse(document.getElementById('settings-area').value);
				GM_setValue(SETTINGS_KEY, val);
				alert('Конфигурация сохранена');
			} catch (e) {
				alert('Ошибка валидации JSON');
			}
		};
	}

	function main() {
		runImmediate();
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runOnLoad);
		} else {
			runOnLoad();
		}
	}

	main();
})(settingsJSON, role, GM_getValue, GM_setValue, CONFIG);