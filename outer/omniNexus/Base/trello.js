var ModuleClass = (function(NexusBehaviour) {

	return class NexusTrello extends NexusBehaviour {

		defaults = {
			defaultColumns: [
				{
					id: 'col_1',
					title: 'Бэклог',
					cards: [
						{
							id: 'c_demo_1',
							title: 'Настроить рабочую среду omniNexus',
							description: 'Проверить работу омни-коннектора, протестировать кэш и права токена.',
							dueDate: '',
							tags: [{ name: 'Система', color: '#0284c7' }],
							checklist: [
								{ id: 'chk_1', text: 'Установить коннектор в Tampermonkey', done: true },
								{ id: 'chk_2', text: 'Проверить LiveServer или диск', done: true },
								{ id: 'chk_3', text: 'Запустить канбан', done: true }
							]
						}
					]
				},
				{ id: 'col_2', title: 'В работе', cards: [] },
				{ id: 'col_3', title: 'Готово', cards: [] }
			]
		};

		awake() {
			const hubUrl = `https://${this.CONFIG.dashboardHost}${this.CONFIG.dashboardPath}`;

			document.documentElement.innerHTML = `
				<head><title>Kanban // ${this.workspace}</title></head>
				<body>
					<header id="trello-header">
						<div class="header-left">
							<a href="${hubUrl}" class="back-link">← В Хаб</a>
							<span class="header-title">⚡ Kanban Studio</span>
							<input type="text" id="board-search" placeholder="Поиск по карточкам и тегам..." />
						</div>
						<div class="header-right">
							<button class="hdr-btn" id="btn-add-col">+ Колонка</button>
						</div>
					</header>
					<main id="board-canvas"></main>
					<div id="modal-container"></div>
				</body>`;

			this.addCSS(`
				* { box-sizing: border-box; }
				body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; user-select: none; }
				
				/* Шапка */
				header { height: 56px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0; gap: 16px; }
				.header-left, .header-right { display: flex; align-items: center; gap: 12px; }
				.header-left { flex-grow: 1; max-width: 800px; }
				.back-link { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 4px; background: #334155; transition: background 0.15s; }
				.back-link:hover { color: #f8fafc; background: #475569; }
				.header-title { font-weight: 700; font-size: 16px; color: #38bdf8; white-space: nowrap; }
				#board-search { flex-grow: 1; max-width: 380px; background: #0f172a; border: 1px solid #334155; padding: 6px 12px; border-radius: 4px; color: #f8fafc; font-size: 13px; outline: none; }
				#board-search:focus { border-color: #38bdf8; }
				.hdr-btn { background: #0284c7; border: none; color: white; padding: 7px 14px; border-radius: 4px; font-weight: 600; font-size: 13px; cursor: pointer; }
				.hdr-btn:hover { background: #0369a1; }

				/* Доска */
				#board-canvas { flex-grow: 1; overflow-x: auto; padding: 20px; display: flex; gap: 16px; align-items: flex-start; }
				.col { background: #1e293b; border: 1px solid #334155; width: 300px; min-width: 300px; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; max-height: calc(100vh - 96px); flex-shrink: 0; }
				.col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #334155; }
				.col-title { font-weight: 700; font-size: 14px; color: #f8fafc; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.col-badge { background: #334155; color: #94a3b8; font-size: 11px; padding: 2px 6px; border-radius: 10px; font-weight: normal; }
				.col-actions { display: flex; gap: 4px; }
				.icon-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 12px; }
				.icon-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
				
				/* Карточки */
				.card-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; min-height: 40px; padding: 2px; }
				.card { background: #334155; border: 1px solid #475569; padding: 12px; border-radius: 6px; cursor: pointer; transition: transform 0.1s, border-color 0.15s; display: flex; flex-direction: column; gap: 6px; }
				.card:hover { border-color: #38bdf8; transform: translateY(-1px); }
				.card.dragging { opacity: 0.4; }
				.card-tags { display: flex; flex-wrap: wrap; gap: 4px; }
				.tag-pill { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; color: white; }
				.card-title { font-size: 14px; font-weight: 600; line-height: 1.3; color: #f8fafc; word-break: break-word; }
				
				/* Индикаторы карточки */
				.card-badges { display: flex; gap: 8px; align-items: center; font-size: 11px; color: #94a3b8; margin-top: 4px; flex-wrap: wrap; }
				.badge-item { display: flex; align-items: center; gap: 3px; background: rgba(15, 23, 42, 0.4); padding: 2px 5px; border-radius: 3px; }
				.badge-overdue { color: #f87171; background: rgba(239, 68, 68, 0.15); font-weight: 700; }

				.add-card-container { margin-top: 8px; }
				.quick-add-btn { background: transparent; border: 1px dashed #475569; color: #94a3b8; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; text-align: left; }
				.quick-add-btn:hover { background: #334155; color: #f8fafc; }
				.quick-add-form { display: none; flex-direction: column; gap: 6px; }
				.quick-add-input { background: #0f172a; border: 1px solid #38bdf8; color: #f8fafc; padding: 8px; border-radius: 4px; font-size: 13px; outline: none; }
				.quick-actions { display: flex; gap: 6px; }
				.btn-sub { padding: 5px 10px; font-size: 12px; border-radius: 3px; border: none; cursor: pointer; font-weight: 600; }
				.btn-save { background: #0284c7; color: white; }
				.btn-cancel { background: transparent; color: #94a3b8; }

				/* Модальное окно */
				#modal-container { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(2px); z-index: 9999; justify-content: center; align-items: center; padding: 20px; }
				.modal-box { background: #1e293b; border: 1px solid #475569; border-radius: 8px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); user-select: text; }
				.modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
				.modal-title-input { background: #0f172a; border: 1px solid #334155; color: #f8fafc; font-size: 18px; font-weight: 700; padding: 8px 12px; border-radius: 4px; width: 100%; outline: none; }
				.modal-title-input:focus { border-color: #38bdf8; }
				.close-modal-btn { background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; line-height: 1; }
				.close-modal-btn:hover { color: #f8fafc; }
				
				.modal-row { display: flex; gap: 16px; flex-wrap: wrap; }
				.modal-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 200px; }
				.modal-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #94a3b8; }
				.modal-date-input { background: #0f172a; border: 1px solid #334155; color: #f8fafc; padding: 6px 10px; border-radius: 4px; font-size: 13px; outline: none; color-scheme: dark; }

				.modal-desc-area { width: 100%; min-height: 100px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; padding: 10px; border-radius: 4px; font-family: inherit; font-size: 13px; resize: vertical; outline: none; }
				.modal-desc-area:focus { border-color: #38bdf8; }

				/* Чеклист в модалке */
				.progress-bar-bg { background: #0f172a; height: 6px; border-radius: 3px; overflow: hidden; margin: 4px 0 8px 0; }
				.progress-bar-fill { background: #10b981; height: 100%; width: 0%; transition: width 0.2s ease; }
				.modal-chk-list { display: flex; flex-direction: column; gap: 6px; }
				.chk-item { display: flex; align-items: center; justify-content: space-between; background: #0f172a; padding: 6px 10px; border-radius: 4px; border: 1px solid #334155; }
				.chk-left { display: flex; align-items: center; gap: 8px; flex-grow: 1; }
				.chk-item.done span { text-decoration: line-through; color: #64748b; }
				.chk-del { background: transparent; border: none; color: #64748b; cursor: pointer; }
				.chk-del:hover { color: #ef4444; }
				.add-chk-row { display: flex; gap: 6px; margin-top: 6px; }
				.add-chk-input { flex-grow: 1; background: #0f172a; border: 1px solid #334155; padding: 6px 10px; border-radius: 4px; color: #f8fafc; font-size: 13px; outline: none; }
				
				/* Теги в модалке */
				.tags-container { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
				.tag-del-btn { cursor: pointer; margin-left: 4px; font-weight: bold; }
				.new-tag-btn { background: #334155; border: 1px dashed #64748b; color: #94a3b8; padding: 2px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; }
				
				.modal-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 16px; }
				.danger-btn { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid #ef4444; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600; }
				.danger-btn:hover { background: #ef4444; color: white; }
				.primary-btn { background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600; }
			`);
		}

		start() {
			const rawData = this.loadGlobal('trello', this.config.defaultColumns);
			this.boardData = this.migrate(rawData);
			
			this.filterText = '';
			this.draggedCardId = null;
			this.sourceColId = null;

			this.initGlobalEvents();
			this.render();
		}

		// Автоматическая миграция со старого формата карточек-строк
		migrate(raw) {
			let cols = Array.isArray(raw) ? raw : (raw.columns || this.defaults.defaultColumns);
			return cols.map(col => ({
				id: col.id || 'col_' + Date.now(),
				title: col.title || 'Новая колонка',
				cards: (col.cards || []).map(c => {
					if (typeof c === 'string') {
						return { id: 'c_' + Date.now() + Math.random(), title: c, description: '', tags: [], checklist: [], dueDate: '' };
					}
					return {
						id: c.id || ('c_' + Date.now() + Math.random()),
						title: c.title || c.text || 'Без названия',
						description: c.description || '',
						tags: c.tags || [],
						checklist: c.checklist || [],
						dueDate: c.dueDate || ''
					};
				})
			}));
		}

		initGlobalEvents() {
			document.getElementById('btn-add-col').onclick = () => this.addColumn();
			
			const search = document.getElementById('board-search');
			search.oninput = (e) => {
				this.filterText = e.target.value.trim().toLowerCase();
				this.render();
			};

			window.onkeydown = (e) => {
				if (e.key === 'Escape') this.closeModal();
			};

			const modalCont = document.getElementById('modal-container');
			modalCont.onclick = (e) => {
				if (e.target === modalCont) this.closeModal();
			};
		}

		render() {
			const canvas = document.getElementById('board-canvas');
			canvas.innerHTML = '';

			this.boardData.forEach(col => {
				const colEl = document.createElement('div');
				colEl.className = 'col';

				// Фильтрация карточек
				const visibleCards = col.cards.filter(c => {
					if (!this.filterText) return true;
					const inTitle = c.title.toLowerCase().includes(this.filterText);
					const inDesc = (c.description || '').toLowerCase().includes(this.filterText);
					const inTags = (c.tags || []).some(t => t.name.toLowerCase().includes(this.filterText));
					return inTitle || inDesc || inTags;
				});

				colEl.innerHTML = `
					<div class="col-header">
						<div class="col-title" title="Двойной клик для переименования">
							<span>${col.title}</span>
							<span class="col-badge">${visibleCards.length}</span>
						</div>
						<div class="col-actions">
							<button class="icon-btn del-col-btn" title="Удалить колонку">✕</button>
						</div>
					</div>
					<div class="card-list" data-col="${col.id}"></div>
					<div class="add-card-container">
						<button class="quick-add-btn">+ Добавить карточку</button>
						<div class="quick-add-form">
							<input type="text" class="quick-add-input" placeholder="Заголовок карточки..." />
							<div class="quick-actions">
								<button class="btn-sub btn-save">Добавить</button>
								<button class="btn-sub btn-cancel">Отмена</button>
							</div>
						</div>
					</div>
				`;

				// Двойной клик на заголовок колонки для переименования
				colEl.querySelector('.col-title').ondblclick = () => this.renameColumn(col.id);
				colEl.querySelector('.del-col-btn').onclick = () => this.deleteColumn(col.id);

				// Логика добавления карточки
				const addBtn = colEl.querySelector('.quick-add-btn');
				const addForm = colEl.querySelector('.quick-add-form');
				const input = colEl.querySelector('.quick-add-input');
				const saveBtn = colEl.querySelector('.btn-save');
				const cancelBtn = colEl.querySelector('.btn-cancel');

				const submitNewCard = () => {
					const val = input.value.trim();
					if (val) {
						col.cards.push({
							id: 'c_' + Date.now(),
							title: val,
							description: '',
							tags: [],
							checklist: [],
							dueDate: ''
						});
						this.persist();
						this.render();
					}
				};

				addBtn.onclick = () => {
					addBtn.style.display = 'none';
					addForm.style.display = 'flex';
					input.focus();
				};

				cancelBtn.onclick = () => {
					addForm.style.display = 'none';
					addBtn.style.display = 'block';
					input.value = '';
				};

				saveBtn.onclick = submitNewCard;
				input.onkeydown = (e) => {
					if (e.key === 'Enter') submitNewCard();
					if (e.key === 'Escape') cancelBtn.click();
				};

				// Drag & Drop зоны
				const listEl = colEl.querySelector('.card-list');
				listEl.addEventListener('dragover', e => e.preventDefault());
				listEl.addEventListener('drop', () => {
					if (!this.draggedCardId || this.sourceColId === col.id) return;
					this.moveCard(this.sourceColId, col.id, this.draggedCardId);
				});

				// Рендер карточек
				visibleCards.forEach(card => {
					const cardEl = this.createCardElement(card, col.id);
					listEl.appendChild(cardEl);
				});

				canvas.appendChild(colEl);
			});
		}

		createCardElement(card, colId) {
			const el = document.createElement('div');
			el.className = 'card';
			el.draggable = true;

			// Теги
			let tagsHTML = '';
			if (card.tags && card.tags.length > 0) {
				tagsHTML = `<div class="card-tags">${card.tags.map(t => `<span class="tag-pill" style="background:${t.color}">${t.name}</span>`).join('')}</div>`;
			}

			// Индикаторы
			let badgesHTML = '';
			const chkTotal = (card.checklist || []).length;
			const chkDone = (card.checklist || []).filter(c => c.done).length;
			
			if (chkTotal > 0) {
				badgesHTML += `<div class="badge-item">☑ ${chkDone}/${chkTotal}</div>`;
			}
			if (card.description) {
				badgesHTML += `<div class="badge-item">≡</div>`;
			}
			if (card.dueDate) {
				const isOverdue = new Date(card.dueDate) < new Date().setHours(0,0,0,0);
				badgesHTML += `<div class="badge-item ${isOverdue ? 'badge-overdue' : ''}">📅 ${card.dueDate.substring(5)}</div>`;
			}

			el.innerHTML = `
				${tagsHTML}
				<div class="card-title">${card.title}</div>
				${badgesHTML ? `<div class="card-badges">${badgesHTML}</div>` : ''}
			`;

			el.addEventListener('dragstart', (e) => {
				this.draggedCardId = card.id;
				this.sourceColId = colId;
				setTimeout(() => el.classList.add('dragging'), 0);
			});

			el.addEventListener('dragend', () => {
				el.classList.remove('dragging');
				this.draggedCardId = null;
				this.sourceColId = null;
			});

			el.onclick = () => this.openCardModal(card, colId);

			return el;
		}

		// Модалка просмотра и редактирования
		openCardModal(card, colId) {
			const container = document.getElementById('modal-container');
			container.style.display = 'flex';

			const chkTotal = card.checklist.length;
			const chkDone = card.checklist.filter(c => c.done).length;
			const progressPercent = chkTotal === 0 ? 0 : Math.round((chkDone / chkTotal) * 100);

			container.innerHTML = `
				<div class="modal-box">
					<div class="modal-header">
						<input type="text" class="modal-title-input" id="m-title" value="${card.title}" />
						<button class="close-modal-btn" id="m-close">✕</button>
					</div>

					<div class="modal-row">
						<div class="modal-field">
							<span class="modal-label">Дедлайн</span>
							<input type="date" class="modal-date-input" id="m-due" value="${card.dueDate || ''}" />
						</div>
						<div class="modal-field">
							<span class="modal-label">Теги</span>
							<div class="tags-container" id="m-tags">
								${card.tags.map((t, idx) => `
									<span class="tag-pill" style="background:${t.color}">
										${t.name} <span class="tag-del-btn" data-tag="${idx}">✕</span>
									</span>
								`).join('')}
								<button class="new-tag-btn" id="m-add-tag">+ Добавить тег</button>
							</div>
						</div>
					</div>

					<div class="modal-field">
						<span class="modal-label">Описание</span>
						<textarea class="modal-desc-area" id="m-desc" placeholder="Добавьте более подробное описание задачи...">${card.description || ''}</textarea>
					</div>

					<div class="modal-field">
						<div style="display:flex;justify-content:space-between;align-items:center;">
							<span class="modal-label">Чек-лист</span>
							<span style="font-size:12px;color:#10b981;">${progressPercent}%</span>
						</div>
						<div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${progressPercent}%;"></div></div>
						<div class="modal-chk-list" id="m-chk-list">
							${card.checklist.map(item => `
								<div class="chk-item ${item.done ? 'done' : ''}">
									<div class="chk-left">
										<input type="checkbox" data-chk="${item.id}" ${item.done ? 'checked' : ''} />
										<span>${item.text}</span>
									</div>
									<button class="chk-del" data-del-chk="${item.id}">✕</button>
								</div>
							`).join('')}
						</div>
						<div class="add-chk-row">
							<input type="text" class="add-chk-input" id="m-new-chk" placeholder="Добавить пункт чек-листа..." />
							<button class="btn-sub btn-save" id="m-add-chk-btn">Добавить</button>
						</div>
					</div>

					<div class="modal-footer">
						<button class="danger-btn" id="m-delete-card">Удалить карточку</button>
						<button class="primary-btn" id="m-save">Готово</button>
					</div>
				</div>
			`;

			// Слушатели модалки
			document.getElementById('m-close').onclick = () => this.closeModal();
			document.getElementById('m-save').onclick = () => this.closeModal();

			// Сохранение заголовка, описания, даты на лету
			document.getElementById('m-title').oninput = (e) => { card.title = e.target.value.trim() || 'Без названия'; this.persist(); };
			document.getElementById('m-desc').oninput = (e) => { card.description = e.target.value; this.persist(); };
			document.getElementById('m-due').onchange = (e) => { card.dueDate = e.target.value; this.persist(); };

			// Удаление карточки
			document.getElementById('m-delete-card').onclick = () => {
				if (confirm('Удалить эту карточку навсегда?')) {
					const col = this.boardData.find(c => c.id === colId);
					col.cards = col.cards.filter(c => c.id !== card.id);
					this.persist();
					this.closeModal();
					this.render();
				}
			};

			// Чек-листы
			document.getElementById('m-chk-list').onchange = (e) => {
				if (e.target.dataset.chk) {
					const item = card.checklist.find(i => i.id === e.target.dataset.chk);
					if (item) {
						item.done = e.target.checked;
						this.persist();
						this.openCardModal(card, colId); // перерисовать прогресс
					}
				}
			};

			document.getElementById('m-chk-list').onclick = (e) => {
				if (e.target.dataset.delChk) {
					card.checklist = card.checklist.filter(i => i.id !== e.target.dataset.delChk);
					this.persist();
					this.openCardModal(card, colId);
				}
			};

			const addChk = () => {
				const inp = document.getElementById('m-new-chk');
				const val = inp.value.trim();
				if (val) {
					card.checklist.push({ id: 'chk_' + Date.now(), text: val, done: false });
					this.persist();
					this.openCardModal(card, colId);
				}
			};
			document.getElementById('m-add-chk-btn').onclick = addChk;
			document.getElementById('m-new-chk').onkeydown = (e) => { if (e.key === 'Enter') addChk(); };

			// Теги
			document.getElementById('m-tags').onclick = (e) => {
				if (e.target.dataset.tag) {
					card.tags.splice(parseInt(e.target.dataset.tag), 1);
					this.persist();
					this.openCardModal(card, colId);
				}
			};

			document.getElementById('m-add-tag').onclick = () => {
				const name = prompt('Название тега:');
				if (name && name.trim()) {
					const colors = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
					const randomColor = colors[Math.floor(Math.random() * colors.length)];
					card.tags.push({ name: name.trim(), color: randomColor });
					this.persist();
					this.openCardModal(card, colId);
				}
			};
		}

		closeModal() {
			document.getElementById('modal-container').style.display = 'none';
			this.render();
		}

		// Операции с колонками
		addColumn() {
			const name = prompt('Название новой колонки:', 'Новая колонка');
			if (name && name.trim()) {
				this.boardData.push({
					id: 'col_' + Date.now(),
					title: name.trim(),
					cards: []
				});
				this.persist();
				this.render();
			}
		}

		renameColumn(colId) {
			const col = this.boardData.find(c => c.id === colId);
			if (!col) return;
			const newName = prompt('Новое название колонки:', col.title);
			if (newName && newName.trim()) {
				col.title = newName.trim();
				this.persist();
				this.render();
			}
		}

		deleteColumn(colId) {
			const col = this.boardData.find(c => c.id === colId);
			if (!col) return;

			if (col.cards.length > 0) {
				if (!confirm(`В колонке "${col.title}" есть ${col.cards.length} карточек. Удалить колонку вместе со всеми задачами?`)) return;
			} else {
				if (!confirm(`Удалить колонку "${col.title}"?`)) return;
			}

			this.boardData = this.boardData.filter(c => c.id !== colId);
			this.persist();
			this.render();
		}

		moveCard(fromId, toId, cardId) {
			const fromCol = this.boardData.find(c => c.id === fromId);
			const toCol = this.boardData.find(c => c.id === toId);
			if (!fromCol || !toCol) return;

			const idx = fromCol.cards.findIndex(c => c.id === cardId);
			if (idx === -1) return;

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