// ==UserScript==
// @name         PMS FBA PT Form Fix
// @version      2025-05-06
// @description  try to take over the world!
// @author       Priboy313
// @match        https://pms.plexsupply.com/pms/fbapacktask.xhtml?edit&*
// @match        https://pms.officechase.com/pms/fbapacktask.xhtml?edit&*
// @match        https://pms.marksonsupply.com/pms/fbapacktask.xhtml?edit&*
// ==/UserScript==

(function() {
    'use strict';

const PTFormFixStyle = document.createElement('style');
    PTFormFixStyle.innerHTML = `
.costCheck{
  	width: 100px!important;
}
`;
document.head.appendChild(PTFormFixStyle);

    const cleanInput = (value) => {
        // Заменяем запятые на точки
        let cleaned = value.replace(/,/g, '.');

        // Удаляем все нечисловые символы кроме точек
        cleaned = cleaned.replace(/[^\d.]/g, '');

        // Удаляем лишние точки
        const parts = cleaned.split('.');
        if (parts.length > 1) {
            cleaned = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
        }

        // Добавляем ноль если начинается с точки
        if (cleaned.startsWith('.')) cleaned = '0' + cleaned;

        // Удаляем точки в конце
        if (cleaned.endsWith('.')) cleaned = cleaned.slice(0, -1);

        return cleaned;
    };

    const handleInput = function(e) {
        const cursorPos = this.selectionStart;
        const originalValue = this.value;

        this.value = cleanInput(originalValue);

        // Корректируем позицию курсора
        const diff = this.value.length - originalValue.length;
        this.setSelectionRange(cursorPos + diff, cursorPos + diff);
    };

    const handlePaste = function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        this.value = cleanInput(text);
    };

    // Инициализация для существующих и новых элементов
    const init = () => {
        document.querySelectorAll('input.costCheck[type="number"]').forEach(input => {
            input.addEventListener('input', handleInput);
            input.addEventListener('paste', handlePaste);
        });
    };

    // Observer для динамически добавленных элементов
    new MutationObserver(init).observe(document.body, {
        childList: true,
        subtree: true
    });

    // Первоначальная инициализация
    init();

})();