// plx.scr-manager_public.js
(function() {
	'use strict';

	if (window.plxScriptManagerInitialized) return;
	window.plxScriptManagerInitialized = true;

	const SCRIPT_NAME = "ScrMng_Worker";
	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
	
	const SETTINGS_KEY = 'plx-cst-scr-settings';
	const MANIFEST_CACHE_KEY = 'plx-manifest-cache';
	const CACHE_DURATION_MS = 0.4 * 60 * 60 * 1000;

	function request(options) {
		return new Promise((resolve, reject) => {
			options.onload = res => resolve(res);
			options.onerror = err => reject(err);
			GM_xmlhttpRequest(options);
		});
	}
	
	async function getManifest() {
		const cached = GM_getValue(MANIFEST_CACHE_KEY, null);
		if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
			return cached.data;
		}

		try {
			const commitResponse = await request({
				method: 'GET',
				url: GITHUB_API_URL,
				headers: { "Accept": "application/vnd.github.v3+json" }
			});
			const commitHash = JSON.parse(commitResponse.responseText).sha;
			
			const manifestUrl = MANIFEST_URL_TEMPLATE.replace('{commit_hash}', commitHash);
			const manifestResponse = await request({ method: 'GET', url: manifestUrl });
			const manifestData = JSON.parse(manifestResponse.responseText);

			GM_setValue(MANIFEST_CACHE_KEY, { data: manifestData, timestamp: Date.now() });
			return manifestData;
		} catch (e) {
			console.error(`[${SCRIPT_NAME}] Не удалось загрузить манифест.`, e);
			return cached ? cached.data : null;
		}
	}

	async function showSettingsUI() {
		if (document.getElementById('my-settings-modal')) return;

		const registry = await getManifest();
		if (!registry) {
			alert('Ошибка: не удалось загрузить реестр настроек.');
			return;
		}

		const settings = GM_getValue(SETTINGS_KEY, {});
		let formHTML = '';

		for (const scriptId in registry) {
			const scriptInfo = registry[scriptId];
			formHTML += `<fieldset><legend>${scriptInfo.name}</legend>`;
			for (const settingKey in scriptInfo.settings) {
				const settingInfo = scriptInfo.settings[settingKey];
				const savedValue = settings[scriptId]?.[settingKey] ?? settingInfo.default;
				let inputHTML = '';
				switch (settingInfo.type) {
					case 'boolean':
						inputHTML = `<input type="checkbox" name="${scriptId}_${settingKey}" ${savedValue ? 'checked' : ''}>`;
						break;
					case 'string':
						inputHTML = `<input type="text" name="${scriptId}_${settingKey}" value="${savedValue}">`;
						break;
				}
				formHTML += `<label>${inputHTML} ${settingInfo.label}</label><br>`;
			}
			formHTML += `</fieldset>`;
		}

		if (formHTML === '') {
			formHTML = '<p>Пока не зарегистрировано ни одного скрипта.</p>';
		}

		const modalHTML = `
			<div id="my-settings-modal" style="position:fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 1px solid #ccc; padding: 20px; z-index: 99999; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
				<h2>Настройки Скриптов</h2>
				<form id="my-settings-form" style="max-height: 70vh; overflow-y: auto; margin-bottom: 15px;">${formHTML}</form>
				<button id="my-settings-save">Сохранить</button>
				<button id="my-settings-close">Закрыть</button>
			</div>`;
		
		document.body.insertAdjacentHTML('beforeend', modalHTML);

		document.getElementById('my-settings-save').addEventListener('click', () => {
			const form = document.getElementById('my-settings-form');
			const newSettings = GM_getValue(SETTINGS_KEY, {});
			
			for (const scriptId in registry) {
				if (!newSettings[scriptId]) newSettings[scriptId] = {};
				for (const settingKey in registry[scriptId].settings) {
					const input = form.elements[`${scriptId}_${settingKey}`];
					if (input) {
						newSettings[scriptId][settingKey] = input.type === 'checkbox' ? input.checked : input.value;
					}
				}
			}
			GM_setValue(SETTINGS_KEY, newSettings);
			alert('Настройки сохранены!');
			document.getElementById('my-settings-modal').remove();
		});
		
		document.getElementById('my-settings-close').addEventListener('click', () => {
			document.getElementById('my-settings-modal').remove();
		});
	}

	GM_registerMenuCommand('Мои настройки скриптов', showSettingsUI);
	console.log(`[${SCRIPT_NAME}] Инициализирован. Команда меню зарегистрирована.`);
})();