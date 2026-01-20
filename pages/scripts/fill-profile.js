const DATA_URL = '/pages/data/profile.json';
const PROJECTS_DATA_URL = '/pages/data/projects.json';
let profileData = null;
let projectsData = null;

async function fetchData() {
	const response = await fetch(DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

async function fetchProjectsData() {
	const response = await fetch(PROJECTS_DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch projects data: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

function fillSkills(container, items){
    container.innerHTML = '';

    items.forEach(skill => {
        const tag = document.createElement('a');
        tag.className = 'skill-tag';
		tag.href = skill.href || '#';
        tag.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;

        container.appendChild(tag);
    });
}

function fillContacts(container, items){
	container.innerHTML = '';

	items.forEach(item => {
		const link = document.createElement('a');
		link.className = 'contact-link';
		link.href = item.href;
		link.textContent = item.text;

		container.appendChild(link);
	});
}

function fillEducation(container, items){
	container.innerHTML = '';
	
	items.forEach(item => {
		const li = document.createElement('li');
		li.className = 'education-item';

		const year = item[0];
		const institution = item[1];
		const specialty = item[2];
		const degree = item[3];

		const header = document.createElement('div');
		header.className = "edu-header";
		header.textContent = `${year} — ${institution}`;

		const specialtyDiv = document.createElement('div');
		specialtyDiv.className = "edu-specialty";
		specialtyDiv.textContent = specialty;

		const degreeDiv = document.createElement('div');
		degreeDiv.className = "edu-degree";
		degreeDiv.textContent = degree;

		li.appendChild(header);
		li.appendChild(specialtyDiv);
		li.appendChild(degreeDiv);

		container.appendChild(li);
	});
}

function fillProjects(container, items){
	container.innerHTML = '';

	items.forEach(item => {
		if (typeof item === 'string') {
			const li = document.createElement('li');
			li.textContent = item;
			container.appendChild(li);
		}
		else if (typeof item === 'object') {
			const li = document.createElement('li');
			li.className = 'project-item';

			const projectHeader = document.createElement('div');
			projectHeader.className = 'project-header';

			const title = document.createElement('h3');
			title.className = 'project-title';
			title.textContent = item.title;

			const year = document.createElement('span');
			year.className = 'project-year';
			year.textContent = item.year;

			projectHeader.appendChild(title);
			projectHeader.appendChild(year);

			const description = document.createElement('p');
			description.className = 'project-description';
			description.textContent = item.description;

			const tags = document.createElement('div');
			tags.className = 'project-tags';

			item.tags.forEach(tag => {
				const tagSpan = document.createElement('span');
				tagSpan.className = 'project-tag';
				tagSpan.textContent = tag;
				tags.appendChild(tagSpan);
			});

			const links = document.createElement('div');
			links.className = 'project-links';

			if (item.links && Array.isArray(item.links)) {
				item.links.forEach(link => {
					if (link.url && link.url.trim() !== '') {
						const linkA = document.createElement('a');
						linkA.href = link.url;
						linkA.textContent = link.label || link.type;
						linkA.className = `project-link project-link-${link.type}`;
						linkA.target = '_blank';
						linkA.rel = 'noopener noreferrer';
						links.appendChild(linkA);
					}
				});
			}

			li.appendChild(projectHeader);
			li.appendChild(tags);
			li.appendChild(description);
			if (links.children.length > 0) {
				li.appendChild(links);
			}

			container.appendChild(li);
		}
	});
}

function fillData(lang) {
	const HERO = document.body.querySelector(".hero");

	if (HERO) {
		HERO.querySelector(".name").textContent = profileData[lang].hero.name;
		HERO.querySelector(".profile").src = profileData.universal.photoUrl;

		const skillsContainer = document.querySelector('.skills');
		fillSkills(skillsContainer, profileData.universal.skills.items);

		HERO.querySelector(".intro").textContent = profileData[lang].hero.intro;

		HERO.querySelector(".h-contacts").textContent = profileData[lang].contacts.title;
		HERO.querySelector(".contacts .contact-email").textContent = profileData.universal.contacts.email;
		const contactLinksContainer = HERO.querySelector(".contacts .contact-links");
		fillContacts(contactLinksContainer, profileData.universal.contacts.links);
		
		HERO.querySelector(".h-education").textContent = profileData[lang].edu.title;
		const eduContainer = HERO.querySelector(".education");
		fillEducation(eduContainer, profileData[lang].edu.items);

		HERO.querySelector(".h-projects").textContent = lang === 'en' ? 'Projects' : 'Проекты';
		const projectsContainer = HERO.querySelector(".projects");
		const workProjects = filterProjectsByType(projectsData[lang].projects, 'work');
		fillProjects(projectsContainer, workProjects);

		HERO.querySelector(".h-eduProjects").textContent = lang === 'en' ? 'Educational Projects' : 'Учебные проекты';
		const eduProjectsContainer = HERO.querySelector(".eduProjects");
		const educationalProjects = filterProjectsByType(projectsData[lang].projects, 'educational');
		fillProjects(eduProjectsContainer, educationalProjects);

	}
	else {
		console.error("Profile section not found in the document.");
	}
}


document.addEventListener('DOMContentLoaded', async () => {
	try {

		profileData = await fetchData();
		projectsData = await fetchProjectsData();
		fillData("en");

		document.getElementById('lang-en').addEventListener('click', () => {
            fillData('en');
        });

        document.getElementById('lang-ru').addEventListener('click', () => {
            fillData('ru');
        });

	} catch (error) {
		console.error('Error loading data:', error);
	}
});

function filterProjectsByType(items, type) {
	return items.filter(item => item.type === type);
}
