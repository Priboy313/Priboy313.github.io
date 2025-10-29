// ВАЖНО: Это содержимое файла plx.scr-manager_public.js на GitHub
(function() {
    'use strict';

    if (window.PLX_SETTINGS_SHOW_UI) return;

    const GITHUB_API_URL = 'https://api.github.com/repos/Priboy313/Priboy313.github.io/commits/main';
    const MANIFEST_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/Priboy313/Priboy313.github.io@{commit_hash}/outer/PLEX/manifest.json";
    const SETTINGS_KEY = 'plx-cst-scr-settings';
    const MANIFEST_CACHE_KEY = 'plx-manifest-cache';
    const CACHE_DURATION_MS = 0.4 * 60 * 60 * 1000;

    function request(options) {
        return new Promise((resolve, reject) => {
            options.onload = resolve; options.onerror = reject;
            GM_xmlhttpRequest(options);
        });
    }

    async function getManifest() {
        const cached = GM_getValue(MANIFEST_CACHE_KEY, null);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        try {
            const cRes = await request({method:'GET', url: GITHUB_API_URL, headers:{"Accept":"application/vnd.github.v3+json"}});
            const hash = JSON.parse(cRes.responseText).sha;
            const mRes = await request({method:'GET', url: MANIFEST_URL_TEMPLATE.replace('{commit_hash}', hash)});
            const data = JSON.parse(mRes.responseText);
            GM_setValue(MANIFEST_CACHE_KEY, {data, timestamp: Date.now()});
            return data;
        } catch (e) {
            console.error("Manifest Error:", e);
            return cached ? cached.data : null;
        }
    }

    window.PLX_SETTINGS_SHOW_UI = async function() {
        if (document.getElementById('plx-settings-modal')) return;

        const loaderHTML = '<div id="plx-loader" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:20px;background:#fff;border:1px solid #ccc;z-index:100000;">Загрузка параметров...</div>';
        document.body.insertAdjacentHTML('beforeend', loaderHTML);

        const registry = await getManifest();
        document.getElementById('plx-loader')?.remove();

        if (!registry) {
            alert('Ошибка загрузки манифеста настроек.');
            return;
        }

        const settings = GM_getValue(SETTINGS_KEY, {});
        let formHTML = '';
        for (const sId in registry) {
            formHTML += `<fieldset style="margin-bottom:10px;border:1px solid #ccc;padding:10px;"><legend><b>${registry[sId].name}</b></legend>`;
            for (const k in registry[sId].settings) {
                const sInf = registry[sId].settings[k];
                const val = settings[sId]?.[k] ?? sInf.default;
                let input = sInf.type === 'boolean'
                    ? `<input type="checkbox" id="${sId}_${k}" ${val ? 'checked' : ''}>`
                    : `<input type="text" id="${sId}_${k}" value="${val || ''}" style="width:100%">`;
                formHTML += `<div style="margin-bottom:5px;"><label for="${sId}_${k}">${input} ${sInf.label}</label></div>`;
            }
            formHTML += `</fieldset>`;
        }

        const modalHTML = `
        <div id="plx-settings-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;padding:20px;width:90%;max-width:600px;max-height:80vh;overflow-y:auto;border-radius:5px;">
                <h2 style="margin-top:0;">Настройки Plex скриптов</h2>
                <form id="plx-settings-form">${formHTML || 'Нет доступных настроек.'}</form>
                <div style="text-align:right;margin-top:20px;">
                    <button id="plx-save-btn" style="padding:8px 15px;margin-left:10px;cursor:pointer;">Сохранить</button>
                    <button id="plx-close-btn" style="padding:8px 15px;margin-left:10px;cursor:pointer;">Закрыть</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('plx-save-btn').onclick = (e) => {
            e.preventDefault();
            const newSet = GM_getValue(SETTINGS_KEY, {});
            for (const sId in registry) {
                if (!newSet[sId]) newSet[sId] = {};
                for (const k in registry[sId].settings) {
                    const el = document.getElementById(`${sId}_${k}`);
                    if (el) newSet[sId][k] = el.type === 'checkbox' ? el.checked : el.value;
                }
            }
            GM_setValue(SETTINGS_KEY, newSet);
            document.getElementById('plx-settings-modal').remove();
        };
        document.getElementById('plx-close-btn').onclick = (e) => {
            e.preventDefault();
            document.getElementById('plx-settings-modal').remove();
        };
    };
})();