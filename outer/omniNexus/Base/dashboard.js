(function(settingsJSON, role = "user", GM_getValue, GM_setValue, CONFIG) {
	'use strict';

	const SCRIPT_ID = 'nexusDashboard';
	const ROLE = role;

	const DEFAULTS = {
		defaultColumns: [
			{ id: 'todo', title: 'To Do', cards: [{ id: 'c1', text: 'Проверить omniNexus' }] },
			{ id: 'in_progress', title: 'In Progress', cards: [] },
			{ id: 'done', title: 'Done', cards: [] }
		]
	};

	let config;
	let boardData;
	let draggedCardId = null;
	let sourceColId = null;

	const STORAGE_KEY = `nexus_${CONFIG.workspace}_trello`;
	const SETTINGS_KEY = `nexus_${CONFIG.workspace}_settings`;

	function print(...args) {
		if (ROLE === "dodev") {
			console.log(`==== [${SCRIPT_ID}]`, ...args);
		}
	}

	function loadConfig() {
		print('Обработка полученной конфигурации...', settingsJSON);
		let settingsData = {};
		try {
			if (settingsJSON && typeof settingsJSON === 'string') {
				settingsData = JSON.parse(settingsJSON);
			}
		} catch (e) {
			print('Ошибка парсинга JSON настроек. Используются defaults.', e);
			return DEFAULTS;
		}
		const finalConfig = { ...DEFAULTS, ...settingsData };
		print('Финальный конфиг:', finalConfig);
		return finalConfig;
	}

	function addCustomCSS() {
		const style = document.createElement('style');
		style.id = `custom-${SCRIPT_ID}-css`;
		style.textContent = `
			* { box-sizing: border-box; }
			body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; overflow: hidden; }
			#root { display: flex; height: 100vh; }
			aside { width: 250px; background: #1e293b; padding: 20px; border-right: 1px solid #334155; display: flex; flex-direction: column; gap: 10px; }
			aside h2 { margin: 0 0 10px 0; font-size: 18px; color: #38bdf8; }
			.role-badge { font-size: 11px; background: #334155; padding: 3px 8px; border-radius: 12px; width: fit-content; margin-bottom: 15px; color: #94a3b8; }
			aside button { background: #334155; border: 1px solid #475569; color: #f8fafc; padding: 10px 12px; border-radius: 6px; cursor: pointer; text-align: left; font-size: 14px; }
			aside button:hover { background: #475569; }
			main { flex-grow: 1; padding: 24px; overflow-x: auto; display: flex; flex-direction: column; }
			.board { display: flex; gap: 16px; align-items: flex-start; height: 100%; }
			.col { background: #1e293b; border: 1px solid #334155; width: 280px; min-width: 280px; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; max-height: calc(100vh - 80px); }
			.col-header { font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
			.card-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; min-height: 40px; }
			.card { background: #334155; border: 1px solid #475569; padding: 10px; border-radius: 6px; cursor: grab; font-size: 14px; line-height: 1.4; }
			.card:active { cursor: grabbing; opacity: 0.6; }
			.add-btn { margin-top: 10px; background: transparent; border: 1px dashed #475569; color: #94a3b8; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; }
			.add-btn:hover { background: #334155; color: #f8fafc; }
		`;
		document.head.appendChild(style);
	}

	function runImmediate() {
		print('Выполнение немедленных задач (Awake)...');
		document.documentElement.innerHTML = `<head><title>${CONFIG.workspace} Hub</title></head><body><div id="root"></div></body>`;
		addCustomCSS();
	}

	function runOnLoad() {
		print('Выполнение задач после монтирования DOM (Start)...');
		boardData = GM_getValue(STORAGE_KEY, config.defaultColumns);
		renderShell();
		renderTrello();
	}

	function renderShell() {
		const root = document.getElementById('root');
		root.innerHTML = `
			<aside>
				<h2>⚡ ${CONFIG.workspace}</h2>
				<span class="role-badge">Role: ${ROLE}</span>
				<button id="nav-board">Канбан-доска</button>
				<button id="nav-settings">Настройки модулей</button>
			</aside>
			<main id="view-container"></main>
		`;

		document.getElementById('nav-board').onclick = renderTrello;
		document.getElementById('nav-settings').onclick = renderSettings;
	}

	function renderTrello() {
		const view = document.getElementById('view-container');
		view.innerHTML = '<div class="board" id="kanban-board"></div>';
		const board = document.getElementById('kanban-board');

		boardData.forEach(col => {
			const colEl = document.createElement('div');
			colEl.className = 'col';

			colEl.innerHTML = `
				<div class="col-header">
					<span>${col.title}</span>
					<span>${col.cards.length}</span>
				</div>
				<div class="card-list" data-col="${col.id}"></div>
				<button class="add-btn">+ Добавить</button>
			`;

			const listEl = colEl.querySelector('.card-list');

			listEl.addEventListener('dragover', e => e.preventDefault());
			listEl.addEventListener('drop', () => {
				if (!draggedCardId || sourceColId === col.id) return;
				moveCard(sourceColId, col.id, draggedCardId);
			});

			col.cards.forEach(card => {
				const cardEl = document.createElement('div');
				cardEl.className = 'card';
				cardEl.draggable = true;
				cardEl.textContent = card.text;

				cardEl.addEventListener('dragstart', () => {
					draggedCardId = card.id;
					sourceColId = col.id;
				});

				cardEl.addEventListener('dragend', () => {
					draggedCardId = null;
					sourceColId = null;
				});

				listEl.appendChild(cardEl);
			});

			colEl.querySelector('.add-btn').onclick = () => {
				const text = prompt('Текст задачи:');
				if (text && text.trim()) {
					col.cards.push({ id: 'c_' + Date.now(), text: text.trim() });
					persistBoard();
					renderTrello();
				}
			};

			board.appendChild(colEl);
		});
	}

	function renderSettings() {
		const view = document.getElementById('view-container');
		const globalSettings = GM_getValue(SETTINGS_KEY, {});

		view.innerHTML = `
			<div style="max-width: 650px;">
				<h3 style="margin-top:0;">Настройки модулей (${CONFIG.workspace})</h3>
				<textarea id="settings-raw" style="width:100%;height:320px;background:#1e293b;color:#f8fafc;border:1px solid #334155;padding:12px;border-radius:6px;font-family:monospace;line-height:1.4;"></textarea>
				<button id="save-settings-btn" style="margin-top:10px;background:#0284c7;color:#fff;border:none;padding:8px 18px;border-radius:4px;cursor:pointer;">Сохранить конфигурацию</button>
			</div>
		`;

		const area = document.getElementById('settings-raw');
		area.value = JSON.stringify(globalSettings, null, 2);

		document.getElementById('save-settings-btn').onclick = () => {
			try {
				const parsed = JSON.parse(area.value);
				GM_setValue(SETTINGS_KEY, parsed);
				print('Конфигурация модулей успешно сохранена.');
				alert('Настройки сохранены');
			} catch (e) {
				alert('Ошибка парсинга JSON');
			}
		};
	}

	function moveCard(fromId, toId, cardId) {
		const fromCol = boardData.find(c => c.id === fromId);
		const toCol = boardData.find(c => c.id === toId);
		const idx = fromCol.cards.findIndex(c => c.id === cardId);
		const [card] = fromCol.cards.splice(idx, 1);
		toCol.cards.push(card);

		persistBoard();
		renderTrello();
	}

	function persistBoard() {
		GM_setValue(STORAGE_KEY, boardData);
	}

	function main() {
		config = loadConfig();
		runImmediate();

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runOnLoad);
		} else {
			runOnLoad();
		}
	}

	main();
})(settingsJSON, role, GM_getValue, GM_setValue, CONFIG);