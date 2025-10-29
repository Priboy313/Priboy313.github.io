// ВАЖНО: Это содержимое файла plx.scr-manager_public.js на GitHub
(function() {
	'use strict';

	if (window.PLX_SETTINGS_SHOW_UI) {
		return;
	}

	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
	const SETTINGS_KEY = "plx-cst-scr-settings";
	const MANIFEST_CACHE_KEY = "plx-manifest-cache";
	const CACHE_DURATION_MS = 0.4 * 60 * 60 * 1000;

	function injectStyles() 
	{
		if (document.getElementById("plx-modal-styles")){
			return;
		} 

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
				display: flex;
				align-items: center;
				margin-bottom: 8px;
			}
			#plx-settings-modal label {
				display: flex;
				align-items: center;
				width: 100%;
				cursor: pointer;
			}
			#plx-settings-modal input[type="checkbox"] {
				margin-right: 10px;
			}
			#plx-settings-modal input[type="text"] {
				width: 100%;
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
			options.onload = resolve; options.onerror = reject;
			GM_xmlhttpRequest(options);
		});
	}

	async function getManifest() {
		const cached = GM_getValue(MANIFEST_CACHE_KEY, null);
		if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
		try {
			const cRes = await request({method:'GET', url: GITHUB_API_URL, headers:{"Accept":"application/vnd.github.v3+json"}});
			const hash = JSON.parse(cRes.responseText).sha;
			const mRes = await request({method:'GET', url: MANIFEST_URL_TEMPLATE.replace('{commit_hash}', hash)});
			const data = JSON.parse(mRes.responseText);
			GM_setValue(MANIFEST_CACHE_KEY, {data, timestamp: Date.now()});
			return data;
		} catch (e) {
			console.error("Manifest Error:", e);
			return cached ? cached.data : null;
		}
	}

	window.PLX_SETTINGS_SHOW_UI = async function() {
		if (document.getElementById('plx-settings-modal')) return;

		injectStyles();
		
		const registry = await getManifest();
		if (!registry) {
			alert('Ошибка загрузки манифеста настроек.');
			return;
		}

		const settings = GM_getValue(SETTINGS_KEY, {});
		let formHTML = '';
		for (const sId in registry) {
			formHTML += `<fieldset><legend>${registry[sId].name}</legend>`;
			for (const k in registry[sId].settings) {
				const sInf = registry[sId].settings[k];
				const val = settings[sId]?.[k] ?? sInf.default;
				let input = sInf.type === 'boolean'
					? `<input type="checkbox" id="${sId}_${k}" ${val ? 'checked' : ''}>`
					: `<input type="text" id="${sId}_${k}" value="${val || ''}">`;
				formHTML += `<div class="plx-form-row"><label for="${sId}_${k}">${sInf.label} ${input}</label></div>`;
			}
			formHTML += `</fieldset>`;
		}

		const modalHTML = `
		<div id="plx-settings-modal">
			<div class="plx-modal-content">
				<h2>Настройки скриптов</h2>
				<form id="plx-settings-form">${formHTML || 'Нет доступных настроек.'}</form>
				<div class="plx-modal-footer">
					<button id="plx-close-btn">Закрыть</button>
					<button id="plx-save-btn">Сохранить</button>
				</div>
			</div>
		</div>`;
		document.body.insertAdjacentHTML('beforeend', modalHTML);

		document.getElementById('plx-save-btn').onclick = (e) => {
			e.preventDefault();
			const newSet = GM_getValue(SETTINGS_KEY, {});
			for (const sId in registry) {
				if (!newSet[sId]) newSet[sId] = {};
				for (const k in registry[sId].settings) {
					const el = document.getElementById(`${sId}_${k}`);
					if (el) newSet[sId][k] = el.type === 'checkbox' ? el.checked : el.value;
				}
			}
			GM_setValue(SETTINGS_KEY, newSet);
			document.getElementById('plx-settings-modal').remove();
		};
		document.getElementById('plx-close-btn').onclick = (e) => {
			e.preventDefault();
			document.getElementById('plx-settings-modal').remove();
		};
	};
})();