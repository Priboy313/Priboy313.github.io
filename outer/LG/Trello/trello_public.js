// trello_public.js
(function(settingsJSON, role = "user", GM_getValue, GM_setValue) {

	const SCRIPT_ID = 'LocalTrello';
	console.log(`========== ${SCRIPT_ID} PUBLIC LOADED ==========`);

	// Дефолтные данные (если зашли впервые)
	const defaultData = [
		{ id: 'col_1', title: 'To Do', cards: [{ id: 'c_1', text: 'Проверить коннектор' }] },
		{ id: 'col_2', title: 'In Progress', cards: [] },
		{ id: 'col_3', title: 'Done', cards: [] }
	];

	// Получаем сохраненные данные ИЗ КЭША TAMPERMONKEY
	let boardData = GM_getValue('trello_board_data', defaultData);

	// Переменные для перетаскивания (Drag and Drop)
	let draggedCardId = null;
	let sourceColId = null;

	function main() {
		// Очищаем заглушку коннектора и рисуем Trello
		document.documentElement.innerHTML = '<head><title>Мой Trello</title></head><body></body>';
		injectStyles();
		
		const header = document.createElement('h1');
		header.textContent = 'Локальная Канбан-доска';
		document.body.appendChild(header);

		const board = document.createElement('div');
		board.id = 'board';
		document.body.appendChild(board);

		renderBoard();
	}

	function injectStyles() {
		const style = document.createElement('style');
		style.innerHTML = `
			body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0079bf; padding: 20px; margin: 0; }
			h1 { color: white; text-align: center; margin-top: 0; }
			#board { display: flex; gap: 20px; align-items: flex-start; overflow-x: auto; padding-bottom: 20px; }
			.column { background: #ebecf0; border-radius: 8px; width: 300px; min-width: 300px; padding: 10px; box-sizing: border-box; }
			.column-title { font-weight: bold; margin-bottom: 10px; padding: 5px; color: #172b4d; }
			.card { background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; cursor: grab; box-shadow: 0 1px 2px rgba(9,30,66,.25); word-wrap: break-word; color: #172b4d; }
			.card:active { cursor: grabbing; }
			.add-card-btn { background: rgba(9,30,66,.04); border: none; width: 100%; padding: 10px; cursor: pointer; text-align: left; border-radius: 4px; color: #5e6c84; }
			.add-card-btn:hover { background: rgba(9,30,66,.08); color: #172b4d; }
		`;
		document.head.appendChild(style);
	}

	function renderBoard() {
		const board = document.getElementById('board');
		board.innerHTML = '';

		boardData.forEach(col => {
			const colEl = document.createElement('div');
			colEl.className = 'column';
			
			const titleEl = document.createElement('div');
			titleEl.className = 'column-title';
			titleEl.textContent = col.title;
			colEl.appendChild(titleEl);

			// Зона сброса карточки (Drop Zone)
			colEl.addEventListener('dragover', e => e.preventDefault());
			colEl.addEventListener('drop', e => {
				e.preventDefault();
				if (draggedCardId) moveCard(sourceColId, col.id, draggedCardId);
			});

			// Рендер карточек
			col.cards.forEach(card => {
				const cardEl = document.createElement('div');
				cardEl.className = 'card';
				cardEl.draggable = true;
				cardEl.textContent = card.text;

				// Логика захвата (Drag)
				cardEl.addEventListener('dragstart', (e) => {
					draggedCardId = card.id;
					sourceColId = col.id;
					setTimeout(() => cardEl.style.opacity = '0.5', 0);
				});
				cardEl.addEventListener('dragend', () => {
					cardEl.style.opacity = '1';
					draggedCardId = null;
					sourceColId = null;
				});

				colEl.appendChild(cardEl);
			});

			// Кнопка добавления карточки
			const addBtn = document.createElement('button');
			addBtn.className = 'add-card-btn';
			addBtn.textContent = '+ Добавить карточку';
			addBtn.onclick = () => {
				const text = prompt('Введите текст карточки:');
				if (text && text.trim() !== "") {
					col.cards.push({ id: 'c_' + Date.now(), text: text });
					saveData();
					renderBoard();
				}
			};
			colEl.appendChild(addBtn);

			board.appendChild(colEl);
		});
	}

	function moveCard(fromColId, toColId, cardId) {
		if (fromColId === toColId) return;

		const fromCol = boardData.find(c => c.id === fromColId);
		const toCol = boardData.find(c => c.id === toColId);
		
		const cardIndex = fromCol.cards.findIndex(c => c.id === cardId);
		const [card] = fromCol.cards.splice(cardIndex, 1);
		toCol.cards.push(card);

		saveData();
		renderBoard();
	}

	function saveData() {
		// Используем прокинутую функцию для сохранения в кэш
		GM_setValue('trello_board_data', boardData);
	}

	// Запуск
	main();

})(settingsJSON, role, GM_getValue, GM_setValue);