# Структура системы заполнения проектов

## Общая архитектура

Система состоит из трёх основных компонентов:

1. **Данные (JSON файлы)**
   - `/pages/data/profile.json` - данные для главной страницы (краткие карточки)
   - `/pages/data/projects.json` - данные для страницы проектов

2. **Скрипты заполнения**
   - `/pages/scripts/fill-profile.js` - заполняет главную страницу
   - `/pages/scripts/fill-projects.js` - заполняет страницу проектов

3. **Стили**
   - `/pages/css/projects.css` - стили для проектов

## Структура данных в profile.json

На главной странице проекты отображаются как краткие карточки с компактным дизайном.

### Формат объекта проекта

```json
{
  "year": 2025,
  "tags": ["C#", "Unity"],
  "title": "Project Title",
  "description": "Short description",
  "link": "https://demo-link.com",
  "repo": "https://github.com/user/repo"
}
```

### Поля
- **year** (number) - год создания проекта
- **tags** (array) - массив технологий/тегов
- **title** (string) - название проекта
- **description** (string) - краткое описание
- **link** (string) - ссылка на демо (опционально)
- **repo** (string) - ссылка на репозиторий (опционально)

### Пример в profile.json

```json
"projects": {
  "title": "Projects",
  "items": [
    {
      "year": 2025,
      "tags": ["C#", "Unity"],
      "title": "2D Platformer",
      "description": "A 2D platformer game project",
      "link": "",
      "repo": ""
    }
  ]
}
```

## Структура данных в projects.json

На странице проектов используется та же структура, но для полной выборки всех проектов.

### Пример projects.json

```json
{
  "en": {
    "projects": [
      {
        "year": 2025,
        "tags": ["C#", "Unity"],
        "title": "2D Platformer",
        "description": "A 2D platformer game project",
        "link": "",
        "repo": ""
      }
    ]
  },
  "ru": {
    "projects": [
      {
        "year": 2025,
        "tags": ["C#", "Unity"],
        "title": "Учебный 2D Платформер",
        "description": "Учебный проект с курса ЯЮниор",
        "link": "",
        "repo": ""
      }
    ]
  }
}
```

## Как работает заполнение

### На главной странице (fill-profile.js)

1. Функция `fillProjects()` проверяет тип данных каждого элемента
2. Для объектов создаёт структурированное отображение с:
   - Заголовок + год
   - Описание
   - Теги технологий
   - Ссылки на демо и репозиторий
3. Поддерживает обратную совместимость со строками (старый формат)

### На странице проектов (fill-projects.js)

1. Загружает данные из `projects.json`
2. Функция `fillProjectCard()` создаёт красивую карточку для каждого проекта
3. Функция `fillProjectsGrid()` размещает карточки в адаптивной сетке (3 колонки)
4. Поддерживает переключение языков (EN/RU)

## Расширение для подробных страниц

Для добавления подробной страницы каждого проекта:

### 1. Создать data файл
`/pages/data/projects/<project-id>.json`

```json
{
  "en": {
    "title": "2D Platformer",
    "description": "Full description...",
    "tags": ["C#", "Unity"],
    "year": 2025,
    "content": "...",
    "demo": "https://...",
    "repo": "https://..."
  },
  "ru": {
    "title": "2D Платформер",
    "description": "Полное описание...",
    ...
  }
}
```

### 2. Создать скрипт заполнения
`/pages/scripts/fill-project-detail.js`

Скрипт должен:
- Получать ID проекта из URL (query параметр или slug)
- Загружать соответствующий JSON файл
- Заполнять HTML шаблон

### 3. Создать HTML страницу
`/pages/project-detail.html`

С пустой `<wrapper>` для заполнения скриптом

### 4. Создать стили (или расширить projects.css)
`/pages/css/project-detail.css`

## Примеры использования

### Добавить новый проект на главную

Отредактировать `/pages/data/profile.json`:

```json
"projects": {
  "title": "Projects",
  "items": [
    {
      "year": 2025,
      "tags": ["Python", "Flask"],
      "title": "Web Application",
      "description": "A web application built with Python",
      "link": "https://example.com",
      "repo": "https://github.com/user/project"
    },
    // ... остальные проекты
  ]
}
```

То же самое добавить в русский раздел:

```json
"projects": {
  "title": "Проекты",
  "items": [
    {
      "year": 2025,
      "tags": ["Python", "Flask"],
      "title": "Веб-приложение",
      "description": "Веб-приложение на Python",
      "link": "https://example.com",
      "repo": "https://github.com/user/project"
    },
    // ... остальные проекты
  ]
}
```

## CSS классы

### На главной странице

- `.projects` - контейнер списка
- `.project-item` - элемент проекта
- `.project-header` - заголовок с названием и годом
- `.project-title` - название проекта
- `.project-year` - год проекта
- `.project-description` - описание
- `.project-tags` - контейнер тегов
- `.project-tag` - отдельный тег
- `.project-links` - контейнер ссылок
- `.project-link-demo` - ссылка на демо
- `.project-link-repo` - ссылка на репозиторий

### На странице проектов

- `.projects-grid` - сетка проектов
- `.project-card` - карточка проекта
- `.card-header` - заголовок карточки
- `.card-title` - название в карточке
- `.card-year` - год в карточке
- `.card-description` - описание в карточке
- `.card-tags` - теги в карточке
- `.card-tag` - тег в карточке
- `.card-links` - ссылки в карточке
- `.card-link-demo` - ссылка на демо в карточке
- `.card-link-repo` - ссылка на репо в карточке

## Адаптивность

### На главной странице
- Проекты отображаются в колонке (flex column)
- Адаптация происходит автоматически

### На странице проектов
- Сетка 3 колонки на desktop (минимум 350px на колонку)
- 1 колонка на мобильных устройствах (< 768px)

## Языковая поддержка

Оба скрипта поддерживают переключение языков через кнопки `.lang-en` и `.lang-ru`.

Данные организованы в структуре:
```json
{
  "en": { ... },
  "ru": { ... }
}
```
