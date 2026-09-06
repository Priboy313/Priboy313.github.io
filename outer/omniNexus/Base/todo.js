var ModuleClass = (function(NexusBehaviour) {

	return class NexusTodo extends NexusBehaviour {

		defaults = {
			defaultData: {
				activeId: 'f_1', // ID активного файла или шаблона
				isTemplatesOpen: false,
				files: [
					{
						id: 'f_1',
						name: 'Задачи на сегодня',
						items: [
							{ id: 'i_1', text: 'Выпить кофе', done: true },
							{ id: 'i_2', text: 'Протестировать omniNexus', done: false }
						]
					}
				],
				templates: [

				]
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
							<span class="header-title">📝 omniNexus Checklist</span>
						</div>
					</header>
					<div class="app-layout">
						<!-- Сайдбар в стиле VS Code -->
						<div class="explorer-pane">
							<!-- Верхняя секция: Рабочие списки -->
							<div class="explorer-section files-section">
								<div class="section-header">
									<span class="section-title">Списки задач</span>
									<button class="icon-action-btn" id="btn-new-file" title="Создать список">+ Создать</button>
								</div>
								<div class="file-list" id="explorer-files"></div>
							</div>

							<!-- Нижняя секция-аккордеон: Шаблоны (VS Code Outline style) -->
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

						<!-- Правая панель: Содержимое -->
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

				/* Проводник VS Code */
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

				/* Панель редактора */
				.content-pane { flex-grow: 1; display: flex; flex-direction: column; background: #0f172a; padding: 28px 36px; overflow-y: auto; user-select: text; }
				
				.content-header { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
				.title-row { display: flex; justify-content: space-between; align-items: center; }
				.title-wrap { display: flex; align-items: center; gap: 10px; }
				.current-file-title { font-size: 22px; font-weight: 700; color: #f8fafc; margin: 0; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.current-file-title:hover { color: #38bdf8; }
				.template-indicator { font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
				.progress-info { font-size: 13px; color: #94a3b8; font-family: monospace; }
				
				.progress-bar-bg { background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden; width: 100%; }
				.progress-bar-fill { background: #10b981; height: 100%; width: 0%; transition: width 0.25s ease; }

				/* Тулбар */
				.toolbar-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
				.tool-btns, .filter-tabs { display: flex; gap: 6px; align-items: center; }
				.tool-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
				.tool-btn:hover { background: #334155; color: #f8fafc; }
				.tool-btn.primary-tpl { background: #0284c7; border-color: #0284c7; color: #fff; }
				.tool-btn.primary-tpl:hover { background: #0369a1; }
				
				.tab-btn { background: transparent; border: none; color: #64748b; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
				.tab-btn:hover { color: #f8fafc; }
				.tab-btn.active { background: #0284c7; color: white; }

				/* Форма добавления */
				.add-task-form { display: flex; gap: 8px; margin-bottom: 20px; }
				.add-task-input { flex-grow: 1; max-width: 650px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 10px 14px; color: #f8fafc; font-size: 14px; outline: none; }
				.add-task-input:focus { border-color: #38bdf8; }
				.add-task-btn { background: #0284c7; border: none; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
				.add-task-btn:hover { background: #0369a1; }

				/* Задачи */
				.task-list { display: flex; flex-direction: column; gap: 8px; max-width: 750px; }
				.task-row { display: flex; align-items: center; justify-content: space-between; background: #1e293b; border: 1px solid #334155; padding: 10px 14px; border-radius: 6px; transition: border-color 0.15s; cursor: grab; }
				.task-row:hover { border-color: #475569; }
				.task-row.dragging { opacity: 0.3; }
				.task-left { display: flex; align-items: center; gap: 12px; flex-grow: 1; }
				.task-checkbox { width: 18px; height: 18px; accent-color: #38bdf8; cursor: pointer; }
				.task-text { font-size: 14px; color: #f8fafc; word-break: break-word; cursor: text; }
				.task-row.done .task-text { text-decoration: line-through; color: #64748b; }
				.task-actions { display: flex; gap: 4px; opacity: 0; }
				.task-row:hover .task-actions { opacity: 1; }
				.task-action-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px 6px; border-radius: 4px; }
				.task-action-btn:hover { color: #f8fafc; background: rgba(255,255,255,0.1); }
				.task-action-btn.del:hover { color: #ef4444; background: rgba(239,68,68,0.15); }

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
			this.appData = this.loadGlobal('todo', this.config.defaultData);
			
			// Миграция старых данных
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

			// Сворачивание / разворачивание аккордеона шаблонов
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

		// Поиск активного объекта (файл или шаблон)
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
			// 1. Рендер обычных списков
			const filesEl = document.getElementById('explorer-files');
			filesEl.innerHTML = '';

			this.appData.files.forEach(file => {
				const item = document.createElement('div');
				item.className = `file-item ${file.id === this.appData.activeId ? 'active' : ''}`;

				const total = (file.items || []).length;
				const done = (file.items || []).filter(i => i.done).length;
				const isAllDone = total > 0 && total === done;

				item.innerHTML = `
					<div class="file-name-wrapper" title="${file.name}">
						<span>📝</span>
						<span style="overflow:hidden;text-overflow:ellipsis;">${file.name}</span>
					</div>
					<div class="file-badge ${isAllDone ? 'done' : ''}">${isAllDone ? '✓ 100%' : `${done}/${total}`}</div>
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

			// 2. Рендер шаблонов (VS Code Outline / Timeline style)
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
						<button class="file-btn make-file" title="Создать обычный список по этому шаблону">⚡</button>
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

				// Быстрая кнопка создания обычного файла из шаблона
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
			const totalTasks = items.length;
			const doneTasks = items.filter(t => t.done).length;
			const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

			const filteredTasks = items.filter(t => {
				if (this.currentFilter === 'active') return !t.done;
				if (this.currentFilter === 'done') return t.done;
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
						<span class="progress-info">${doneTasks} / ${totalTasks} выполнено (${progressPercent}%)</span>
					</div>

					<div class="progress-bar-bg">
						<div class="progress-bar-fill" style="width:${progressPercent}%;"></div>
					</div>

					<div class="toolbar-row">
						<div class="tool-btns">
							${isTemplate ? `
								<button class="tool-btn primary-tpl" id="btn-use-tpl">⚡ Создать рабочий список из шаблона</button>
							` : ''}
							<button class="tool-btn" id="btn-toggle-all">✓ Все</button>
							<button class="tool-btn" id="btn-clear-done">🧹 Очистить готовые</button>
							<button class="tool-btn" id="btn-duplicate">📋 Копия</button>
						</div>

						<div class="filter-tabs">
							<button class="tab-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Все (${totalTasks})</button>
							<button class="tab-btn ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">Активные (${totalTasks - doneTasks})</button>
							<button class="tab-btn ${this.currentFilter === 'done' ? 'active' : ''}" data-filter="done">Готовые (${doneTasks})</button>
						</div>
					</div>
				</div>
				
				<div class="add-task-form">
					<input type="text" class="add-task-input" id="new-task-input" placeholder="Добавить пункт (Enter)..." autofocus />
					<button class="add-task-btn" id="add-task-btn">+ Пункт</button>
				</div>

				<div class="task-list" id="task-container"></div>
			`;

			document.getElementById('file-title').onclick = () => this.renameItem(active);

			if (isTemplate) {
				document.getElementById('btn-use-tpl').onclick = () => this.instantiateTemplate(active);
			}

			document.getElementById('btn-toggle-all').onclick = () => this.toggleAll(active);
			document.getElementById('btn-clear-done').onclick = () => this.clearCompleted(active);
			document.getElementById('btn-duplicate').onclick = () => this.duplicateItem(active, isTemplate);

			pane.querySelectorAll('.tab-btn').forEach(btn => {
				btn.onclick = () => {
					this.currentFilter = btn.dataset.filter;
					this.renderContent();
				};
			});

			const input = document.getElementById('new-task-input');
			const addBtn = document.getElementById('add-task-btn');

			const handleAdd = () => {
				const val = input.value.trim();
				if (!val) return;
				active.items.push({ id: 'i_' + Date.now(), text: val, done: false });
				this.persist();
				this.render();
			};

			addBtn.onclick = handleAdd;
			input.onkeydown = (e) => {
				if (e.key === 'Enter') handleAdd();
			};

			const container = document.getElementById('task-container');

			if (filteredTasks.length === 0) {
				container.innerHTML = `<div style="color:#64748b;font-size:13px;padding:12px 0;">${totalTasks === 0 ? 'Список пуст. Добавьте первый пункт выше.' : 'Нет пунктов в этом фильтре.'}</div>`;
				return;
			}

			filteredTasks.forEach(task => {
				const row = document.createElement('div');
				row.className = `task-row ${task.done ? 'done' : ''}`;
				row.draggable = true;

				row.innerHTML = `
					<div class="task-left">
						<input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} />
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

				const checkbox = row.querySelector('.task-checkbox');
				checkbox.onchange = () => {
					task.done = checkbox.checked;
					this.persist();
					this.render();
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

		// Создание обычного списка из шаблона
		instantiateTemplate(tpl) {
			const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
			const defaultName = `${tpl.name} (${dateStr})`;
			const name = prompt('Название нового списка по шаблону:', defaultName);
			if (!name || !name.trim()) return;

			// Клонируем пункты шаблона со сброшенными чекбоксами
			const clonedItems = (tpl.items || []).map(i => ({
				id: 'i_' + Date.now() + Math.random().toString(36).substr(2, 5),
				text: i.text,
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
			this.appData.isTemplatesOpen = true; // Открываем аккордеон, чтобы сразу увидеть новый шаблон
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

			// Если удалили активный элемент — переключаемся на соседний или показываем пустой экран
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

		toggleAll(target) {
			const allDone = target.items.every(i => i.done);
			target.items.forEach(i => i.done = !allDone);
			this.persist();
			this.render();
		}

		clearCompleted(target) {
			const doneCount = target.items.filter(i => i.done).length;
			if (doneCount === 0) return alert('Нет завершенных пунктов для очистки.');

			if (confirm(`Удалить ${doneCount} завершенных пунктов?`)) {
				target.items = target.items.filter(i => !i.done);
				this.persist();
				this.render();
			}
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