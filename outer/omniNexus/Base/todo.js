(function(settingsJSON, role = "user", GM_getValue, GM_setValue, CONFIG) {

	const SCRIPT_ID = 'nexusTodo';
	const ROLE = role;

	const STORAGE_KEY = `nexus_${CONFIG.workspace}_todo`;
	const HUB_URL = `https://${CONFIG.dashboardHost}${CONFIG.dashboardPath}`;

	const defaultData = {
		activeFileId: 'f_1',
		files: [
			{
				id: 'f_1',
				name: 'Задачи_на_сегодня.txt',
				items: [
					{ id: 'i_1', text: 'Проверить работу роутера omniNexus', done: true },
					{ id: 'i_2', text: 'Протестировать LiveServer', done: false }
				]
			},
			{
				id: 'f_2',
				name: 'Планы_по_скриптам.txt',
				items: [
					{ id: 'i_3', text: 'Написать парсер для портала LG', done: false }
				]
			}
		]
	};

	let appData;

	function addCustomCSS() {
		const style = document.createElement('style');
		style.id = `custom-${SCRIPT_ID}-css`;
		style.textContent = `
			* { box-sizing: border-box; }
			body { margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
			
			/* Верхняя навигация */
			header { height: 52px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
			.back-link { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 4px; background: #334155; display: flex; align-items: center; gap: 6px; }
			.back-link:hover { color: #f8fafc; background: #475569; }
			.header-title { font-weight: 700; font-size: 15px; color: #38bdf8; }

			/* Каркас приложения */
			.app-layout { flex-grow: 1; display: flex; overflow: hidden; }

			/* Левая колонка - Проводник */
			.explorer-pane { width: 260px; min-width: 260px; background: #111827; border-right: 1px solid #1f2937; display: flex; flex-direction: column; }
			.explorer-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; }
			.explorer-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
			.new-file-btn { background: #1f2937; border: 1px solid #374151; color: #38bdf8; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
			.new-file-btn:hover { background: #374151; color: #fff; }

			.file-list { flex-grow: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
			.file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; color: #d1d5db; transition: background 0.15s; }
			.file-item:hover { background: #1f2937; color: #fff; }
			.file-item.active { background: #0284c7; color: #fff; }
			.file-name-wrapper { display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.file-del-btn { opacity: 0; background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
			.file-item:hover .file-del-btn { opacity: 1; }
			.file-del-btn:hover { background: rgba(239,68,68,0.2); }

			/* Правая колонка - Содержимое чеклиста */
			.content-pane { flex-grow: 1; display: flex; flex-direction: column; background: #0f172a; padding: 24px 32px; overflow-y: auto; }
			.content-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
			.current-file-title { font-size: 20px; font-weight: 700; color: #f8fafc; margin: 0; }
			.progress-badge { font-size: 13px; color: #94a3b8; font-family: monospace; }

			/* Поле добавления задачи */
			.add-task-form { display: flex; gap: 8px; margin-bottom: 20px; }
			.add-task-input { flex-grow: 1; max-width: 600px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 10px 14px; color: #f8fafc; font-size: 14px; outline: none; }
			.add-task-input:focus { border-color: #38bdf8; }
			.add-task-btn { background: #0284c7; border: none; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
			.add-task-btn:hover { background: #0369a1; }

			/* Список строк */
			.task-list { display: flex; flex-direction: column; gap: 8px; max-width: 700px; }
			.task-row { display: flex; align-items: center; justify-content: space-between; background: #1e293b; border: 1px solid #334155; padding: 10px 14px; border-radius: 6px; transition: border-color 0.15s; }
			.task-row:hover { border-color: #475569; }
			.task-left { display: flex; align-items: center; gap: 12px; flex-grow: 1; }
			.task-checkbox { width: 18px; height: 18px; accent-color: #38bdf8; cursor: pointer; }
			.task-text { font-size: 14px; color: #f8fafc; word-break: break-word; }
			.task-row.done .task-text { text-decoration: line-through; color: #64748b; }
			.task-del-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
			.task-del-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
		`;
		document.head.appendChild(style);
	}

	function runImmediate() {
		document.documentElement.innerHTML = `
			<head><title>Notes // ${CONFIG.workspace}</title></head>
			<body>
				<header>
					<a href="${HUB_URL}" class="back-link">← В Хаб</a>
					<div class="header-title">📝 omniNexus Checklist</div>
					<div style="width:75px;"></div>
				</header>
				<div class="app-layout">
					<div class="explorer-pane">
						<div class="explorer-header">
							<span class="explorer-title">Проводник</span>
							<button class="new-file-btn" id="btn-new-file">+ Файл</button>
						</div>
						<div class="file-list" id="explorer-files"></div>
					</div>
					<div class="content-pane" id="editor-pane"></div>
				</div>
			</body>`;
		addCustomCSS();
	}

	function runOnLoad() {
		appData = GM_getValue(STORAGE_KEY, defaultData);
		document.getElementById('btn-new-file').onclick = createNewFile;
		render();
	}

	function render() {
		renderExplorer();
		renderContent();
	}

	function renderExplorer() {
		const listEl = document.getElementById('explorer-files');
		listEl.innerHTML = '';

		appData.files.forEach(file => {
			const item = document.createElement('div');
			item.className = `file-item ${file.id === appData.activeFileId ? 'active' : ''}`;
			
			item.innerHTML = `
				<div class="file-name-wrapper">
					<span>📄</span>
					<span>${file.name}</span>
				</div>
				<button class="file-del-btn" title="Удалить список">✕</button>
			`;

			item.onclick = (e) => {
				if (e.target.classList.contains('file-del-btn')) return;
				appData.activeFileId = file.id;
				persist();
				render();
			};

			item.querySelector('.file-del-btn').onclick = (e) => {
				e.stopPropagation();
				deleteFile(file.id);
			};

			listEl.appendChild(item);
		});
	}

	function renderContent() {
		const pane = document.getElementById('editor-pane');
		const activeFile = appData.files.find(f => f.id === appData.activeFileId);

		if (!activeFile) {
			pane.innerHTML = '<div style="color:#64748b;">Выберите или создайте список в проводнике слева.</div>';
			return;
		}

		const totalTasks = activeFile.items.length;
		const doneTasks = activeFile.items.filter(t => t.done).length;

		pane.innerHTML = `
			<div class="content-header">
				<h2 class="current-file-title">📄 ${activeFile.name}</h2>
				<span class="progress-badge">${doneTasks} / ${totalTasks} выполнено</span>
			</div>
			
			<div class="add-task-form">
				<input type="text" class="add-task-input" id="new-task-input" placeholder="Введите задачу и нажмите Enter..." autofocus />
				<button class="add-task-btn" id="add-task-btn">Добавить</button>
			</div>

			<div class="task-list" id="task-container"></div>
		`;

		const input = document.getElementById('new-task-input');
		const addBtn = document.getElementById('add-task-btn');

		const handleAdd = () => {
			const val = input.value.trim();
			if (!val) return;
			activeFile.items.push({ id: 'i_' + Date.now(), text: val, done: false });
			persist();
			render();
		};

		addBtn.onclick = handleAdd;
		input.onkeydown = (e) => {
			if (e.key === 'Enter') handleAdd();
		};

		const container = document.getElementById('task-container');

		activeFile.items.forEach(task => {
			const row = document.createElement('div');
			row.className = `task-row ${task.done ? 'done' : ''}`;

			row.innerHTML = `
				<div class="task-left">
					<input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} />
					<span class="task-text">${task.text}</span>
				</div>
				<button class="task-del-btn" title="Удалить задачу">✕</button>
			`;

			const checkbox = row.querySelector('.task-checkbox');
			checkbox.onchange = () => {
				task.done = checkbox.checked;
				persist();
				render();
			};

			row.querySelector('.task-del-btn').onclick = () => {
				activeFile.items = activeFile.items.filter(t => t.id !== task.id);
				persist();
				render();
			};

			container.appendChild(row);
		});
	}

	function createNewFile() {
		const name = prompt('Имя нового файла:', 'Новый_список.txt');
		if (!name || !name.trim()) return;

		const newFile = {
			id: 'f_' + Date.now(),
			name: name.trim().endsWith('.txt') ? name.trim() : `${name.trim()}.txt`,
			items: []
		};

		appData.files.push(newFile);
		appData.activeFileId = newFile.id;
		persist();
		render();
	}

	function deleteFile(fileId) {
		if (appData.files.length <= 1) {
			alert('Нельзя удалить последний оставшийся список.');
			return;
		}

		if (!confirm('Удалить этот список и все задачи внутри?')) return;

		appData.files = appData.files.filter(f => f.id !== fileId);
		if (appData.activeFileId === fileId) {
			appData.activeFileId = appData.files[0].id;
		}

		persist();
		render();
	}

	function persist() {
		GM_setValue(STORAGE_KEY, appData);
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