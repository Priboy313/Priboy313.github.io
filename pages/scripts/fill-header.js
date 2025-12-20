const DATA_URL = '/pages/data/header.json';
let headerData = null;

async function fetchData() {
    const response = await fetch(DATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

    return await response.json();
}

function fillData(lang) {
	if (!headerData) return;

	const HEADER = document.querySelector('header');
	const MENU = HEADER.querySelector('.menu-container');

	console.log("headerData");
	console.log(HEADER);
	console.log(MENU);

	const ABOUT = MENU.querySelector('.about-link');
	if (ABOUT) {
		ABOUT.textContent = headerData[lang].about;
		ABOUT.href = headerData.universal.about_href;
	}

	const PROJECTS = MENU.querySelector('.projects-link');
	if (PROJECTS) {
		PROJECTS.textContent = headerData[lang].projects;
		PROJECTS.href = headerData.universal.projects_href;
	}

	const PRESENTATIONS = MENU.querySelector('.presentations-link');
	if (PRESENTATIONS) {
		PRESENTATIONS.textContent = headerData[lang].presentations;
		PRESENTATIONS.href = headerData.universal.presentations_href;
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	try {

		headerData = await fetchData();
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