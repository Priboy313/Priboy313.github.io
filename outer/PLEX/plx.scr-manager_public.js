// ВАЖНО: Это содержимое файла plx.scr-manager_public.js на GitHub
(function(GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_addStyle, unsafeWindow) {
	'use strict';

	if (unsafeWindow.PLX_SETTINGS_SHOW_UI) return;

	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
	const SETTINGS_KEY = 'plx-cst-scr-settings';
	const MANIFEST_CACHE_KEY = 'plx-manifest-cache';
	const CACHE_DURATION_MS = 0.4 * 60 * 60 * 1000;

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

	unsafeWindow.PLX_SETTINGS_SHOW_UI = async function(role = 'user') {
		if (document.getElementById('plx-settings-modal')) return;
		injectStyles();

		console.log(`[Settings Worker] UI открыт с ролью: ${role}`);

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


		function generateSettingsHTML(settingsGroup, parentId, savedValues) {
			let groupHTML = '';
			for (const key in settingsGroup) {
				const settingInfo = settingsGroup[key];
				const isSettingAllowed = !settingInfo.role || (Array.isArray(settingInfo.role) && settingInfo.role.includes(role));
				if (!isSettingAllowed) continue;

				const currentId = `${parentId}_${key}`;
				const savedValue = savedValues?.[key] ?? settingInfo.default;
				let rowContent = '';
				const rowClass = `plx-form-row plx-form-row--${settingInfo.type}`;

				switch (settingInfo.type) {
					case 'boolean': {
						rowContent = `<label for="${currentId}">${settingInfo.label}<input type="checkbox" id="${currentId}" ${savedValue ? 'checked' : ''}></label>`;
						break;
                    }
                    case 'boolean-expand': {
                        const isChecked = (typeof savedValue === 'boolean') ? savedValue : settingInfo.default;
                        rowContent = `<label for="${currentId}">${settingInfo.label}<input type="checkbox" id="${currentId}" data-expands="group-for-${currentId}" ${isChecked ? 'checked' : ''}></label>`;
                        if (settingInfo.values) {
                            const childHTML = generateSettingsHTML(settingInfo.values, currentId, savedValues);
                            rowContent += `<div class="settings-group" id="group-for-${currentId}">${childHTML}</div>`;
                        }
                        break;
                    }
					case 'string':
					case 'text': {
						rowContent = `<label for="${currentId}">${settingInfo.label}<input type="text" id="${currentId}" value="${savedValue || ''}"></label>`;
						break;
                    }
					case 'int': {
						rowContent = `<label for="${currentId}">${settingInfo.label}<input type="number" id="${currentId}" value="${savedValue ?? 0}"></label>`;
						break;
                    }
					case 'list': {
						const listAsString = Array.isArray(savedValue) ? savedValue.join('\n') : (savedValue || '');
						rowContent = `<label for="${currentId}">${settingInfo.label}</label><textarea id="${currentId}">${listAsString}</textarea>`;
						break;
                    }
				}
				groupHTML += `<div class="${rowClass}">${rowContent}</div>`;
			}
			return groupHTML;
		}

		let formHTML = '';
		let scriptsShown = 0;

		for (const sId in registry) {
			const scriptInfo = registry[sId];

			const isScriptAllowed = !scriptInfo.role || (Array.isArray(scriptInfo.role) && scriptInfo.role.includes(role));
			
			if (!isScriptAllowed) {
				continue;
			}

			let scriptSettingsHTML = generateSettingsHTML(scriptInfo.settings, sId, settings[sId] || {});
			
			if (scriptSettingsHTML){
				scriptsShown++;
				formHTML += `<fieldset><legend>${scriptInfo.name}</legend>${scriptSettingsHTML}</fieldset>`;
			}
		}

		if (scriptsShown === 0) {
			formHTML = '<p>Нет доступных настроек.</p>';
		}

		formElement.innerHTML = formHTML;

		document.querySelectorAll('input[data-expands]').forEach(checkbox => {
			const groupElement = document.getElementById(checkbox.dataset.expands);
			if (!groupElement) return;
			const updateGroupState = () => { groupElement.classList.toggle('disabled', !checkbox.checked); };
			updateGroupState();
			checkbox.addEventListener('change', updateGroupState);
		});

		saveButton.disabled = false;

		saveButton.onclick = (e) => {
			e.preventDefault();

			function saveSettingsRecursively(settingsGroup, parentId) {
				const newSettings = {};
				for (const key in settingsGroup) {
					const settingInfo = settingsGroup[key];
                    const isSettingAllowed = !settingInfo.role || (Array.isArray(settingInfo.role) && settingInfo.role.includes(role));
                    if (!isSettingAllowed) continue;

					const currentId = `${parentId}_${key}`;
					const element = document.getElementById(currentId);
					
					if (element) {
						switch (settingInfo.type) {
							case 'boolean':
								newSettings[key] = element.checked;
								break;
                            case 'boolean-expand':
                                newSettings[key] = element.checked;
                                if (settingInfo.values) {
                                    Object.assign(newSettings, saveSettingsRecursively(settingInfo.values, currentId));
                                }
                                break;
							case 'int':
								newSettings[key] = parseInt(element.value, 10) || 0;
								break;
							case 'list':
								newSettings[key] = element.value.split('\n').map(item => item.trim()).filter(Boolean);
								break;
							case 'string':
							case 'text':
							default:
								newSettings[key] = element.value;
								break;
						}
					}
				}
				return newSettings;
			}

			const newSet = {};

			for (const sId in registry) {
				const scriptInfo = registry[sId];
				const isScriptAllowed = !scriptInfo.role || (Array.isArray(scriptInfo.role) && scriptInfo.role.includes(role));
				if (!isScriptAllowed) continue;
				
				newSet[sId] = saveSettingsRecursively(scriptInfo.settings, sId);
			}

			GM_setValue(SETTINGS_KEY, newSet);
			document.getElementById('plx-settings-modal').remove();
		};
	};

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
			.settings-group {
				padding-left: 20px;
				margin-top: 10px;
				border-left: 2px solid #e0e0e0;
				transition: opacity 0.3s;
			}
			.settings-group.disabled {
				opacity: 0.5;
				pointer-events: none;
			}
			#plx-settings-modal .plx-form-row--string label,
			#plx-settings-modal .plx-form-row--text label,
			#plx-settings-modal .plx-form-row--int label {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
			}
			#plx-settings-modal .plx-form-row--string input,
			#plx-settings-modal .plx-form-row--text input,
			#plx-settings-modal .plx-form-row--int input {
				flex-grow: 1;
				max-width: 60%;
			}
			#plx-settings-modal .plx-form-row--list {
				display: flex;
				flex-direction: column;
			}
			#plx-settings-modal .plx-form-row--list label {
				margin-bottom: 8px;
			}
			#plx-settings-modal .plx-form-row--list textarea {
				width: 100%;
				min-height: 80px;
				resize: vertical;
			}
		`;
		// const styleTag = document.createElement('style');
		// styleTag.id = 'plx-modal-styles';
		// styleTag.textContent = css;
		// document.head.appendChild(styleTag);
		GM_addStyle(css);
	};

})(GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_addStyle, unsafeWindow);