(function(settingsJSON, role = "user", GM_getValue, GM_setValue, CONFIG) {

	const SCRIPT_ID = 'nexusTrello';
	const ROLE = role;

	const STORAGE_KEY = `nexus_${CONFIG.workspace}_trello`;
	const HUB_URL = `https://${CONFIG.dashboardHost}${CONFIG.dashboardPath}`;

	const DEFAULTS = {
		defaultColumns: [
			{ id: 'todo', title: 'To Do', cards: [{ id: 'c1', text: 'Запустить модуль' }] },
			{ id: 'in_progress', title: 'In Progress', cards: [] },
			{ id: 'done', title: 'Done', cards: [] }
		]
	};

	let boardData;
	let draggedCardId = null;
	let sourceColId = null;

	function addCustomCSS() {
		const style = document.createElement('style');
		style.id = `custom-${SCRIPT_ID}-css`;
		style.textContent = `
			* { box-sizing: border-box; }
			body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
			
			header { height: 56px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
			.back-link { color: #94a3b8; text-decoration: none; font-size: 13px; display: flex; align-items: center; gap: 6px; font-weight: 600; padding: 6px 10px; border-radius: 4px; background: #334155; }
			.back-link:hover { color: #f8fafc; background: #475569; }
			.title { font-weight: 700; font-size: 16px; color: #38bdf8; }
			
			main { flex-grow: 1; overflow-x: auto; padding: 20px; display: flex; gap: 16px; align-items: flex-start; }
			.col { background: #1e293b; border: 1px solid #334155; width: 280px; min-width: 280px; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; max-height: calc(100vh - 96px); }
			.col-header { font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
			.card-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; min-height: 40px; }
			.card { background: #334155; border: 1px solid #475569; padding: 10px; border-radius: 6px; cursor: grab; font-size: 14px; line-height: 1.4; }
			.card:active { cursor: grabbing; opacity: 0.6; }
			.add-btn { margin-top: 10px; background: transparent; border: 1px dashed #475569; color: #94a3b8; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; }
			.add-btn:hover { background: #334155; color: #f8fafc; }
		`;
		document.head.appendChild(style);
	}

	function runImmediate() {
		document.documentElement.innerHTML = `
			<head><title>Trello // ${CONFIG.workspace}</title></head>
			<body>
				<header>
					<a href="${HUB_URL}" class="back-link">← В Хаб</a>
					<div class="title">⚡ Kanban Board</div>
					<div style="width:70px;"></div>
				</header>
				<main id="board"></main>
			</body>`;
		addCustomCSS();
	}

	function runOnLoad() {
		boardData = GM_getValue(STORAGE_KEY, DEFAULTS.defaultColumns);
		render();
	}

	function render() {
		const board = document.getElementById('board');
		board.innerHTML = '';

		boardData.forEach(col => {
			const colEl = document.createElement('div');
			colEl.className = 'col';
			colEl.innerHTML = `
				<div class="col-header">
					<span>${col.title}</span>
					<span>${col.cards.length}</span>
				</div>
				<div class="card-list" data-col="${col.id}"></div>
				<button class="add-btn">+ Задача</button>
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
					persist();
					render();
				}
			};

			board.appendChild(colEl);
		});
	}

	function moveCard(fromId, toId, cardId) {
		const fromCol = boardData.find(c => c.id === fromId);
		const toCol = boardData.find(c => c.id === toId);
		const idx = fromCol.cards.findIndex(c => c.id === cardId);
		const [card] = fromCol.cards.splice(idx, 1);
		toCol.cards.push(card);

		persist();
		render();
	}

	function persist() {
		GM_setValue(STORAGE_KEY, boardData);
	}

	function main() {
		runImmediate();
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runOnLoad);
		} else {
			runOnLoad();
		}
	}

	main();
})(settingsJSON, role, GM_getValue, GM_setValue, CONFIG);