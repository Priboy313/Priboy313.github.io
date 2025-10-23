// ==UserScript==
// @name         Plex Scripts Settings Manager
// @version      1.0
// @author       Priboy313
// @description  Централизованные настройки для всех кастомных скриптов
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      cdn.jsdelivr.net
// ==/UserScript==

(function() {
	'use strict';

	const MANIFEST_URL = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@latest/outer/PLEX/manifest.json";
    const SETTINGS_KEY = 'my_scripts_settings';

	async function showSettingsUI() {
		if (document.getElementById('my-settings-modal')) return;

		const registry = await fetchManifest();
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

		function fetchManifest() {
			return new Promise(resolve => {
				GM_xmlhttpRequest({
					method: 'GET',
					url: MANIFEST_URL,
					onload: function(response) {
						try {
							resolve(JSON.parse(response.responseText));
						} catch (e) {
							console.error("Ошибка парсинга манифеста:", e);
							resolve(null);
						}
					},
					onerror: function() {
						console.error("Ошибка загрузки манифеста.");
						resolve(null);
					}
				});
			});
		}
		
		if (formHTML === '') {
			formHTML = '<p>Пока не зарегистрировано ни одного скрипта. Зайдите на сайт, где работает один из ваших скриптов, чтобы он появился здесь.</p>';
		}

		const modalHTML = `
		<div id="my-settings-modal" style="position:fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 1px solid #ccc; padding: 20px; z-index: 99999; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
			<div class="modal-content">
				<h2>Настройки Скриптов</h2>
				<form id="my-settings-form" style="max-height: 70vh; overflow-y: auto; margin-bottom: 15px;">${formHTML}</form>
				<button id="my-settings-save">Сохранить</button>
				<button id="my-settings-close">Закрыть</button>
			</div>
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

			try {
				localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
			} catch (e) {
				console.error("== [SETTINGS MANAGER] Не удалось сохранить настройки в localStorage", e)
			}

			alert('Настройки сохранены!');
			document.getElementById('my-settings-modal').remove();
		});
		
		document.getElementById('my-settings-close').addEventListener('click', () => {
			document.getElementById('my-settings-modal').remove();
		});
	}

	GM_registerMenuCommand('Мои настройки скриптов', showSettingsUI);
})();