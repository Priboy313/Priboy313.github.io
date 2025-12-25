const DATA_URL = '/pages/data/projects.json';
let projectsData = null;

async function fetchData() {
	const response = await fetch(DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

function fillProjectCard(item) {
	const card = document.createElement('div');
	card.className = 'project-card';

	const cardHeader = document.createElement('div');
	cardHeader.className = 'card-header';

	const title = document.createElement('h2');
	title.className = 'card-title';
	title.textContent = item.title;

	const year = document.createElement('span');
	year.className = 'card-year';
	year.textContent = item.year;

	cardHeader.appendChild(title);
	cardHeader.appendChild(year);

	const description = document.createElement('p');
	description.className = 'card-description';
	description.textContent = item.description;

	const tags = document.createElement('div');
	tags.className = 'card-tags';

	item.tags.forEach(tag => {
		const tagSpan = document.createElement('span');
		tagSpan.className = 'card-tag';
		tagSpan.textContent = tag;
		tags.appendChild(tagSpan);
	});

	const links = document.createElement('div');
	links.className = 'card-links';

	if (item.links && Array.isArray(item.links)) {
		item.links.forEach(link => {
			if (link.url && link.url.trim() !== '') {
				const linkA = document.createElement('a');
				linkA.href = link.url;
				linkA.textContent = link.label || link.type;
				linkA.className = `card-link card-link-${link.type}`;
				linkA.target = '_blank';
				linkA.rel = 'noopener noreferrer';
				links.appendChild(linkA);
			}
		});
	}

	card.appendChild(cardHeader);
	card.appendChild(description);
	card.appendChild(tags);
	if (links.children.length > 0) {
		card.appendChild(links);
	}

	return card;
}

function fillProjectsGrid(container, items) {
	container.innerHTML = '';

	items.forEach(item => {
		const card = fillProjectCard(item);
		container.appendChild(card);
	});
}

function filterProjectsByType(items, type) {
	return items.filter(item => item.type === type);
}

function fillData(lang) {
	const wrapper = document.body.querySelector("wrapper");

	if (wrapper && projectsData[lang]) {
		wrapper.innerHTML = '';

		const workProjects = filterProjectsByType(projectsData[lang].projects, 'work');
		const educationalProjects = filterProjectsByType(projectsData[lang].projects, 'educational');

		if (workProjects.length > 0) {
			const workTitle = document.createElement('h1');
			workTitle.className = 'page-title';
			workTitle.textContent = lang === 'en' ? 'Projects' : 'Проекты';
			wrapper.appendChild(workTitle);

			const workContainer = document.createElement('div');
			workContainer.className = 'projects-grid';
			wrapper.appendChild(workContainer);

			fillProjectsGrid(workContainer, workProjects);
		}

		if (educationalProjects.length > 0) {
			const eduTitle = document.createElement('h1');
			eduTitle.className = 'page-title';
			eduTitle.textContent = lang === 'en' ? 'Educational Projects' : 'Учебные проекты';
			wrapper.appendChild(eduTitle);

			const eduContainer = document.createElement('div');
			eduContainer.className = 'projects-grid';
			wrapper.appendChild(eduContainer);

			fillProjectsGrid(eduContainer, educationalProjects);
		}

		if (workProjects.length === 0 && educationalProjects.length === 0) {
			const noProjects = document.createElement('p');
			noProjects.textContent = lang === 'en' ? 'No projects yet' : 'Нет проектов';
			wrapper.appendChild(noProjects);
		}
	}
	else {
		console.error("Wrapper section not found in the document or invalid language.");
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	try {

		projectsData = await fetchData();
		fillData("en");

		const langButtons = document.querySelectorAll('.lang');
		langButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const lang = e.target.id.replace('lang-', '');
				fillData(lang);
			});
		});

	} catch (error) {
		console.error('Error loading projects:', error);
	}
});
