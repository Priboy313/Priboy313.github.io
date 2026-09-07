var ModuleClass = (function(NexusBehaviour) {

	return class OmniWord extends NexusBehaviour {

		defaults = {
			defaultData: {
				activeId: 'doc_1',
				isTemplatesOpen: true,
				isMonospace: false,
				files: [
					{
						id: 'doc_1',
						name: 'Черновик',
						content: 'Добро пожаловать в omniWord.\n\nЗдесь можно быстро сохранять куски кода, логи с телевизора, составлять описания багов или черновики писем.\nВсе изменения сохраняются на лету в изолированное хранилище.',
						updatedAt: Date.now()
					}
				],
				templates: [
					{
						id: 'tpl_1',
						name: 'Шаблон баг-репорта',
						content: '### [BUG] Краткое описание проблемы\n\n**Окружение:**\n- Модель ТВ: \n- Версия webOS: \n- Приложение / Сервис: \n\n**Шаги воспроизведения:**\n1. Открыть приложение...\n2. Выбрать раздел...\n3. Нажать на...\n\n**Фактический результат:**\n\n**Ожидаемый результат:**\n\n**Логи / Примечания:**\n'
					},
					{
						id: 'tpl_2',
						name: 'Итоги дня / Daily',
						content: '### Итоги работы за день\n\n**Что протестировано / сделано:**\n- \n- \n\n**Обнаруженные проблемы / Блокеры:**\n- \n\n**Планы на завтра:**\n- '
					}
				]
			}
		};

		awake() {
			const hubUrl = `https://${this.CONFIG.dashboardHost}${this.CONFIG.dashboardPath}`;

			document.documentElement.innerHTML = `
				<head><title>omniWord // ${this.workspace}</title></head>
				<body>
					<header>
						<div class="header-left">
							<a href="${hubUrl}" class="back-link">← В Хаб</a>
							<span class="header-title">📄 omniWord Studio</span>
						</div>
					</header>
					<div class="app-layout">
						<!-- Сайдбар Проводника -->
						<div class="explorer-pane">
							<!-- Верхняя секция: Документы -->
							<div class="explorer-section files-section">
								<div class="section-header">
									<span class="section-title">Документы</span>
									<button class="icon-action-btn" id="btn-new-file" title="Создать документ">+ Документ</button>
								</div>
								<div class="file-list" id="explorer-files"></div>
							</div>

							<!-- Нижняя секция: Шаблоны -->
							<div class="explorer-section templates-section" id="templates-accordion">
								<div class="section-header accordion-toggle" id="toggle-templates">
									<div class="accordion-title-wrap">
										<span class="chevron" id="templates-chevron">⌄</span>
										<span class="section-title">Шаблоны</span>
										<span class="accordion-count" id="templates-count">0</span>
									</div>
									<button class="icon-action-btn" id="btn-new-tpl" title="Создать шаблон">+ Шаблон</button>
								</div>
								<div class="file-list" id="explorer-templates"></div>
							</div>
						</div>

						<!-- Правая панель: Редактор -->
						<div class="content-pane" id="editor-pane"></div>
					</div>
				</body>`;

			this.addCSS(`
				* { box-sizing: border-box; }
				body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; user-select: none; }
				
				/* Шапка */
				header { height: 52px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
				.header-left { display: flex; align-items: center; gap: 14px; }
				.back-link { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 4px; background: #334155; display: flex; align-items: center; gap: 6px; }
				.back-link:hover { color: #f8fafc; background: #475569; }
				.header-title { font-weight: 700; font-size: 15px; color: #38bdf8; }

				/* Каркас */
				.app-layout { flex-grow: 1; display: flex; overflow: hidden; }

				/* Сайдбар */
				.explorer-pane { width: 290px; min-width: 290px; background: #111827; border-right: 1px solid #1f2937; display: flex; flex-direction: column; }
				.explorer-section { display: flex; flex-direction: column; }
				.files-section { flex-grow: 1; overflow: hidden; }
				.templates-section { flex-shrink: 0; border-top: 1px solid #1f2937; background: #0d131f; }
				.templates-section.collapsed #explorer-templates { display: none; }

				.section-header { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; height: 38px; }
				.accordion-toggle { cursor: pointer; user-select: none; }
				.accordion-toggle:hover { background: #172033; }
				.accordion-title-wrap { display: flex; align-items: center; gap: 8px; }
				.chevron { font-size: 14px; color: #9ca3af; font-family: monospace; font-weight: bold; width: 12px; display: inline-block; transition: transform 0.15s; }
				.templates-section.collapsed .chevron { transform: rotate(-90deg); }
				.section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; }
				.accordion-count { font-size: 11px; color: #64748b; font-family: monospace; }
				
				.icon-action-btn { background: #1f2937; border: 1px solid #374151; color: #38bdf8; padding: 2px 7px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; }
				.icon-action-btn:hover { background: #374151; color: #fff; }

				.file-list { overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 3px; max-height: calc(100vh - 200px); }
				.templates-section .file-list { max-height: 240px; }

				.file-item { display: flex; align-items: center; justify-content: space-between; padding: 7px 9px; border-radius: 5px; cursor: pointer; font-size: 13px; color: #d1d5db; transition: background 0.1s; }
				.file-item:hover { background: #1f2937; color: #fff; }
				.file-item.active { background: #0284c7; color: #fff; }
				.file-name-wrapper { display: flex; align-items: center; gap: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; margin-right: 6px; }
				
				.file-actions { display: flex; gap: 2px; opacity: 0; }
				.file-item:hover .file-actions { opacity: 1; }
				.file-btn { background: transparent; border: none; color: #9ca3af; cursor: pointer; padding: 2px 5px; border-radius: 3px; font-size: 11px; }
				.file-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
				.file-btn.make-file { color: #38bdf8; font-weight: bold; }
				.file-btn.make-file:hover { background: rgba(56, 189, 248, 0.2); color: #fff; }
				.file-btn.del:hover { background: rgba(239,68,68,0.3); color: #ef4444; }

				/* Панель редактора */
				.content-pane { flex-grow: 1; display: flex; flex-direction: column; background: #0f172a; padding: 24px 32px; overflow: hidden; user-select: text; }
				
				/* Шапка редактора */
				.doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
				.doc-title-wrap { display: flex; align-items: center; gap: 10px; }
				.doc-title { font-size: 20px; font-weight: 700; color: #f8fafc; margin: 0; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.doc-title:hover { color: #38bdf8; }
				.tpl-badge { font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

				/* Тулбар операций */
				.doc-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; gap: 8px; flex-wrap: wrap; }
				.toolbar-btns { display: flex; gap: 6px; align-items: center; }
				.tool-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
				.tool-btn:hover { background: #334155; color: #f8fafc; }
				.tool-btn.active { background: #0284c7; border-color: #38bdf8; color: white; }
				.tool-btn.primary-tpl { background: #0284c7; border-color: #0284c7; color: #fff; }
				.tool-btn.primary-tpl:hover { background: #0369a1; }
				.tool-btn.btn-copied { background: #10b981 !important; border-color: #10b981 !important; color: white !important; }

				.doc-stats { font-size: 12px; color: #64748b; font-family: monospace; display: flex; gap: 10px; }

				/* Область текста */
				.editor-wrapper { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
				.doc-textarea { width: 100%; flex-grow: 1; background: #111827; border: 1px solid #334155; border-radius: 6px; padding: 18px 20px; color: #f8fafc; font-size: 14px; line-height: 1.6; outline: none; resize: none; tab-size: 4; }
				.doc-textarea:focus { border-color: #38bdf8; }
				.doc-textarea.monospace { font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; }

				/* Пустой экран */
				.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70vh; text-align: center; gap: 16px; color: #64748b; }
				.empty-icon { font-size: 48px; }
				.empty-title { font-size: 20px; font-weight: 700; color: #94a3b8; margin: 0; }
				.empty-desc { font-size: 14px; max-width: 340px; line-height: 1.5; margin: 0; }
				.empty-btns { display: flex; gap: 10px; }
				.empty-btn { background: #0284c7; border: none; color: white; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
				.empty-btn:hover { background: #0369a1; }
				.empty-btn.secondary { background: #1e293b; border: 1px solid #334155; color: #94a3b8; }
				.empty-btn.secondary:hover { background: #334155; color: #fff; }
			`);
		}

		start() {
			this.appData = this.loadGlobal('word', this.config.defaultData);

			if (!this.appData.files) this.appData.files = [];
			if (!this.appData.templates) this.appData.templates = [];
			if (this.appData.isTemplatesOpen === undefined) this.appData.isTemplatesOpen = true;
			if (this.appData.isMonospace === undefined) this.appData.isMonospace = false;
			if (!this.appData.activeId && this.appData.files.length > 0) {
				this.appData.activeId = this.appData.files[0].id;
			}

			this.initSidebarEvents();
			this.render();
		}

		initSidebarEvents() {
			document.getElementById('btn-new-file').onclick = () => this.createNewFile();
			document.getElementById('btn-new-tpl').onclick = (e) => {
				e.stopPropagation();
				this.createNewTemplate();
			};

			const accordionHeader = document.getElementById('toggle-templates');
			accordionHeader.onclick = (e) => {
				if (e.target.closest('#btn-new-tpl')) return;
				this.appData.isTemplatesOpen = !this.appData.isTemplatesOpen;
				this.persist();
				this.updateAccordionVisual();
			};
		}

		updateAccordionVisual() {
			const section = document.getElementById('templates-accordion');
			section.classList.toggle('collapsed', !this.appData.isTemplatesOpen);
		}

		getActiveObject() {
			const id = this.appData.activeId;
			if (!id) return null;

			const file = this.appData.files.find(f => f.id === id);
			if (file) return { data: file, isTemplate: false };

			const tpl = this.appData.templates.find(t => t.id === id);
			if (tpl) return { data: tpl, isTemplate: true };

			return null;
		}

		render() {
			this.renderExplorer();
			this.renderContent();
			this.updateAccordionVisual();
		}

		renderExplorer() {
			const filesEl = document.getElementById('explorer-files');
			filesEl.innerHTML = '';

			this.appData.files.forEach(file => {
				const item = document.createElement('div');
				item.className = `file-item ${file.id === this.appData.activeId ? 'active' : ''}`;

				item.innerHTML = `
					<div class="file-name-wrapper" title="${file.name}">
						<span>📝</span>
						<span style="overflow:hidden;text-overflow:ellipsis;">${file.name}</span>
					</div>
					<div class="file-actions">
						<button class="file-btn edit" title="Переименовать">✏️</button>
						<button class="file-btn del" title="Удалить">✕</button>
					</div>
				`;

				item.onclick = (e) => {
					if (e.target.closest('.file-actions')) return;
					this.appData.activeId = file.id;
					this.persist();
					this.render();
				};

				item.querySelector('.file-btn.edit').onclick = (e) => {
					e.stopPropagation();
					this.renameItem(file);
				};

				item.querySelector('.file-btn.del').onclick = (e) => {
					e.stopPropagation();
					this.deleteItem(file.id, false);
				};

				filesEl.appendChild(item);
			});

			const tplEl = document.getElementById('explorer-templates');
			const tplCount = document.getElementById('templates-count');
			tplCount.textContent = this.appData.templates.length;
			tplEl.innerHTML = '';

			this.appData.templates.forEach(tpl => {
				const item = document.createElement('div');
				item.className = `file-item ${tpl.id === this.appData.activeId ? 'active' : ''}`;

				item.innerHTML = `
					<div class="file-name-wrapper" title="${tpl.name}">
						<span>📑</span>
						<span style="overflow:hidden;text-overflow:ellipsis;">${tpl.name}</span>
					</div>
					<div class="file-actions">
						<button class="file-btn make-file" title="Создать документ по шаблону">⚡</button>
						<button class="file-btn edit" title="Переименовать">✏️</button>
						<button class="file-btn del" title="Удалить">✕</button>
					</div>
				`;

				item.onclick = (e) => {
					if (e.target.closest('.file-actions')) return;
					this.appData.activeId = tpl.id;
					this.persist();
					this.render();
				};

				item.querySelector('.file-btn.make-file').onclick = (e) => {
					e.stopPropagation();
					this.instantiateTemplate(tpl);
				};

				item.querySelector('.file-btn.edit').onclick = (e) => {
					e.stopPropagation();
					this.renameItem(tpl);
				};

				item.querySelector('.file-btn.del').onclick = (e) => {
					e.stopPropagation();
					this.deleteItem(tpl.id, true);
				};

				tplEl.appendChild(item);
			});
		}

		renderContent() {
			const pane = document.getElementById('editor-pane');
			const activeObj = this.getActiveObject();

			if (!activeObj) {
				pane.innerHTML = `
					<div class="empty-state">
						<div class="empty-icon">📂</div>
						<h3 class="empty-title">Нет открытых документов</h3>
						<p class="empty-desc">Выберите документ или шаблон в проводнике слева, либо создайте новый.</p>
						<div class="empty-btns">
							<button class="empty-btn" id="empty-create-file">+ Создать документ</button>
							<button class="empty-btn secondary" id="empty-create-tpl">+ Новый шаблон</button>
						</div>
					</div>
				`;
				document.getElementById('empty-create-file').onclick = () => this.createNewFile();
				document.getElementById('empty-create-tpl').onclick = () => this.createNewTemplate();
				return;
			}

			const active = activeObj.data;
			const isTemplate = activeObj.isTemplate;
			const text = active.content || '';

			pane.innerHTML = `
				<div class="doc-header">
					<div class="doc-title-wrap">
						<h2 class="doc-title" id="doc-title" title="Кликните для переименования">
							<span>${isTemplate ? '📑' : '📝'} ${active.name}</span>
							<span style="font-size:14px;color:#64748b;">✏️</span>
						</h2>
						${isTemplate ? '<span class="tpl-badge">Шаблон</span>' : ''}
					</div>

					<div class="doc-stats" id="doc-stats">
						<span>Слов: 0</span>
						<span>Символов: 0</span>
						<span>Строк: 0</span>
					</div>
				</div>

				<div class="doc-toolbar">
					<div class="toolbar-btns">
						${isTemplate ? `<button class="tool-btn primary-tpl" id="btn-use-tpl">⚡ Создать документ по шаблону</button>` : ''}
						<button class="tool-btn" id="btn-copy-all">Копировать всё</button>
						<button class="tool-btn" id="btn-download">Скачать .txt</button>
						<button class="tool-btn ${this.appData.isMonospace ? 'active' : ''}" id="btn-toggle-font">&lt;/&gt; Моноширинный</button>
						<button class="tool-btn" id="btn-duplicate">Копия</button>
					</div>
				</div>

				<div class="editor-wrapper">
					<textarea class="doc-textarea ${this.appData.isMonospace ? 'monospace' : ''}" id="doc-editor" placeholder="Начните вводить текст...">${text}</textarea>
				</div>
			`;

			const textarea = document.getElementById('doc-editor');
			this.updateStats(text);

			// Переименование
			document.getElementById('doc-title').onclick = () => this.renameItem(active);

			if (isTemplate) {
				document.getElementById('btn-use-tpl').onclick = () => this.instantiateTemplate(active);
			}

			// Автосохранение при вводе
			textarea.oninput = (e) => {
				active.content = e.target.value;
				this.updateStats(e.target.value);
				this.persist();
			};

			// Поддержка клавиши TAB (вставляет табуляцию вместо потери фокуса)
			textarea.onkeydown = (e) => {
				if (e.key === 'Tab') {
					e.preventDefault();
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
					textarea.selectionStart = textarea.selectionEnd = start + 1;
					active.content = textarea.value;
					this.updateStats(textarea.value);
					this.persist();
				}
			};

			// Копирование всего текста
			const copyBtn = document.getElementById('btn-copy-all');
			copyBtn.onclick = () => {
				navigator.clipboard.writeText(textarea.value).then(() => {
					const prev = copyBtn.textContent;
					copyBtn.textContent = '✓ Скопировано!';
					copyBtn.classList.add('btn-copied');
					setTimeout(() => {
						copyBtn.textContent = prev;
						copyBtn.classList.remove('btn-copied');
					}, 1200);
				});
			};

			// Скачивание файла на диск
			document.getElementById('btn-download').onclick = () => {
				const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${active.name}.txt`;
				a.click();
				URL.revokeObjectURL(url);
			};

			// Переключение моноширинного шрифта
			const fontBtn = document.getElementById('btn-toggle-font');
			fontBtn.onclick = () => {
				this.appData.isMonospace = !this.appData.isMonospace;
				this.persist();
				textarea.classList.toggle('monospace', this.appData.isMonospace);
				fontBtn.classList.toggle('active', this.appData.isMonospace);
			};

			// Дублирование
			document.getElementById('btn-duplicate').onclick = () => this.duplicateItem(active, isTemplate);
		}

		updateStats(text) {
			const statsEl = document.getElementById('doc-stats');
			if (!statsEl) return;

			const clean = text.trim();
			const words = clean ? clean.split(/\s+/).length : 0;
			const chars = text.length;
			const lines = text ? text.split('\n').length : 0;

			statsEl.innerHTML = `
				<span>Слов: ${words}</span>
				<span>Символов: ${chars}</span>
				<span>Строк: ${lines}</span>
			`;
		}

		instantiateTemplate(tpl) {
			const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
			const defaultName = `${tpl.name} (${dateStr})`;
			const name = prompt('Название нового документа по шаблону:', defaultName);
			if (!name || !name.trim()) return;

			const newDoc = {
				id: 'doc_' + Date.now(),
				name: name.trim(),
				content: tpl.content || '',
				updatedAt: Date.now()
			};

			this.appData.files.push(newDoc);
			this.appData.activeId = newDoc.id;
			this.persist();
			this.render();
		}

		createNewFile() {
			const name = prompt('Название нового документа:', 'Новый документ');
			if (!name || !name.trim()) return;

			const newDoc = {
				id: 'doc_' + Date.now(),
				name: name.trim(),
				content: '',
				updatedAt: Date.now()
			};

			this.appData.files.push(newDoc);
			this.appData.activeId = newDoc.id;
			this.persist();
			this.render();
		}

		createNewTemplate() {
			const name = prompt('Название нового шаблона:', 'Новый шаблон');
			if (!name || !name.trim()) return;

			const newTpl = {
				id: 'tpl_' + Date.now(),
				name: name.trim(),
				content: '### Заголовок шаблона\n\nТекст шаблона...'
			};

			this.appData.templates.push(newTpl);
			this.appData.activeId = newTpl.id;
			this.appData.isTemplatesOpen = true;
			this.persist();
			this.render();
		}

		renameItem(item) {
			const newName = prompt('Новое название:', item.name);
			if (newName && newName.trim()) {
				item.name = newName.trim();
				this.persist();
				this.render();
			}
		}

		duplicateItem(item, isTemplate) {
			const targetArray = isTemplate ? this.appData.templates : this.appData.files;
			const prefix = isTemplate ? 'tpl_' : 'doc_';
			
			const copy = {
				id: prefix + Date.now(),
				name: `${item.name} (Копия)`,
				content: item.content || ''
			};

			targetArray.push(copy);
			this.appData.activeId = copy.id;
			this.persist();
			this.render();
		}

		deleteItem(id, isTemplate) {
			const targetArray = isTemplate ? this.appData.templates : this.appData.files;
			const item = targetArray.find(x => x.id === id);
			if (!item) return;

			const label = isTemplate ? 'шаблон' : 'документ';
			if (!confirm(`Удалить ${label} "${item.name}"?`)) return;

			if (isTemplate) {
				this.appData.templates = this.appData.templates.filter(x => x.id !== id);
			} else {
				this.appData.files = this.appData.files.filter(x => x.id !== id);
			}

			if (this.appData.activeId === id) {
				if (this.appData.files.length > 0) {
					this.appData.activeId = this.appData.files[0].id;
				} else if (this.appData.templates.length > 0) {
					this.appData.activeId = this.appData.templates[0].id;
				} else {
					this.appData.activeId = null;
				}
			}

			this.persist();
			this.render();
		}

		persist() {
			this.saveGlobal('word', this.appData);
		}
	};

})(NexusBehaviour);