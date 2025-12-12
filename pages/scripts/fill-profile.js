const DATA_URL = '/pages/data/profile.json';
let profileData = null;

async function fetchProfileData() {
	const response = await fetch(DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

function fillSkills(container, items){
    container.innerHTML = '';
    items.forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
        container.appendChild(tag);
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

function fillProfile(lang) {
	const HERO = document.body.querySelector(".hero");

	if (HERO) {
		HERO.querySelector(".hero-title").textContent = profileData[lang].hero.title;
		HERO.querySelector(".profile").src = profileData[lang].hero.photo;

		const skillsContainer = document.querySelector('.skills');
		fillSkills(skillsContainer, profileData.skills.items);

		HERO.querySelector(".intro").textContent = profileData[lang].hero.intro;
		
		HERO.querySelector(".h-education").textContent = profileData[lang].edu.title;
		const eduContainer = HERO.querySelector(".education");
		fillEducation(eduContainer, profileData[lang].edu.items);

		HERO.querySelector(".h-projects").textContent = profileData[lang].projects.title;
		const projectsContainer = HERO.querySelector(".projects");
		fillProjects(projectsContainer, profileData[lang].projects.items);

	}
	else {
		console.error("Profile section not found in the document.");
	}
}


document.addEventListener('DOMContentLoaded', async () => {
	try {

		profileData = await fetchProfileData();
		fillProfile("en");

		document.getElementById('lang-en').addEventListener('click', () => {
            fillProfile('en');
        });

        document.getElementById('lang-ru').addEventListener('click', () => {
            fillProfile('ru');
        });

	} catch (error) {
		console.error('Error loading profile data:', error);
	}
});

