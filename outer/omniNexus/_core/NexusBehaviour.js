class NexusBehaviour {
    constructor(context) {
        this.id = this.constructor.name;
        this.role = context.role;
        this.workspace = context.CONFIG.workspace;
        this.CONFIG = context.CONFIG;
        
        this._GM_get = context.GM_getValue;
        this._GM_set = context.GM_setValue;

        let userSettings = {};
        try {
            userSettings = JSON.parse(context.settingsJSON || '{}');
        } catch (e) {}
        this.config = { ...(this.defaults || {}), ...userSettings };

        this._initLifecycle();
    }

    _initLifecycle() {
        this.awake();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    // Методы для переопределения в воркерах
    awake() {}
    start() {}
	// =====================================

    print(...args) {
        if (this.role === "dodev") {
            console.log(`==== [${this.id}]`, ...args);
        }
    }

    addCSS(cssString) {
        if (document.getElementById(`custom-${this.id}-css`)) return;
        const style = document.createElement('style');
        style.id = `custom-${this.id}-css`;
        style.textContent = cssString;
        document.head.appendChild(style);
    }

	waitForElement(selector, timeout = 10000, parent = null) {
		return new Promise((resolve) => {
			if (!selector) return resolve(null);

			const root = parent || document;
			const existing = root.querySelector(selector);
			if (existing) return resolve(existing);

			const targetNode = parent || document.body || document.documentElement;

			let timeoutId;
			const observer = new MutationObserver(() => {
				const found = root.querySelector(selector);
				if (found) {
					clearTimeout(timeoutId);
					observer.disconnect();
					resolve(found);
				}
			});

			timeoutId = setTimeout(() => {
				observer.disconnect();
				this.print(`[Timeout] Элемент "${selector}" не появился за ${timeout} мс.`);
				resolve(null);
			}, timeout);

			observer.observe(targetNode, { childList: true, subtree: true });
		});
	}

	observe(target, callback, options = { childList: true, subtree: true }) {
		const node = typeof target === 'string' ? document.querySelector(target) : target;
		if (!node || !(node instanceof Node)) {
			this.print('observe: целевой элемент не найден или не является Node:', target);
			return null;
		}

		const observer = new MutationObserver((mutations, obs) => {
			callback(node, mutations, obs);
		});

		observer.observe(node, options);
		this._observers.push(observer);
		return observer;
	}

	disconnectObservers() {
		this._observers.forEach(obs => obs.disconnect());
		this._observers = [];
	}

    save(key, value) {
        const fullKey = `nexus_${this.workspace}_${this.id}_${key}`;
        this._GM_set(fullKey, value);
    }

    load(key, fallback = null) {
        const fullKey = `nexus_${this.workspace}_${this.id}_${key}`;
        return this._GM_get(fullKey, fallback);
    }
	
	saveGlobal(key, value) {
		this._GM_set(`nexus_${this.workspace}_${key}`, value);
	}

	loadGlobal(key, fallback = null) {
		return this._GM_get(`nexus_${this.workspace}_${key}`, fallback);
	}
}