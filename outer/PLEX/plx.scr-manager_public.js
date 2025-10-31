// ВАЖНО: Это содержимое файла plx.scr-manager_public.js на GitHub
(function(GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_addStyle, unsafeWindow) {
	'use strict';

	if (unsafeWindow.PLX_SETTINGS_SHOW_UI) return;

	const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
	const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
	const SETTINGS_KEY = 'plx-cst-scr-settings';
	const MANIFEST_CACHE_KEY = 'plx-manifest-cache';
	const CACHE_DURATION_MS = 5 * 60 * 1000;

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
				<h2>Настройки скриптов</h2>
				<form id="plx-settings-form"><p>Загрузка настроек...</p></form>
				<div class="plx-modal-footer">
					<button id="plx-export-btn">Экспорт</button>
					<button id="plx-import-btn">Импорт</button>
					<button id="plx-set-default-btn">Сбросить</button>
					<button id="plx-close-btn">Закрыть</button>
					<button id="plx-save-btn">Сохранить</button>
				</div>
			</div>
		</div>`;
		document.body.insertAdjacentHTML('beforeend', modalShellHTML);

		const formElement = document.getElementById('plx-settings-form');
		const saveButton = document.getElementById('plx-save-btn');
		const closeButton = document.getElementById('plx-close-btn');
		const exportButton = document.getElementById('plx-export-btn');
		const importButton = document.getElementById('plx-import-btn');
		const resetButton  = document.getElementById('plx-set-default-btn');

		saveButton.disabled = true;

		function cleanSettingsData(raw) {
			const cleanCopy = JSON.parse(JSON.stringify(raw));

			delete cleanCopy[MANIFEST_CACHE_KEY];
			delete cleanCopy.__timestamp;
			delete cleanCopy.__meta;
			delete cleanCopy.cache;
			delete cleanCopy.temp;
			delete cleanCopy.debug;

			for (const key in cleanCopy) {
				if (key.startsWith('_') || key.startsWith('plx-temp-')) {
					delete cleanCopy[key];
				}
			}

			return cleanCopy;
		}

		closeButton.onclick = () => document.getElementById('plx-settings-modal').remove();
		exportButton.onclick = () => {
			const stored = GM_getValue(SETTINGS_KEY, {});
			const clean = cleanSettingsData(stored);

			const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'plx_settings_export.json';
			a.click();

			URL.revokeObjectURL(url);
			console.log('[PLX] Настройки экспортированы/');
		};

		importButton.onclick = () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json,application/json';
			input.onchange = e => {
				const file = e.target.files[0];
				if (!file) return;

				const reader = new FileReader();
				reader.onload = event => {
					try {
						const imported = JSON.parse(event.target.result);
						GM_setValue(SETTINGS_KEY, imported);
						alert('Настройки успешно импортированы. Перезагрузите страницу.');
						document.getElementById('plx-settings-modal').remove();
					} catch (err) {
						alert('Ошибка импорта: неверный формат файла.');
						console.error(err);
					}
				};
				reader.readAsText(file);
			};
			input.click();
		};

		resetButton.onclick = () => {
			if (!confirm('Сбросить все настройки к значениям по умолчанию?')) return;
			GM_setValue(SETTINGS_KEY, {});
			alert('Настройки сброшены. Перезагрузите страницу.');
			document.getElementById('plx-settings-modal').remove();
		};

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
					case 'text': {
						rowContent = `<label for="${currentId}">${settingInfo.label}<input type="text" id="${currentId}" value="${savedValue || ''}"></label>`;
						break;
                    }
					case 'int': {
						rowContent = `<label for="${currentId}"><div class="int-input-label">${settingInfo.label}</div><input type="number" id="${currentId}" value="${savedValue ?? 0}"></label>`;
						break;
                    }
					case 'list': {
						const listAsString = Array.isArray(savedValue) ? savedValue.join('\n') : (savedValue || '');
						rowContent = `<label for="${currentId}">${settingInfo.label}</label><textarea id="${currentId}">${listAsString}</textarea>`;
						break;
                    }
					case 'label':
						rowContent = `<div class="plx-form-label">${settingInfo.label}</div>`;
						break;
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

		const  css = `
			#plx-settings-modal {
				all: unset;
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0,0,0,0.6);
				z-index: 2147483647;
				display: flex;
				align-items: center;
				justify-content: center;
				font-family: Arial, sans-serif;
				color: #333;
				font-size: 14px;
				box-sizing: border-box;
			}
			#plx-settings-modal * {
				box-sizing: border-box;
				font-family: inherit;
				color: inherit;
				font-size: inherit;
				line-height: 1.4;
			}
			#plx-settings-modal .plx-modal-content {
				background: #fff;
				padding: 0 10px 10px 10px;
				width: 90%;
				max-width: 600px;
				max-height: 80vh;
				display: flex;
				flex-direction: column;
				border-radius: 8px;
				box-shadow: 0 5px 15px rgba(0,0,0,0.3);
				overflow: hidden;
			}
			#plx-settings-modal h2 {
				font-size: 20px;
				margin: 0px 0 5px 0;
				color: #212529;
				font-weight: 600;
			}
			#plx-settings-modal #plx-settings-form {
				overflow-y: auto;
				flex-grow: 1;
				border-top: 1px solid #dee2e6;
				border-bottom: 1px solid #dee2e6;
				padding: 10px 10px 10px 5px;
			}
			#plx-settings-modal fieldset {
				border: 1px solid #ced4da;
				border-radius: 6px;
				padding: 10px 15px;
				margin-bottom: 10px;
			}
			#plx-settings-modal legend {
				font-weight: bold;
				padding: 0 5px 0 0;
			}
			#plx-settings-modal .plx-form-row {
				margin-bottom: 12px;
			}
			#plx-settings-modal .plx-form-row label {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
			}
			#plx-settings-modal input[type="checkbox"],
			#plx-settings-modal input[type="radio"] {
				accent-color: #007bff;
				transform: scale(1.1);
				cursor: pointer;
			}
			#plx-settings-modal input[type="text"],
			#plx-settings-modal input[type="number"],
			#plx-settings-modal textarea {
				flex-grow: 1;
				padding: 6px 10px;
				border: 1px solid #ced4da;
				border-radius: 4px;
				background: #fff;
				outline: none;
				transition: border-color 0.2s, box-shadow 0.2s;
			}
			#plx-settings-modal input[type="number"]{
				max-width: 100px;
			}
			#plx-settings-modal .int-input-label {
				min-width: 150px;
			}
			#plx-settings-modal input:focus,
			#plx-settings-modal textarea:focus {
				border-color: #80bdff;
				box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
			}
			#plx-settings-modal textarea {
				width: 100%;
				min-height: 80px;
				resize: vertical;
			}
			#plx-settings-modal .plx-modal-footer {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin-top: 10px;
			}
			#plx-settings-modal button {
				padding: 8px 16px;
				cursor: pointer;
				border-radius: 4px;
				border: 1px solid transparent;
				font-weight: 500;
				transition: background-color 0.2s, border-color 0.2s;
			}
			#plx-settings-modal #plx-save-btn {
				background-color: #007bff;
				color: #fff;
				border-color: #007bff;
			}
			#plx-settings-modal #plx-save-btn:hover {
				background-color: #0056b3;
				border-color: #0056b3;
			}
			#plx-settings-modal #plx-close-btn {
				background-color: #6c757d;
				color: #fff;
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
			#plx-settings-modal .plx-form-label {
				font-weight: 500;
				padding: 0px 10px;
				color: #212529;
				display: inline-block;
			}

			#plx-settings-modal .plx-modal-footer {
				display: flex;
				justify-content: flex-end;
				flex-wrap: wrap;
				gap: 10px;
				margin-top: 10px;
			}
			#plx-settings-modal #plx-export-btn,
			#plx-settings-modal #plx-import-btn,
			#plx-settings-modal #plx-set-default-btn {
				background-color: #f8f9fa;
				color: #212529;
				border: 1px solid #ced4da;
			}
			#plx-settings-modal #plx-export-btn:hover,
			#plx-settings-modal #plx-import-btn:hover,
			#plx-settings-modal #plx-set-default-btn:hover {
				background-color: #e2e6ea;
			}
		`;
		GM_addStyle(css);
	};

})(GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_addStyle, unsafeWindow);