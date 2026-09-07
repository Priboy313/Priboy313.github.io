var ModuleClass = (function(NexusBehaviour) {

	return class OmniSheet extends NexusBehaviour {

		defaults = {
			defaultData: {
				activeId: 'sheet_1',
				isTemplatesOpen: true,
				files: [
					{
						id: 'sheet_1',
						name: 'Прогон тестов TV.xlsx',
						cols: 6, // A - F
						rows: 15,
						cells: {
							"A1": "ID", "B1": "Тест / Модуль", "C1": "Время (сек)", "D1": "Статус", "E1": "Коэф.", "F1": "Итог",
							"A2": "1", "B2": "CA Триколор", "C2": "4.2", "D2": "1", "E2": "1.1", "F2": "=C2*E2",
							"A3": "2", "B3": "CA НТВ+", "C3": "3.8", "D3": "1", "E3": "1.1", "F3": "=C3*E3",
							"A4": "3", "B4": "CA МТС", "C4": "12.5", "D4": "0", "E4": "1.0", "F4": "=C4*E4",
							"A5": "4", "B5": "USB Dolby HDR", "C5": "5.1", "D5": "1", "E5": "1.2", "F5": "=C5*E5",
							"B7": "Сумма времени:", "C7": "=SUM(C2:C5)",
							"B8": "Среднее время:", "C8": "=AVERAGE(C2:C5)",
							"B9": "Успешно тестов:", "C9": "=SUM(D2:D5)"
						}
					}
				],
				templates: [
					{
						id: 'tpl_calc',
						name: 'Калькулятор сметы',
						cols: 5,
						rows: 10,
						cells: {
							"A1": "Позиция", "B1": "Кол-во", "C1": "Цена", "D1": "Сумма",
							"A2": "Лицензия ПО", "B2": "5", "C2": "1200", "D2": "=B2*C2",
							"A3": "Тестовый пульт", "B3": "2", "C3": "3500", "D3": "=B3*C3",
							"A4": "Кабель HDMI 2.1", "B4": "4", "C4": "850", "D4": "=B4*C4",
							"C6": "ИТОГО:", "D6": "=SUM(D2:D4)"
						}
					}
				]
			}
		};

		awake() {
			const hubUrl = `https://${this.CONFIG.dashboardHost}${this.CONFIG.dashboardPath}`;

			document.documentElement.innerHTML = `
				<head><title>omniSheet // ${this.workspace}</title></head>
				<body>
					<header>
						<div class="header-left">
							<a href="${hubUrl}" class="back-link">← В Хаб</a>
							<span class="header-title">📊 omniSheet Studio</span>
						</div>
					</header>
					<div class="app-layout">
						<!-- Сайдбар Проводника -->
						<div class="explorer-pane">
							<div class="explorer-section files-section">
								<div class="section-header">
									<span class="section-title">Таблицы</span>
									<button class="icon-action-btn" id="btn-new-file" title="Создать таблицу">+ Таблица</button>
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
									<button class="icon-action-btn" id="btn-new-tpl" title="Создать шаблон">+ Шаблон</button>
								</div>
								<div class="file-list" id="explorer-templates"></div>
							</div>
						</div>

						<!-- Рабочая область Таблицы -->
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

				.app-layout { flex-grow: 1; display: flex; overflow: hidden; }

				/* Сайдбар */
				.explorer-pane { width: 280px; min-width: 280px; background: #111827; border-right: 1px solid #1f2937; display: flex; flex-direction: column; }
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

				/* Панель таблицы */
				.content-pane { flex-grow: 1; display: flex; flex-direction: column; background: #0f172a; overflow: hidden; }
				
				.sheet-topbar { padding: 12px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }
				.sheet-title-row { display: flex; justify-content: space-between; align-items: center; }
				.sheet-title { font-size: 18px; font-weight: 700; color: #f8fafc; margin: 0; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.sheet-title:hover { color: #38bdf8; }
				.tpl-badge { font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; }

				/* Тулбар операций */
				.sheet-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
				.toolbar-group { display: flex; gap: 6px; align-items: center; }
				.s-btn { background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
				.s-btn:hover { background: #334155; color: #f8fafc; }
				.s-btn.primary { background: #0284c7; border-color: #0284c7; color: white; }
				.s-btn.primary:hover { background: #0369a1; }
				.s-btn.btn-copied { background: #10b981 !important; border-color: #10b981 !important; color: white !important; }

				/* Строка формул (Excel fx) */
				.formula-bar-container { display: flex; align-items: center; gap: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; }
				.active-cell-badge { font-family: monospace; font-weight: 700; color: #38bdf8; font-size: 13px; min-width: 45px; text-align: center; border-right: 1px solid #334155; padding-right: 8px; }
				.fx-label { font-family: serif; font-style: italic; font-weight: bold; color: #64748b; font-size: 14px; user-select: none; }
				#formula-input { flex-grow: 1; background: transparent; border: none; color: #f8fafc; font-family: monospace; font-size: 13px; outline: none; }

				/* Сетка таблицы */
				.grid-viewport { flex-grow: 1; overflow: auto; background: #0f172a; position: relative; }
				table.sheet-table { border-collapse: collapse; table-layout: fixed; width: max-content; }
				
				/* Заголовки A, B, C и 1, 2, 3 */
				th.corner-header { width: 45px; min-width: 45px; background: #111827; border: 1px solid #334155; position: sticky; top: 0; left: 0; z-index: 30; }
				th.col-header { height: 28px; width: 120px; min-width: 120px; background: #1e293b; border: 1px solid #334155; font-size: 12px; font-weight: 600; color: #94a3b8; text-align: center; position: sticky; top: 0; z-index: 20; user-select: none; }
				th.col-header.selected-col { background: #334155; color: #38bdf8; }
				
				td.row-header { width: 45px; min-width: 45px; height: 28px; background: #1e293b; border: 1px solid #334155; font-size: 11px; font-weight: 600; color: #94a3b8; text-align: center; position: sticky; left: 0; z-index: 10; user-select: none; font-family: monospace; }
				td.row-header.selected-row { background: #334155; color: #38bdf8; }

				/* Ячейки */
				td.cell { height: 28px; background: #0f172a; border: 1px solid #1e293b; padding: 4px 8px; font-size: 13px; color: #f8fafc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: cell; user-select: text; }
				td.cell.numeric { text-align: right; font-family: monospace; }
				td.cell.selected { outline: 2px solid #38bdf8 !important; outline-offset: -2px; background: rgba(56, 189, 248, 0.08) !important; }
				td.cell.editing { padding: 0; background: #000 !important; }
				
				input.cell-editor { width: 100%; height: 100%; background: #000; border: none; color: #38bdf8; font-family: monospace; font-size: 13px; padding: 4px 8px; outline: none; }
				.err-val { color: #f87171 !important; font-weight: bold; font-family: monospace; }

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
			this.appData = this.loadGlobal('sheet', this.config.defaultData);

			if (!this.appData.files) this.appData.files = [];
			if (!this.appData.templates) this.appData.templates = [];
			if (this.appData.isTemplatesOpen === undefined) this.appData.isTemplatesOpen = true;
			if (!this.appData.activeId && this.appData.files.length > 0) {
				this.appData.activeId = this.appData.files[0].id;
			}

			this.selectedCell = 'A1';
			this.isEditing = false;

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

		// === ДВИЖОК ВЫЧИСЛЕНИЯ ФОРМУЛ (Excel / Google Sheets Parser) ===

		idxToCol(i) {
			let s = '';
			while (i >= 0) {
				s = String.fromCharCode((i % 26) + 65) + s;
				i = Math.floor(i / 26) - 1;
			}
			return s;
		}

		colToIdx(s) {
			let n = 0;
			for (let i = 0; i < s.length; i++) {
				n = n * 26 + s.charCodeAt(i) - 64;
			}
			return n - 1;
		}

		parseCoord(coord) {
			const m = coord.trim().toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
			if (!m) return null;
			return { col: m[1], row: parseInt(m[2]), cIdx: this.colToIdx(m[1]), rIdx: parseInt(m[2]) - 1 };
		}

		expandRange(rangeStr) {
			const parts = rangeStr.split(':');
			if (parts.length === 1) return [parts[0].trim().toUpperCase()];
			const start = this.parseCoord(parts[0]);
			const end = this.parseCoord(parts[1]);
			if (!start || !end) return [];

			const minC = Math.min(start.cIdx, end.cIdx);
			const maxC = Math.max(start.cIdx, end.cIdx);
			const minR = Math.min(start.rIdx, end.rIdx);
			const maxR = Math.max(start.rIdx, end.rIdx);

			const list = [];
			for (let c = minC; c <= maxC; c++) {
				for (let r = minR; r <= maxR; r++) {
					list.push(`${this.idxToCol(c)}${r + 1}`);
				}
			}
			return list;
		}

		evalCell(coord, cells, visited = new Set()) {
			coord = coord.toUpperCase();
			if (visited.has(coord)) return '#CYCLE!';
			const raw = (cells[coord] ?? '').toString().trim();

			if (!raw.startsWith('=')) {
				if (raw === '') return '';
				const num = Number(raw);
				return !isNaN(num) ? num : raw;
			}

			// Формула
			return this.evalFormula(raw.substring(1), cells, new Set([...visited, coord]));
		}

		evalFormula(formula, cells, visited) {
			try {
				let expr = formula.trim();

				// 1. Функции диапазонов: SUM, AVERAGE (AVG), MIN, MAX, COUNT
				const fnRegex = /(SUM|AVERAGE|AVG|MIN|MAX|COUNT)\(([^)]+)\)/gi;
				expr = expr.replace(fnRegex, (match, fnName, argStr) => {
					fnName = fnName.toUpperCase();
					const rangeCells = this.expandRange(argStr);
					const vals = rangeCells.map(c => this.evalCell(c, cells, visited)).filter(v => typeof v === 'number' && !isNaN(v));

					if (fnName === 'SUM') return vals.reduce((a, b) => a + b, 0);
					if (fnName === 'COUNT') return vals.length;
					if (fnName === 'AVERAGE' || fnName === 'AVG') return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
					if (fnName === 'MIN') return vals.length ? Math.min(...vals) : 0;
					if (fnName === 'MAX') return vals.length ? Math.max(...vals) : 0;
					return 0;
				});

				// 2. Одиночные ссылки на ячейки (например: A1, B2, C10)
				const cellRefRegex = /\b([A-Z]+[0-9]+)\b/g;
				expr = expr.replace(cellRefRegex, (ref) => {
					const val = this.evalCell(ref, cells, visited);
					if (typeof val === 'number') return val;
					if (val === '' || val === null || val === undefined) return 0;
					if (typeof val === 'string' && val.startsWith('#')) throw new Error(val);
					const num = Number(val);
					return !isNaN(num) ? num : 0;
				});

				// 3. Безопасное вычисление чистого мат. выражения
				if (!/^[0-9+\-*/(). eE%]+$/.test(expr)) {
					return '#VALUE!';
				}

				const result = Function(`"use strict"; return (${expr})`)();
				if (typeof result === 'number') {
					if (!isFinite(result)) return '#DIV/0!';
					return Math.round(result * 10000) / 10000;
				}
				return result;
			} catch (err) {
				return err.message && err.message.startsWith('#') ? err.message : '#ERR!';
			}
		}

		// === РЕНДЕР ===

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
						<span>📊</span>
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
					this.selectedCell = 'A1';
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
						<button class="file-btn make-file" title="Создать таблицу по шаблону">⚡</button>
						<button class="file-btn edit" title="Переименовать">✏️</button>
						<button class="file-btn del" title="Удалить">✕</button>
					</div>
				`;

				item.onclick = (e) => {
					if (e.target.closest('.file-actions')) return;
					this.appData.activeId = tpl.id;
					this.selectedCell = 'A1';
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
						<div class="empty-icon">📊</div>
						<h3 class="empty-title">Нет открытых таблиц</h3>
						<p class="empty-desc">Выберите таблицу или шаблон в проводнике слева, либо создайте новую.</p>
						<div class="empty-btns">
							<button class="empty-btn" id="empty-create-file">+ Создать таблицу</button>
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
			if (!active.cells) active.cells = {};
			if (!active.cols) active.cols = 8;
			if (!active.rows) active.rows = 20;

			pane.innerHTML = `
				<div class="sheet-topbar">
					<div class="sheet-title-row">
						<h2 class="sheet-title" id="sheet-title" title="Кликните для переименования">
							<span>${isTemplate ? '📑' : '📊'} ${active.name}</span>
							<span style="font-size:14px;color:#64748b;">✏️</span>
						</h2>
						${isTemplate ? '<span class="tpl-badge">Шаблон</span>' : ''}
					</div>

					<div class="sheet-toolbar">
						<div class="toolbar-group">
							${isTemplate ? `<button class="s-btn primary" id="btn-use-tpl">⚡ Создать таблицу по шаблону</button>` : ''}
							<button class="s-btn" id="btn-add-row">+ Строка</button>
							<button class="s-btn" id="btn-add-col">+ Столбец</button>
							<button class="s-btn" id="btn-del-row">- Строка</button>
							<button class="s-btn" id="btn-del-col">- Столбец</button>
						</div>
						<div class="toolbar-group">
							<button class="s-btn" id="btn-copy-tsv" title="Копирует таблицу в буфер для вставки в Excel">📋 Копировать для Excel</button>
							<button class="s-btn" id="btn-paste-tsv" title="Вставляет данные, скопированные из Excel">📥 Вставить из Excel</button>
							<button class="s-btn" id="btn-export-csv">💾 Скачать .csv</button>
						</div>
					</div>

					<!-- Строка формул fx -->
					<div class="formula-bar-container">
						<span class="active-cell-badge" id="fx-cell">${this.selectedCell}</span>
						<span class="fx-label">fx</span>
						<input type="text" id="formula-input" placeholder="Значение или формула (=SUM(A1:A5), =A1*1.2)..." />
					</div>
				</div>

				<div class="grid-viewport" id="grid-viewport">
					<table class="sheet-table" id="sheet-table"></table>
				</div>
			`;

			document.getElementById('sheet-title').onclick = () => this.renameItem(active);

			if (isTemplate) {
				document.getElementById('btn-use-tpl').onclick = () => this.instantiateTemplate(active);
			}

			// Операции с размером сетки
			document.getElementById('btn-add-row').onclick = () => { active.rows++; this.persist(); this.renderGrid(active); };
			document.getElementById('btn-add-col').onclick = () => { active.cols++; this.persist(); this.renderGrid(active); };
			document.getElementById('btn-del-row').onclick = () => { if (active.rows > 1) { active.rows--; this.persist(); this.renderGrid(active); } };
			document.getElementById('btn-del-col').onclick = () => { if (active.cols > 1) { active.cols--; this.persist(); this.renderGrid(active); } };

			// Интеграция с Excel через буфер обмена
			this.initExcelBridge(active);

			// Рендер самой сетки ячеек
			this.renderGrid(active);
		}

		renderGrid(sheet) {
			const table = document.getElementById('sheet-table');
			if (!table) return;
			table.innerHTML = '';

			const parsedSelected = this.parseCoord(this.selectedCell) || { cIdx: 0, rIdx: 0 };

			// 1. Верхний заголовок столбцов (Corner + A, B, C...)
			const thead = document.createElement('thead');
			const headerRow = document.createElement('tr');
			
			const cornerTh = document.createElement('th');
			cornerTh.className = 'corner-header';
			headerRow.appendChild(cornerTh);

			for (let c = 0; c < sheet.cols; c++) {
				const colName = this.idxToCol(c);
				const th = document.createElement('th');
				th.className = `col-header ${c === parsedSelected.cIdx ? 'selected-col' : ''}`;
				th.textContent = colName;
				headerRow.appendChild(th);
			}
			thead.appendChild(headerRow);
			table.appendChild(thead);

			// 2. Тело таблицы со строками и ячейками
			const tbody = document.createElement('tbody');

			for (let r = 0; r < sheet.rows; r++) {
				const tr = document.createElement('tr');
				const rowNum = r + 1;

				// Заголовок строки 1, 2, 3...
				const rowTh = document.createElement('td');
				rowTh.className = `row-header ${r === parsedSelected.rIdx ? 'selected-row' : ''}`;
				rowTh.textContent = rowNum;
				tr.appendChild(rowTh);

				// Ячейки в строке
				for (let c = 0; c < sheet.cols; c++) {
					const cellKey = `${this.idxToCol(c)}${rowNum}`;
					const td = document.createElement('td');
					td.className = `cell ${cellKey === this.selectedCell ? 'selected' : ''}`;
					td.dataset.coord = cellKey;

					// Вычисляем значение ячейки
					const displayVal = this.evalCell(cellKey, sheet.cells);
					if (typeof displayVal === 'number') {
						td.classList.add('numeric');
						td.textContent = displayVal;
					} else if (typeof displayVal === 'string' && displayVal.startsWith('#')) {
						td.classList.add('err-val');
						td.textContent = displayVal;
					} else {
						td.textContent = displayVal;
					}

					// Клик выбора ячейки
					td.onclick = () => this.selectCell(cellKey, sheet);
					// Двойной клик для прямого редактирования по месту
					td.ondblclick = () => this.startInlineEdit(td, cellKey, sheet);

					tr.appendChild(td);
				}
				tbody.appendChild(tr);
			}
			table.appendChild(tbody);

			// Обновляем строку формул
			this.syncFormulaBar(sheet);
		}

		selectCell(coord, sheet) {
			if (this.isEditing) this.commitInlineEdit(sheet);
			this.selectedCell = coord;

			document.querySelectorAll('td.cell.selected').forEach(el => el.classList.remove('selected'));
			const td = document.querySelector(`td.cell[data-coord="${coord}"]`);
			if (td) td.classList.add('selected');

			this.syncFormulaBar(sheet);
		}

		syncFormulaBar(sheet) {
			const fxBadge = document.getElementById('fx-cell');
			const fxInput = document.getElementById('formula-input');
			if (!fxBadge || !fxInput) return;

			fxBadge.textContent = this.selectedCell;
			fxInput.value = sheet.cells[this.selectedCell] ?? '';

			fxInput.oninput = (e) => {
				const val = e.target.value;
				if (val.trim() === '') {
					delete sheet.cells[this.selectedCell];
				} else {
					sheet.cells[this.selectedCell] = val;
				}
				this.persist();
				this.renderGrid(sheet);
			};

			fxInput.onkeydown = (e) => {
				if (e.key === 'Enter') {
					fxInput.blur();
					this.renderGrid(sheet);
				}
			};
		}

		startInlineEdit(td, coord, sheet) {
			this.isEditing = true;
			td.classList.add('editing');
			const raw = sheet.cells[coord] ?? '';

			td.innerHTML = `<input type="text" class="cell-editor" value="${raw.replace(/"/g, '&quot;')}" />`;
			const input = td.querySelector('input');
			input.focus();

			input.onkeydown = (e) => {
				if (e.key === 'Enter' || e.key === 'Tab') {
					e.preventDefault();
					this.commitInlineEdit(sheet);
					if (e.key === 'Tab') {
						const next = this.getNextCell(coord, 1, 0, sheet);
						this.selectCell(next, sheet);
					} else {
						const next = this.getNextCell(coord, 0, 1, sheet);
						this.selectCell(next, sheet);
					}
				}
				if (e.key === 'Escape') {
					this.isEditing = false;
					this.renderGrid(sheet);
				}
			};

			input.onblur = () => {
				if (this.isEditing) this.commitInlineEdit(sheet);
			};
		}

		commitInlineEdit(sheet) {
			const input = document.querySelector('input.cell-editor');
			if (input) {
				const val = input.value;
				if (val.trim() === '') {
					delete sheet.cells[this.selectedCell];
				} else {
					sheet.cells[this.selectedCell] = val;
				}
				this.persist();
			}
			this.isEditing = false;
			this.renderGrid(sheet);
		}

		getNextCell(coord, colDelta, rowDelta, sheet) {
			const p = this.parseCoord(coord);
			if (!p) return coord;
			const newC = Math.max(0, Math.min(sheet.cols - 1, p.cIdx + colDelta));
			const newR = Math.max(1, Math.min(sheet.rows, p.row + rowDelta));
			return `${this.idxToCol(newC)}${newR}`;
		}

		// === ИНТЕГРАЦИЯ С EXCEL / GOOGLE SHEETS ЧЕРЕЗ TSV ===

		initExcelBridge(sheet) {
			const copyBtn = document.getElementById('btn-copy-tsv');
			const pasteBtn = document.getElementById('btn-paste-tsv');
			const csvBtn = document.getElementById('btn-export-csv');

			// 1. Копирование сетки в буфер для вставки в Excel
			copyBtn.onclick = () => {
				let tsv = '';
				for (let r = 1; r <= sheet.rows; r++) {
					const rowVals = [];
					for (let c = 0; c < sheet.cols; c++) {
						const key = `${this.idxToCol(c)}${r}`;
						rowVals.push(this.evalCell(key, sheet.cells));
					}
					tsv += rowVals.join('\t') + '\n';
				}

				navigator.clipboard.writeText(tsv).then(() => {
					const prev = copyBtn.textContent;
					copyBtn.textContent = '✓ Скопировано для Excel!';
					copyBtn.classList.add('btn-copied');
					setTimeout(() => {
						copyBtn.textContent = prev;
						copyBtn.classList.remove('btn-copied');
					}, 1500);
				});
			};

			// 2. Вставка данных прямо из буфера Excel
			pasteBtn.onclick = async () => {
				try {
					const text = await navigator.clipboard.readText();
					if (!text.trim()) return alert('Буфер обмена пуст.');

					const rows = text.trim().split(/\r?\n/).map(line => line.split('\t'));
					const startCoord = this.parseCoord(this.selectedCell) || { cIdx: 0, row: 1 };

					rows.forEach((rowVals, rOffset) => {
						const targetRow = startCoord.row + rOffset;
						if (targetRow > sheet.rows) sheet.rows = targetRow;

						rowVals.forEach((val, cOffset) => {
							const targetColIdx = startCoord.cIdx + cOffset;
							if (targetColIdx >= sheet.cols) sheet.cols = targetColIdx + 1;

							const key = `${this.idxToCol(targetColIdx)}${targetRow}`;
							if (val.trim() === '') delete sheet.cells[key];
							else sheet.cells[key] = val.trim();
						});
					});

					this.persist();
					this.renderGrid(sheet);
					alert('Данные из Excel успешно импортированы в таблицу!');
				} catch (err) {
					alert('Не удалось прочитать буфер. Разрешите доступ к буферу в браузере.');
				}
			};

			// 3. Скачивание CSV
			csvBtn.onclick = () => {
				let csv = '';
				for (let r = 1; r <= sheet.rows; r++) {
					const rowVals = [];
					for (let c = 0; c < sheet.cols; c++) {
						const key = `${this.idxToCol(c)}${r}`;
						let v = this.evalCell(key, sheet.cells).toString();
						if (v.includes(',') || v.includes('"') || v.includes('\n')) {
							v = `"${v.replace(/"/g, '""')}"`;
						}
						rowVals.push(v);
					}
					csv += rowVals.join(',') + '\n';
				}

				const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${sheet.name}.csv`;
				a.click();
				URL.revokeObjectURL(url);
			};
		}

		// === ОПЕРАЦИИ СО СПИСКАМИ И ШАБЛОНАМИ ===

		instantiateTemplate(tpl) {
			const name = prompt('Название новой таблицы по шаблону:', `${tpl.name} (Копия)`);
			if (!name || !name.trim()) return;

			const newSheet = {
				id: 'sheet_' + Date.now(),
				name: name.trim(),
				cols: tpl.cols || 8,
				rows: tpl.rows || 20,
				cells: JSON.parse(JSON.stringify(tpl.cells || {}))
			};

			this.appData.files.push(newSheet);
			this.appData.activeId = newSheet.id;
			this.persist();
			this.render();
		}

		createNewFile() {
			const name = prompt('Название новой таблицы:', 'Новая таблица');
			if (!name || !name.trim()) return;

			const newSheet = {
				id: 'sheet_' + Date.now(),
				name: name.trim(),
				cols: 8,
				rows: 20,
				cells: {}
			};

			this.appData.files.push(newSheet);
			this.appData.activeId = newSheet.id;
			this.persist();
			this.render();
		}

		createNewTemplate() {
			const name = prompt('Название нового шаблона:', 'Новый шаблон таблицы');
			if (!name || !name.trim()) return;

			const newTpl = {
				id: 'tpl_' + Date.now(),
				name: name.trim(),
				cols: 6,
				rows: 15,
				cells: {}
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

		deleteItem(id, isTemplate) {
			const targetArray = isTemplate ? this.appData.templates : this.appData.files;
			const item = targetArray.find(x => x.id === id);
			if (!item) return;

			if (!confirm(`Удалить ${isTemplate ? 'шаблон' : 'таблицу'} "${item.name}"?`)) return;

			if (isTemplate) {
				this.appData.templates = this.appData.templates.filter(x => x.id !== id);
			} else {
				this.appData.files = this.appData.files.filter(x => x.id !== id);
			}

			if (this.appData.activeId === id) {
				this.appData.activeId = this.appData.files.length > 0 ? this.appData.files[0].id : null;
			}

			this.persist();
			this.render();
		}

		persist() {
			this.saveGlobal('sheet', this.appData);
		}
	};

})(NexusBehaviour);