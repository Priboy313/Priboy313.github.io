const DATA_URL = '/pages/data/profile.json';
let profileData = null;

async function fetchData() {
	const response = await fetch(DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
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
		const li = document.createElement('li');
		li.textContent = item;
		container.appendChild(li);
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

		HERO.querySelector(".h-projects").textContent = profileData[lang].projects.title;
		const projectsContainer = HERO.querySelector(".projects");
		fillProjects(projectsContainer, profileData[lang].projects.items);

		HERO.querySelector(".h-eduProjects").textContent = profileData[lang].eduProjects.title;
		const eduProjectsContainer = HERO.querySelector(".eduProjects");
		fillProjects(eduProjectsContainer, profileData[lang].eduProjects.items);

	}
	else {
		console.error("Profile section not found in the document.");
	}
}


document.addEventListener('DOMContentLoaded', async () => {
	try {

		profileData = await fetchData();
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

