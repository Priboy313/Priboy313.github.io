var ModuleClass = (function(NexusBehaviour) {

	return class OmniWord extends NexusBehaviour.Explorer {

		moduleTitle = '📄 omniWord Studio';
		storageKey = 'word';
		fileIcon = '📝';
		templateIcon = '📑';
		defaultFileName = 'Новый документ';
		defaultTemplateName = 'Новый шаблон';
		emptyStateIcon = '📂';
		emptyStateTitle = 'Нет открытых документов';
		emptyStateDesc = 'Выберите документ или шаблон в проводнике слева, либо создайте новый.';

		defaults = {
			defaultData: {
				activeId: 'doc_1',
				isTemplatesOpen: true,
				isMonospace: false,
				files: [
					{ id: 'doc_1', name: 'Черновик', content: 'Текст заметки...' }
				],
				templates: [
					{ id: 'tpl_1', name: 'Баг-репорт', content: '### [BUG] Краткое описание\n\n**Окружение:**\n- ТВ: \n- webOS: \n\n**Шаги:**\n1. \n\n**Результат:**\n' }
				]
			}
		};

		createFileData(name) { return { content: '' }; }
		createTemplateData(name) { return { content: '' }; }
		cloneTemplateData(tpl) { return { content: tpl.content || '' }; }

		renderEditor(active, isTemplate, pane) {
			const text = active.content || '';

			// Подключаем недостающие стили редактора
			this.addCSS(`
				.doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-shrink: 0; }
				.doc-title-wrap { display: flex; align-items: center; gap: 10px; }
				.doc-title { font-size: 20px; font-weight: 700; color: #f8fafc; margin: 0; cursor: pointer; display: flex; align-items: center; gap: 8px; }
				.doc-title:hover { color: #38bdf8; }
				.tpl-badge { font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

				.doc-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; gap: 8px; flex-wrap: wrap; }
				.toolbar-btns { display: flex; gap: 6px; align-items: center; }
				.tool-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
				.tool-btn:hover { background: #334155; color: #f8fafc; }
				.tool-btn.active { background: #0284c7; border-color: #38bdf8; color: white; }
				.tool-btn.primary-tpl { background: #0284c7; border-color: #0284c7; color: #fff; }
				.tool-btn.primary-tpl:hover { background: #0369a1; }
				.tool-btn.btn-copied { background: #10b981 !important; border-color: #10b981 !important; color: white !important; }

				.doc-stats { font-size: 12px; color: #64748b; font-family: monospace; display: flex; gap: 12px; }

				.editor-wrapper { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
				.doc-textarea { width: 100%; flex-grow: 1; background: #111827; border: 1px solid #334155; border-radius: 6px; padding: 18px 20px; color: #f8fafc; font-size: 14px; line-height: 1.6; outline: none; resize: none; tab-size: 4; }
				.doc-textarea:focus { border-color: #38bdf8; }
				.doc-textarea.monospace { font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; }
			`);

			pane.innerHTML = `
				<div class="doc-header">
					<div class="doc-title-wrap">
						<h2 class="doc-title" id="doc-title" title="Кликните для переименования">
							<span>${isTemplate ? this.templateIcon : this.fileIcon} ${active.name}</span>
							<span style="font-size:14px;color:#64748b;">✏️</span>
						</h2>
						${isTemplate ? '<span class="tpl-badge">Шаблон</span>' : ''}
					</div>
					<div class="doc-stats" id="doc-stats">Символов: ${text.length}</div>
				</div>

				<div class="doc-toolbar">
					<div class="toolbar-btns">
						${isTemplate ? `<button class="tool-btn primary-tpl" id="btn-use-tpl">⚡ Создать документ по шаблону</button>` : ''}
						<button class="tool-btn" id="btn-copy-all">Копировать всё</button>
						<button class="tool-btn" id="btn-download">Скачать .txt</button>
						<button class="tool-btn ${this.appData.isMonospace ? 'active' : ''}" id="btn-toggle-font">&lt;/&gt; Моноширинный</button>
						<button class="tool-btn" id="btn-duplicate">📋 Копия</button>
					</div>
				</div>

				<div class="editor-wrapper">
					<textarea class="doc-textarea ${this.appData.isMonospace ? 'monospace' : ''}" id="doc-editor" placeholder="Начните вводить текст...">${text}</textarea>
				</div>
			`;

			const textarea = document.getElementById('doc-editor');
			this.updateStats(text);

			document.getElementById('doc-title').onclick = () => this.renameItem(active);

			if (isTemplate) {
				document.getElementById('btn-use-tpl').onclick = () => this.instantiateTemplate(active);
			}

			// Автосохранение
			textarea.oninput = (e) => {
				active.content = e.target.value;
				this.updateStats(e.target.value);
				this.persist();
			};

			// Поддержка клавиши TAB
			textarea.onkeydown = (e) => {
				if (e.key === 'Tab') {
					e.preventDefault();
					const start = textarea.selectionStart;
					textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(textarea.selectionEnd);
					textarea.selectionStart = textarea.selectionEnd = start + 1;
					active.content = textarea.value;
					this.updateStats(textarea.value);
					this.persist();
				}
			};

			// Копирование с плавной подсветкой кнопки
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

			// Скачивание .txt
			document.getElementById('btn-download').onclick = () => {
				const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = `${active.name}.txt`;
				a.click();
				URL.revokeObjectURL(a.href);
			};

			// Переключение шрифта
			const fontBtn = document.getElementById('btn-toggle-font');
			fontBtn.onclick = () => {
				this.appData.isMonospace = !this.appData.isMonospace;
				this.persist();
				textarea.classList.toggle('monospace', this.appData.isMonospace);
				fontBtn.classList.toggle('active', this.appData.isMonospace);
			};

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
	};

})(NexusBehaviour);