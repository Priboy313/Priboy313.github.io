// ВАЖНО: Это содержимое файла plx.scr-manager_public.js на GitHub
(function() {
	'use strict';

	if (window.PLX_SETTINGS_SHOW_UI) return;

	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
	const SETTINGS_KEY = 'plx-cst-scr-settings';
	const MANIFEST_CACHE_KEY = 'plx-manifest-cache';
	const CACHE_DURATION_MS = 0.4 * 60 * 60 * 1000;

	function injectStyles() {
		if (document.getElementById('plx-modal-styles')) return;

		const css = `
			#plx-settings-modal, #plx-settings-modal * { 
				all: initial; 
				box-sizing: border-box; 
				font-family: Arial, sans-serif; 
				font-size: 14px; 
				color: #333; 
			}
			#plx-settings-modal { 
				position: fixed; top: 0; left: 0; 
				width: 100%; height: 100%; 
				background: rgba(0,0,0,0.6); 
				z-index: 2147483647; 
				display: flex; 
				align-items: center; 
				justify-content: center; 
			}
			#plx-settings-modal .plx-modal-content { 
				background: #f8f9fa; 
				padding: 20px; 
				width: 90%; 
				max-width: 600px; 
				max-height: 80vh; 
				display: flex; 
				flex-direction: column; 
				border-radius: 8px; 
				box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
			}
			#plx-settings-modal h2 { 
				font-size: 20px; 
				margin: 0 0 15px 0; 
				color: #212529; 
				font-weight: 600; 
			}
			#plx-settings-modal #plx-settings-form { 
				overflow-y: auto; 
				flex-grow: 1; 
				border-top: 1px solid #dee2e6; 
				border-bottom: 1px solid #dee2e6; 
				padding: 10px 4px; 
				margin-bottom: 15px; 
			}
			#plx-settings-modal fieldset { 
				border: 1px solid #ced4da; 
				border-radius: 4px; 
				padding: 10px 15px; 
				margin-bottom: 10px; 
			}
			#plx-settings-modal legend { 
				font-weight: bold; 
				padding: 0 5px; 
			}
			#plx-settings-modal .plx-form-row {
				margin-bottom: 12px;
			}
			#plx-settings-modal .plx-form-row--boolean label {
				display: flex;
				align-items: center;
				cursor: pointer;
			}
			#plx-settings-modal .plx-form-row--boolean input[type="checkbox"] {
				appearance: checkbox;
				width: 16px;
				height: 16px;
				margin-right: 10px;
			}
			#plx-settings-modal .plx-form-row--string {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			#plx-settings-modal .plx-form-row--string input[type="text"] {
				flex-grow: 1;
				max-width: 60%;
				padding: 6px 10px;
				border: 1px solid #ced4da;
				border-radius: 4px;
			}
			#plx-settings-modal .plx-modal-footer { 
				text-align: right; 
			}
			#plx-settings-modal button { 
				padding: 8px 16px; 
				margin-left: 10px; 
				cursor: pointer; 
				border-radius: 4px; 
				border: 1px solid transparent; 
				font-weight: 500; 
				transition: background-color 0.2s, border-color 0.2s; 
			}
			#plx-settings-modal #plx-save-btn { 
				background-color: #007bff; 
				color: white; 
				border-color: #007bff; 
			}
			#plx-settings-modal #plx-save-btn:hover { 
				background-color: #0056b3; 
				border-color: #0056b3; 
			}
			#plx-settings-modal #plx-close-btn { 
				background-color: #6c757d; 
				color: white; 
				border-color: #6c757d; 
			}
			#plx-settings-modal #plx-close-btn:hover { 
				background-color: #5a6268; 
			}
		`;
		const styleTag = document.createElement('style');
		styleTag.id = 'plx-modal-styles';
		styleTag.textContent = css;
		document.head.appendChild(styleTag);
	}

	function request(options) {
		return new Promise((resolve, reject) => {
			options.onload = resolve;
			options.onerror = reject;
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
			const manifestResponse = await request({
				method: 'GET',
				url: manifestUrl
			});
			const manifestData = JSON.parse(manifestResponse.responseText);

			GM_setValue(MANIFEST_CACHE_KEY, { data: manifestData, timestamp: Date.now() });
			return manifestData;
		} catch (e) {
			console.error("Manifest Error:", e);
			return cached ? cached.data : null;
		}
	}

	window.PLX_SETTINGS_SHOW_UI = async function() {
		if (document.getElementById('plx-settings-modal')) return;
		injectStyles();

		const modalShellHTML = `
		<div id="plx-settings-modal">
			<div class="plx-modal-content">
				<h2>Настройки Plex скриптов</h2>
				<form id="plx-settings-form"><p>Загрузка настроек...</p></form>
				<div class="plx-modal-footer">
					<button id="plx-close-btn">Закрыть</button>
					<button id="plx-save-btn">Сохранить</button>
				</div>
			</div>
		</div>`;
		document.body.insertAdjacentHTML('beforeend', modalShellHTML);

		const formElement = document.getElementById('plx-settings-form');
		const saveButton = document.getElementById('plx-save-btn');
		const closeButton = document.getElementById('plx-close-btn');

		saveButton.disabled = true;
		closeButton.onclick = () => document.getElementById('plx-settings-modal').remove();

		const registry = await getManifest();

		if (!registry) {
			formElement.innerHTML = '<p>Ошибка загрузки манифеста настроек.</p>';
			return;
		}

		const settings = GM_getValue(SETTINGS_KEY, {});
		let formHTML = '';
		for (const sId in registry) {
			formHTML += `<fieldset><legend>${registry[sId].name}</legend>`;
			for (const k in registry[sId].settings) {
				const settingInfo = registry[sId].settings[k];
				const savedValue = settings[sId]?.[k] ?? settingInfo.default;
				const inputId = `${sId}_${k}`;
				let rowContent = '';
				const rowClass = `plx-form-row plx-form-row--${settingInfo.type}`;

				switch (settingInfo.type) {
					case 'boolean': {
						const isChecked = savedValue ? 'checked' : '';
						rowContent = `<label for="${inputId}"><input type="checkbox" id="${inputId}" ${isChecked}>${settingInfo.label}</label>`;
						break;
					}
					case 'string':
					case 'text': {
						rowContent = `<label for="${inputId}">${settingInfo.label}<input type="text" id="${inputId}" value="${savedValue || ''}"></label>`;
						break;
					}
					case 'int': {
						rowContent = `<label for="${inputId}">${settingInfo.label}<input type="number" id="${inputId}" value="${savedValue || 0}"></label>`;
						break;
					}
					case 'list': {
						const listAsString = Array.isArray(savedValue) ? savedValue.join('\n') : (savedValue || '');
						rowContent = `
							<label for="${inputId}">${settingInfo.label}</label>
							<textarea id="${inputId}">${listAsString}</textarea>
						`;
						break;
					}
					default: {
						rowContent = `<label for="${inputId}">${settingInfo.label}</label><input type="text" id="${inputId}" value="${savedValue || ''}">`;
						break;
					}
				}
				formHTML += `<div class="${rowClass}">${rowContent}</div>`;
			}
			formHTML += `</fieldset>`;
		}

		formElement.innerHTML = formHTML || '<p>Нет доступных настроек.</p>';
		saveButton.disabled = false;

		saveButton.onclick = (e) => {
			e.preventDefault();
			const newSet = GM_getValue(SETTINGS_KEY, {});
			for (const sId in registry) {
				if (!newSet[sId]) newSet[sId] = {};
				for (const k in registry[sId].settings) {
					const el = document.getElementById(`${sId}_${k}`);
					if (el) {
						switch (settingType) {
							case 'boolean':
								newSet[sId][k] = el.checked;
								break;
							case 'int':
								newSet[sId][k] = parseInt(el.value, 10);
								break;
							case 'list':
								newSet[sId][k] = el.value.split('\n').map(item => item.trim()).filter(Boolean);
								break;
							case 'string':
							case 'text':
							default:
								newSet[sId][k] = el.value;
								break;
						}
					}
				}
			}
			GM_setValue(SETTINGS_KEY, newSet);
			document.getElementById('plx-settings-modal').remove();
		};
	};
})();