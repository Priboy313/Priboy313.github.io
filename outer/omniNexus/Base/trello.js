var ModuleClass = (function(NexusBehaviour) {

	return class NexusTrello extends NexusBehaviour {

		defaults = {
			defaultColumns: [
				{ id: 'todo', title: 'To Do', cards: [{ id: 'c1', text: 'Запустить модуль' }] },
				{ id: 'in_progress', title: 'In Progress', cards: [] },
				{ id: 'done', title: 'Done', cards: [] }
			]
		};

		awake() {
			const hubUrl = `https://${this.CONFIG.dashboardHost}${this.CONFIG.dashboardPath}`;

			document.documentElement.innerHTML = `
				<head><title>Trello // ${this.workspace}</title></head>
				<body>
					<header>
						<a href="${hubUrl}" class="back-link">← В Хаб</a>
						<div class="title">⚡ Kanban Board</div>
						<div style="width:70px;"></div>
					</header>
					<main id="board"></main>
				</body>`;

			this.addCSS(`
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
			`);
		}

		start() {
			this.boardData = this.loadGlobal('trello', this.config.defaultColumns);
			this.draggedCardId = null;
			this.sourceColId = null;
			this.render();
		}

		render() {
			const board = document.getElementById('board');
			board.innerHTML = '';

			this.boardData.forEach(col => {
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
					if (!this.draggedCardId || this.sourceColId === col.id) return;
					this.moveCard(this.sourceColId, col.id, this.draggedCardId);
				});

				col.cards.forEach(card => {
					const cardEl = document.createElement('div');
					cardEl.className = 'card';
					cardEl.draggable = true;
					cardEl.textContent = card.text;

					cardEl.addEventListener('dragstart', () => {
						this.draggedCardId = card.id;
						this.sourceColId = col.id;
					});

					cardEl.addEventListener('dragend', () => {
						this.draggedCardId = null;
						this.sourceColId = null;
					});

					listEl.appendChild(cardEl);
				});

				colEl.querySelector('.add-btn').onclick = () => {
					const text = prompt('Текст задачи:');
					if (text && text.trim()) {
						col.cards.push({ id: 'c_' + Date.now(), text: text.trim() });
						this.persist();
						this.render();
					}
				};

				board.appendChild(colEl);
			});
		}

		moveCard(fromId, toId, cardId) {
			const fromCol = this.boardData.find(c => c.id === fromId);
			const toCol = this.boardData.find(c => c.id === toId);
			const idx = fromCol.cards.findIndex(c => c.id === cardId);
			const [card] = fromCol.cards.splice(idx, 1);
			toCol.cards.push(card);

			this.persist();
			this.render();
		}

		persist() {
			this.saveGlobal('trello', this.boardData);
		}
	};

})(NexusBehaviour);