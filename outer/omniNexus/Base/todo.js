var ModuleClass = (function(NexusBehaviour) {

	return class NexusTodo extends NexusBehaviour {

		defaults = {
			defaultData: {
				activeId: 'f_1',
				isTemplatesOpen: true,
				files: [
					{
						id: 'f_1',
						name: 'Пример QA прогона',
						items: [
							{ id: 'i_1', text: 'Проверка CA-модулей Триколор', status: 'passed', done: true },
							{ id: 'i_2', text: 'USB Films Dolby HDR воспроизведение', status: 'failed', done: false },
							{ id: 'i_3', text: 'Google Acc (недоступен в регионе)', status: 'na', done: false },
							{ id: 'i_4', text: 'Проверить приложение Okko', status: 'todo', done: false }
						]
					}
				],
				templates: []
			}
		};

		awake() {
			const hubUrl = `https://${this.CONFIG.dashboardHost}${this.CONFIG.dashboardPath}`;

			document.documentElement.innerHTML = `
				<head><title>Notes // ${this.workspace}</title></head>
				<body>
					<header>
						<div class="header-left">
							<a href="${hubUrl}" class="back-link">← В Хаб</a>
							<span class="header-title">📝 omniChecklist</span>
						</div>
					</header>
					<div class="app-layout">
						<div class="explorer-pane">
							<div class="explorer-section files-section">
								<div class="section-header">
									<span class="section-title">Списки задач</span>
									<button class="icon-action-btn" id="btn-new-file" title="Создать список">+ Создать</button>
								</div>
								<div class="file-list" id="explorer-files"></div>
							</div>

							<div class="explorer-section templates-section" id="templates-accordion">
								<div class="section-header accordion-toggle" id="toggle-templates">
									<div class="accordion-title-wrap">
										<span class="chevron" id="templates-chevron">⌄</span>
										<span class="section-title">Шаблоны</span>
										<span class="accordion-count" id="templates-count">0</span>
									</div>
									<button class="icon-action-btn" id="btn-new-tpl" title="Создать новый шаблон">+ Шаблон</button>
								</div>
								<div class="file-list" id="explorer-templates"></div>
							</div>
						</div>

						<div class="content-pane" id="editor-pane"></div>
					</div>
				</body>`;

			this.addCSS(`
				* { box-sizing: border-box; }
				body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; user-select: none; }
				
				header { height: 52px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
				.header-left { display: flex; align-items: center; gap: 14px; }
				.back-link { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 4px; background: #334155; display: flex; align-items: center; gap: 6px; }
				.back-link:hover { color: #f8fafc; background: #475569; }
				.header-title { font-weight: 700; font-size: 15px; color: #38bdf8; }

				.app-layout { flex-grow: 1; display: flex; overflow: hidden; }

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
				.file-badge { font-size: 10px; padding: 2px 5px; border-radius: 3px; background: rgba(0,0,0,0.3); color: #94a3b8; font-family: monospace; }
				.file-badge.done { background: rgba(16, 185, 129, 0.2); color: #34d399; font-weight: bold; }
				
				.file-actions { display: flex; gap: 2px; opacity: 0; }
				.file-item:hover .file-actions { opacity: 1; }
				.file-btn { background: transparent; border: none; color: #9ca3af; cursor: pointer; padding: 2px 5px; border-radius: 3px; font-size: 11px; }
				.file-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
				.file-btn.make-file { color: #38bdf8; font-weight: bold; }
				.file-btn.make-file:hover { background: rgba(56, 189, 248, 0.2); color: #fff; }
				.file-btn.del:hover { background: rgba(239,68,68,0.3); color: #ef4444; }

				.content-pane { flex-grow: 1; display: flex; flex-direction: column; background: #0f172a; padding: 28px 36px; overflow-y: auto; user-select: text; }
				
				.content-header { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
				.title-row { display: flex; justify-content: space-between; align-items: center; }
				.title-wrap { display: flex; align-items: center; gap: 10px; }
				.current-file-title { font-size: 22px; font-weight: 700; color: #f8fafc; margin: 0; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.current-file-title:hover { color: #38bdf8; }
				.template-indicator { font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
				
				/* Сводка QA метрик */
				.qa-stats-row { display: flex; align-items: center; gap: 12px; font-size: 12px; font-family: monospace; }
				.stat-pill { padding: 3px 8px; border-radius: 4px; font-weight: bold; }
				.stat-passed { background: rgba(16, 185, 129, 0.15); color: #34d399; }
				.stat-failed { background: rgba(239, 68, 68, 0.15); color: #f87171; }
				.stat-na { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
				.stat-total { color: #94a3b8; }

				.progress-bar-bg { background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden; width: 100%; display: flex; }
				.progress-bar-fill-passed { background: #10b981; height: 100%; transition: width 0.25s ease; }
				.progress-bar-fill-failed { background: #ef4444; height: 100%; transition: width 0.25s ease; }

				.toolbar-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
				.tool-btns, .filter-tabs { display: flex; gap: 6px; align-items: center; }
				.tool-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
				.tool-btn:hover { background: #334155; color: #f8fafc; }
				.tool-btn.primary-tpl { background: #0284c7; border-color: #0284c7; color: #fff; }
				.tool-btn.primary-tpl:hover { background: #0369a1; }
				
				.tab-btn { background: transparent; border: none; color: #64748b; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
				.tab-btn:hover { color: #f8fafc; }
				.tab-btn.active { background: #0284c7; color: white; }

				.add-task-form { display: flex; gap: 8px; margin-bottom: 20px; }
				.add-task-input { flex-grow: 1; max-width: 650px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 10px 14px; color: #f8fafc; font-size: 14px; outline: none; }
				.add-task-input:focus { border-color: #38bdf8; }
				.add-task-btn { background: #0284c7; border: none; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
				.add-task-btn:hover { background: #0369a1; }

				.task-list { display: flex; flex-direction: column; gap: 8px; max-width: 800px; }
				.task-row { display: flex; align-items: center; justify-content: space-between; background: #1e293b; border: 1px solid #334155; padding: 8px 12px; border-radius: 6px; transition: border-color 0.15s; cursor: grab; }
				.task-row:hover { border-color: #475569; }
				.task-row.dragging { opacity: 0.3; }

				.task-left { display: flex; align-items: center; gap: 12px; flex-grow: 1; }
				
				/* Широкая кнопка-триггер статуса (Passed / Failed / NA / Todo) */
				.status-zone-btn { min-width: 95px; width: 95px; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; user-select: none; border: 1px solid transparent; transition: transform 0.1s, background 0.15s; flex-shrink: 0; }
				.status-zone-btn:hover { transform: scale(1.02); }
				
				.status-todo { background: #0f172a; border-color: #334155; color: #64748b; }
				.status-passed { background: rgba(16, 185, 129, 0.15); border-color: #10b981; color: #34d399; }
				.status-failed { background: rgba(239, 68, 68, 0.18); border-color: #ef4444; color: #f87171; }
				.status-na { background: rgba(245, 158, 11, 0.15); border-color: #f59e0b; color: #fbbf24; }

				.task-text { font-size: 14px; color: #f8fafc; word-break: break-word; cursor: text; line-height: 1.4; flex-grow: 1; }
				.task-row.status-passed .task-text { color: #64748b; }
				.task-row.status-failed .task-text { color: #fca5a5; font-weight: 600; }
				.task-row.status-na .task-text { opacity: 0.6; color: #94a3b8; }

				.task-actions { display: flex; gap: 4px; opacity: 0; }
				.task-row:hover .task-actions { opacity: 1; }
				.task-action-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px 6px; border-radius: 4px; }
				.task-action-btn:hover { color: #f8fafc; background: rgba(255,255,255,0.1); }
				.task-action-btn.del:hover { color: #ef4444; background: rgba(239,68,68,0.15); }

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
			this.appData = this.loadGlobal('todo', this.config.defaultData);
			
			if (!this.appData.files) this.appData.files = [];
			if (!this.appData.templates) this.appData.templates = [];
			if (this.appData.isTemplatesOpen === undefined) this.appData.isTemplatesOpen = true;
			if (!this.appData.activeId && this.appData.activeFileId) {
				this.appData.activeId = this.appData.activeFileId;
			}

			this.currentFilter = 'all';
			this.draggedTaskId = null;

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

		// Безопасное получение статуса (с обратной совместимостью для done: true/false)
		getItemStatus(task) {
			if (task.status) return task.status;
			return task.done ? 'passed' : 'todo';
		}

		// Циклический переключатель: Todo -> Passed -> Failed -> N/A -> Todo
		cycleStatus(task) {
			const current = this.getItemStatus(task);
			const order = ['todo', 'passed', 'failed', 'na'];
			const nextIdx = (order.indexOf(current) + 1) % order.length;
			const nextStatus = order[nextIdx];

			task.status = nextStatus;
			task.done = (nextStatus === 'passed');
			
			this.persist();
			this.render();
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

				const total = (file.items || []).length;
				const passed = (file.items || []).filter(i => this.getItemStatus(i) === 'passed').length;
				const failed = (file.items || []).filter(i => this.getItemStatus(i) === 'failed').length;
				const isAllDone = total > 0 && total === passed;

				let badgeText = `${passed}/${total}`;
				if (failed > 0) badgeText += ` (!${failed})`;

				item.innerHTML = `
					<div class="file-name-wrapper" title="${file.name}">
						<span>📝</span>
						<span style="overflow:hidden;text-overflow:ellipsis;">${file.name}</span>
					</div>
					<div class="file-badge ${isAllDone ? 'done' : ''}">${isAllDone ? '✓ 100%' : badgeText}</div>
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

				const total = (tpl.items || []).length;

				item.innerHTML = `
					<div class="file-name-wrapper" title="${tpl.name}">
						<span>📑</span>
						<span style="overflow:hidden;text-overflow:ellipsis;">${tpl.name}</span>
					</div>
					<div class="file-badge">${total} п.</div>
					<div class="file-actions">
						<button class="file-btn make-file" title="Создать список по шаблону">⚡</button>
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
						<div class="empty-icon">📭</div>
						<h3 class="empty-title">Нет открытых списков</h3>
						<p class="empty-desc">Выберите список или шаблон в проводнике слева, либо создайте новый.</p>
						<div class="empty-btns">
							<button class="empty-btn" id="empty-create-file">+ Создать список</button>
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
			const items = active.items || [];
			
			const total = items.length;
			const passed = items.filter(t => this.getItemStatus(t) === 'passed').length;
			const failed = items.filter(t => this.getItemStatus(t) === 'failed').length;
			const na = items.filter(t => this.getItemStatus(t) === 'na').length;
			const todo = items.filter(t => this.getItemStatus(t) === 'todo').length;

			const passedPct = total === 0 ? 0 : Math.round((passed / total) * 100);
			const failedPct = total === 0 ? 0 : Math.round((failed / total) * 100);

			const filteredTasks = items.filter(t => {
				const s = this.getItemStatus(t);
				if (this.currentFilter === 'passed') return s === 'passed';
				if (this.currentFilter === 'failed') return s === 'failed';
				if (this.currentFilter === 'todo') return s === 'todo';
				if (this.currentFilter === 'na') return s === 'na';
				return true;
			});

			pane.innerHTML = `
				<div class="content-header">
					<div class="title-row">
						<div class="title-wrap">
							<h2 class="current-file-title" id="file-title" title="Кликните для переименования">
								<span>${isTemplate ? '📑' : '📝'} ${active.name}</span>
								<span style="font-size:14px;color:#64748b;">✏️</span>
							</h2>
							${isTemplate ? '<span class="template-indicator">Шаблон</span>' : ''}
						</div>
						
						<div class="qa-stats-row">
							<span class="stat-pill stat-passed" title="Passed">✓ ${passed}</span>
							<span class="stat-pill stat-failed" title="Failed">✕ ${failed}</span>
							<span class="stat-pill stat-na" title="N/A">⊘ ${na}</span>
							<span class="stat-pill stat-total">${passedPct}%</span>
						</div>
					</div>

					<div class="progress-bar-bg">
						<div class="progress-bar-fill-passed" style="width:${passedPct}%;"></div>
						<div class="progress-bar-fill-failed" style="width:${failedPct}%;"></div>
					</div>

					<div class="toolbar-row">
						<div class="tool-btns">
							${isTemplate ? `<button class="tool-btn primary-tpl" id="btn-use-tpl">⚡ Создать рабочий список</button>` : ''}
							<button class="tool-btn" id="btn-toggle-all">✓ Все Passed</button>
							<button class="tool-btn" id="btn-reset-all">↺ Сбросить все</button>
							<button class="tool-btn" id="btn-duplicate">📋 Копия</button>
						</div>

						<div class="filter-tabs">
							<button class="tab-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Все (${total})</button>
							<button class="tab-btn ${this.currentFilter === 'todo' ? 'active' : ''}" data-filter="todo">Очередь (${todo})</button>
							<button class="tab-btn ${this.currentFilter === 'passed' ? 'active' : ''}" data-filter="passed">✓ (${passed})</button>
							<button class="tab-btn ${this.currentFilter === 'failed' ? 'active' : ''}" data-filter="failed">✕ (${failed})</button>
							<button class="tab-btn ${this.currentFilter === 'na' ? 'active' : ''}" data-filter="na">⊘ (${na})</button>
						</div>
					</div>
				</div>
				
				<div class="add-task-form">
					<input type="text" class="add-task-input" id="new-task-input" placeholder="Добавить тест/задачу (Enter)..." autofocus />
					<button class="add-task-btn" id="add-task-btn">+ Добавить</button>
				</div>

				<div class="task-list" id="task-container"></div>
			`;

			document.getElementById('file-title').onclick = () => this.renameItem(active);

			if (isTemplate) {
				document.getElementById('btn-use-tpl').onclick = () => this.instantiateTemplate(active);
			}

			document.getElementById('btn-toggle-all').onclick = () => this.setAllStatus(active, 'passed');
			document.getElementById('btn-reset-all').onclick = () => this.setAllStatus(active, 'todo');
			document.getElementById('btn-duplicate').onclick = () => this.duplicateItem(active, isTemplate);

			pane.querySelectorAll('.tab-btn').forEach(btn => {
				btn.onclick = () => {
					this.currentFilter = btn.dataset.filter;
					this.renderContent();
				};
			});

			const input = document.getElementById('new-task-input');
			const addBtn = document.getElementById('add-task-btn');

			// Автофокус при добавлении
			const handleAdd = () => {
				const val = input.value.trim();
				if (!val) return;
				active.items.push({ id: 'i_' + Date.now(), text: val, status: 'todo', done: false });
				this.persist();
				this.render();
				
				// Возвращаем фокус в поле ввода сразу
				const newInput = document.getElementById('new-task-input');
				if (newInput) newInput.focus();
			};

			addBtn.onclick = handleAdd;
			input.onkeydown = (e) => {
				if (e.key === 'Enter') handleAdd();
			};

			const container = document.getElementById('task-container');

			if (filteredTasks.length === 0) {
				container.innerHTML = `<div style="color:#64748b;font-size:13px;padding:12px 0;">${total === 0 ? 'Список пуст. Добавьте первый тест выше.' : 'Нет задач в этом фильтре.'}</div>`;
				return;
			}

			filteredTasks.forEach(task => {
				const status = this.getItemStatus(task);
				const row = document.createElement('div');
				row.className = `task-row status-${status}`;
				row.draggable = true;

				let statusText = '○ Todo';
				if (status === 'passed') statusText = '✓ Passed';
				if (status === 'failed') statusText = '✕ Failed';
				if (status === 'na') statusText = '⊘ N/A';

				row.innerHTML = `
					<div class="task-left">
						<button class="status-zone-btn status-${status}" title="Кликните для смены статуса (Todo -> Passed -> Failed -> N/A)">
							${statusText}
						</button>
						<span class="task-text" title="Двойной клик для редактирования">${task.text}</span>
					</div>
					<div class="task-actions">
						<button class="task-action-btn edit" title="Редактировать">✏️</button>
						<button class="task-action-btn del" title="Удалить">✕</button>
					</div>
				`;

				row.addEventListener('dragstart', () => {
					this.draggedTaskId = task.id;
					setTimeout(() => row.classList.add('dragging'), 0);
				});

				row.addEventListener('dragend', () => {
					row.classList.remove('dragging');
					this.draggedTaskId = null;
				});

				row.addEventListener('dragover', (e) => e.preventDefault());
				row.addEventListener('drop', (e) => {
					e.preventDefault();
					if (!this.draggedTaskId || this.draggedTaskId === task.id) return;
					this.reorderTasks(active, this.draggedTaskId, task.id);
				});

				// Клик по широкой зоне переключает статус в один клик
				row.querySelector('.status-zone-btn').onclick = (e) => {
					e.stopPropagation();
					this.cycleStatus(task);
				};

				const editAction = () => this.editTask(task);
				row.querySelector('.task-text').ondblclick = editAction;
				row.querySelector('.task-action-btn.edit').onclick = editAction;

				row.querySelector('.task-action-btn.del').onclick = () => {
					active.items = active.items.filter(t => t.id !== task.id);
					this.persist();
					this.render();
				};

				container.appendChild(row);
			});
		}

		instantiateTemplate(tpl) {
			const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
			const defaultName = `${tpl.name} (${dateStr})`;
			const name = prompt('Название нового списка по шаблону:', defaultName);
			if (!name || !name.trim()) return;

			const clonedItems = (tpl.items || []).map(i => ({
				id: 'i_' + Date.now() + Math.random().toString(36).substr(2, 5),
				text: i.text,
				status: 'todo',
				done: false
			}));

			const newFile = {
				id: 'f_' + Date.now(),
				name: name.trim(),
				items: clonedItems
			};

			this.appData.files.push(newFile);
			this.appData.activeId = newFile.id;
			this.persist();
			this.render();
		}

		createNewFile() {
			const name = prompt('Название нового списка:', 'Новый список');
			if (!name || !name.trim()) return;

			const newFile = {
				id: 'f_' + Date.now(),
				name: name.trim(),
				items: []
			};

			this.appData.files.push(newFile);
			this.appData.activeId = newFile.id;
			this.persist();
			this.render();
		}

		createNewTemplate() {
			const name = prompt('Название нового шаблона:', 'Новый шаблон');
			if (!name || !name.trim()) return;

			const newTpl = {
				id: 't_' + Date.now(),
				name: name.trim(),
				items: []
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
			const prefix = isTemplate ? 't_' : 'f_';
			
			const copy = {
				id: prefix + Date.now(),
				name: `${item.name} (Копия)`,
				items: (item.items || []).map(i => ({ ...i, id: 'i_' + Date.now() + Math.random() }))
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

			const label = isTemplate ? 'шаблон' : 'список';
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

		editTask(task) {
			const newText = prompt('Редактировать пункт:', task.text);
			if (newText && newText.trim()) {
				task.text = newText.trim();
				this.persist();
				this.render();
			}
		}

		setAllStatus(target, status) {
			(target.items || []).forEach(i => {
				i.status = status;
				i.done = (status === 'passed');
			});
			this.persist();
			this.render();
		}

		reorderTasks(target, fromId, toId) {
			const fromIdx = target.items.findIndex(i => i.id === fromId);
			const toIdx = target.items.findIndex(i => i.id === toId);
			if (fromIdx === -1 || toIdx === -1) return;

			const [moved] = target.items.splice(fromIdx, 1);
			target.items.splice(toIdx, 0, moved);

			this.persist();
			this.render();
		}

		persist() {
			this.saveGlobal('todo', this.appData);
		}
	};

})(NexusBehaviour);