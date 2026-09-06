var ModuleClass = (function(NexusBehaviour) {

	return class NexusDashboard extends NexusBehaviour {

		defaults = {
			title: 'omniNexus'
		};

		awake() {
			document.documentElement.innerHTML = `<head><title>${this.CONFIG.workspace} Hub</title></head><body><div class="container" id="app"></div></body>`;
			
			this.addCSS(`
				* { box-sizing: border-box; }
				body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; padding: 40px 20px; display: flex; justify-content: center; }
				.container { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 32px; }
				
				header { border-bottom: 1px solid #1e293b; padding-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
				.brand-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #f8fafc; display: flex; align-items: center; gap: 10px; }
				.brand-title span { color: #38bdf8; }
				.brand-subtitle { font-size: 14px; color: #64748b; margin-top: 6px; }
				.meta-pill { font-family: monospace; font-size: 12px; background: #1e293b; border: 1px solid #334155; padding: 6px 12px; border-radius: 20px; color: #94a3b8; }

				.section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 16px 0; font-weight: 600; }
				.modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
				.module-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.15s; }
				.module-card:hover { border-color: #38bdf8; transform: translateY(-2px); }
				.module-card h3 { margin: 0 0 8px 0; font-size: 16px; color: #f8fafc; }
				.module-card p { margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.4; flex-grow: 1; }
				.module-btn { background: #334155; border: 1px solid #475569; color: #38bdf8; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; }
				.module-card:hover .module-btn { background: #0284c7; color: #fff; border-color: #0284c7; }

				details { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; font-size: 14px; }
				summary { cursor: pointer; color: #94a3b8; font-weight: 600; user-select: none; }
				textarea { width: 100%; height: 160px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 10px; margin-top: 12px; font-family: monospace; font-size: 12px; }
				
				.btn-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
				.action-btn { background: #334155; border: 1px solid #475569; color: #f8fafc; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.15s; }
				.action-btn:hover { background: #475569; }
				.action-btn.primary { background: #0284c7; border-color: #0284c7; color: white; }
				.action-btn.primary:hover { background: #0369a1; }
				.action-btn.success { background: #10b981; border-color: #10b981; color: white; }
				.action-btn.success:hover { background: #059669; }
			`);
		}

		start() {
			this.render();
		}

		render() {
			const app = document.getElementById('app');
			
			const routerData = this.loadGlobal('router', { routes: [] });
			const hashRaw = this.loadGlobal('commit_hash', 'main');
			const hash = (typeof hashRaw === 'object' && hashRaw !== null) ? (hashRaw.hash || 'main') : String(hashRaw || 'main');
			const globalSettings = this.loadGlobal('settings', {});

			const routes = routerData.routes || [];
			let modulesHTML = '';

			if (routes.length === 0) {
				modulesHTML = '<div style="color:#64748b;font-size:14px;">Нет зарегистрированных модулей в этом спейсе.</div>';
			} else {
				routes.forEach(m => {
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
						<h1 class="brand-title">⚡ ${this.config.title} <span>// ${this.workspace}</span></h1>
						<div class="brand-subtitle">Environment Hub & Launcher</div>
					</div>
					<div class="meta-pill">${this.CONFIG.provider.toUpperCase()} : ${hash.substring(0, 7)}</div>
				</header>

				<div>
					<div class="section-title">Доступные модули</div>
					<div class="modules-grid">
						${modulesHTML}
					</div>
				</div>

				<!-- Блок бэкапа и переноса данных -->
				<details>
					<summary>📦 Резервное копирование (${this.workspace})</summary>
					<p style="color:#94a3b8;font-size:13px;margin:8px 0 0 0;">
						Скопируйте текст ниже, чтобы сохранить бэкап, либо вставьте текст сюда для восстановления.
					</p>
					
					<textarea id="backup-text" placeholder="Нажмите «Экспорт в текст» или вставьте сюда текст бэкапа..."></textarea>
					
					<div class="btn-row">
						<button class="action-btn primary" id="btn-export-text">Сформировать экспорт</button>
						<button class="action-btn" id="btn-copy-text">Скопировать в буфер</button>
						<button class="action-btn success" id="btn-import-text">Применить из поля выше</button>
						<button class="action-btn" id="btn-export-file">Скачать файл .json</button>
						<button class="action-btn" id="btn-import-file">Загрузить файл .json</button>
						<input type="file" id="file-input" accept=".json" style="display:none;" />
					</div>
				</details>

				<!-- Блок конфигурации модулей -->
				<details>
					<summary>⚙️ Конфигурация спейса (${this.workspace})</summary>
					<textarea id="settings-area">${JSON.stringify(globalSettings, null, 2)}</textarea>
					<div class="btn-row">
						<button class="action-btn primary" id="save-settings-btn">Сохранить</button>
					</div>
				</details>
			`;

			this.initBackupHandlers();

			document.getElementById('save-settings-btn').onclick = () => {
				try {
					const val = JSON.parse(document.getElementById('settings-area').value);
					this.saveGlobal('settings', val);
					alert('Конфигурация сохранена');
				} catch (e) {
					alert('Ошибка валидации JSON');
				}
			};
		}

		// Логика сбора всех данных спейса
		getAllWorkspaceData() {
			const prefix = `nexus_${this.workspace}_`;
			let keys = [];

			if (typeof this._GM_list === 'function') {
				keys = this._GM_list().filter(k => k.startsWith(prefix)).map(k => k.replace(prefix, ''));
			} else {
				// Фоллбэк на базовые модули, если GM_listValues не доступен
				keys = ['trello', 'todo', 'settings', 'router'];
			}

			const payload = {
				__meta: {
					workspace: this.workspace,
					timestamp: Date.now(),
					exportedAt: new Date().toLocaleString()
				},
				data: {}
			};

			keys.forEach(k => {
				const val = this.loadGlobal(k, null);
				if (val !== null) {
					payload.data[k] = val;
				}
			});

			return payload;
		}

		applyWorkspaceData(payload) {
			const data = payload.data || payload;
			let count = 0;

			for (const key in data) {
				if (key === '__meta') continue;
				this.saveGlobal(key, data[key]);
				count++;
			}

			alert(`Успешно восстановлено разделов: ${count}. Страница будет перезагружена.`);
			window.location.reload();
		}

		initBackupHandlers() {
			const area = document.getElementById('backup-text');
			const fileInput = document.getElementById('file-input');

			// 1. Сформировать экспорт в текст
			document.getElementById('btn-export-text').onclick = () => {
				const data = this.getAllWorkspaceData();
				area.value = JSON.stringify(data, null, 2);
			};

			// 2. Скопировать в буфер
			document.getElementById('btn-copy-text').onclick = () => {
				if (!area.value.trim()) {
					const data = this.getAllWorkspaceData();
					area.value = JSON.stringify(data, null, 2);
				}
				navigator.clipboard.writeText(area.value).then(() => {
					alert('Текст бэкапа скопирован в буфер обмена!');
				});
			};

			// 3. Применить из текста
			document.getElementById('btn-import-text').onclick = () => {
				const raw = area.value.trim();
				if (!raw) return alert('Поле ввода пустое!');

				try {
					const parsed = JSON.parse(raw);
					if (!confirm('Применить бэкап? Текущие данные в спейсе будут заменены.')) return;
					this.applyWorkspaceData(parsed);
				} catch (e) {
					alert('Ошибка парсинга: в поле вставлен некорректный JSON!');
				}
			};

			// 4. Скачать файл
			document.getElementById('btn-export-file').onclick = () => {
				const data = this.getAllWorkspaceData();
				const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `nexus_backup_${this.workspace}_${Date.now()}.json`;
				a.click();
				URL.revokeObjectURL(url);
			};

			// 5. Загрузить из файла
			document.getElementById('btn-import-file').onclick = () => fileInput.click();

			fileInput.onchange = (e) => {
				const file = e.target.files[0];
				if (!file) return;

				const reader = new FileReader();
				reader.onload = (ev) => {
					try {
						const parsed = JSON.parse(ev.target.result);
						if (!confirm('Загрузить данные из файла?')) return;
						this.applyWorkspaceData(parsed);
					} catch (err) {
						alert('Ошибка чтения файла: неверный формат JSON.');
					}
				};
				reader.readAsText(file);
			};
		}
	};

})(NexusBehaviour);