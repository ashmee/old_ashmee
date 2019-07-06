'use strict';
(function () {
    const octokit = new Octokit();

    const buildReposBlock = formattedResult => {
        let temp = document.querySelector('.template__repo');
        const gitBlock = document.querySelector('.git-content');
        const gitRepoName = temp.content.querySelector('.repository__name');
        const gitRepoDescription = temp.content.querySelector('.repository__description');
        const gitRepoLink = temp.content.querySelector('.repository__link');
        const gitRepoUpdateTime = temp.content.querySelector('.repository__time');
        const gitRepoLang = temp.content.querySelector('.repository__language');
        const miniLoader = document.querySelector('#mini-loader');
        const gitRepoLangColor = temp.content.querySelector('.language__color');
        miniLoader.style.display = 'none';


        let resLength = formattedResult.length;
        for (let i = 0; i < resLength; i++) {
            gitRepoLink.setAttribute('href', formattedResult[i].html_url);
            gitRepoName.textContent = formattedResult[i].name;
            gitRepoDescription.textContent = formattedResult[i].description;
            gitRepoLang.textContent = formattedResult[i].language !== null ? formattedResult[i].language : 'HTML';

            switch (gitRepoLang.textContent) {
                case 'HTML':
                    gitRepoLangColor.setAttribute('class', 'language__color');
                    gitRepoLangColor.classList.add('language__color--red');
                    break;
                case 'CSS':
                    gitRepoLangColor.setAttribute('class', 'language__color');
                    gitRepoLangColor.classList.add('language__color--blue');
                    break;
                case 'JavaScript':
                    gitRepoLangColor.setAttribute('class', 'language__color');
                    gitRepoLangColor.classList.add('language__color--orange');
                    break;
                default:
                    gitRepoLangColor.setAttribute('class', 'language__color');
                    gitRepoLangColor.classList.add('language__color--gray');
            }

            const formatter = new Intl.DateTimeFormat('ru', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });

            let updateTime = formattedResult[i].updated_at;
            let updateTimeUTC = new Date(Date.parse(`${updateTime}`));
            gitRepoUpdateTime.textContent = formatter.format(updateTimeUTC);
            let clone = document.importNode(temp.content, true);
            gitBlock.insertBefore(clone, gitBlock.firstChild);
        }

    };

    const pageClicker = evt => {
        evt.preventDefault();

        const repositoryBlock = document.body.querySelectorAll('.repository');
        const paginationBlock = document.querySelector('.pagination');
        repositoryBlock.forEach(el => el.remove());
        const miniLoader = document.querySelector('#mini-loader');
        miniLoader.style.display = 'block';


        let active = Number(document.querySelector('.active').text);

        if ((active === 5 && evt.target.innerText === '»') || (active === 1 && evt.target.innerText === '«')) {
            makeRequest(active);
        } else if (evt.target.innerText === '»') {
            paginationBlock.children[active].classList.remove('active');
            paginationBlock.children[++active].classList.add('active');
            makeRequest(active);
        } else if (evt.target.innerText === '«') {
            paginationBlock.children[active].classList.remove('active');
            paginationBlock.children[--active].classList.add('active');
            makeRequest(active);
        } else {
            paginationBlock.children[active].classList.remove('active');
            evt.target.classList.add('active');
            active = Number(document.querySelector('.active').text);
            makeRequest(active);
        }
    };

    const parseData = pageInfo => {
        let parsedData = {};
        let arrData = pageInfo.split(',');
        let tempPage = document.querySelector('.template__pagination');
        let clone = document.importNode(tempPage.content, true);
        const gitBlock = document.querySelector('.git-content');

        let item;
        for (item of arrData) {
            let linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(item);
            parsedData[linkInfo[2]] = linkInfo[1];
        }
        gitBlock.appendChild(clone);
        document.body.querySelector('.pagination').addEventListener('click', pageClicker);
    };

    const errDrawer = (err) => {
        const ERROR_TITLE = 'Извините, сейчас не удалось получить список репозиториев. Посмотреть их можно по ссылке:';
        const REPOSITORY_LINK = 'https://github.com/ashmee?tab=repositories';
        const GITHUB_PAGE= 'страница на GitHub';
        const gitContent = document.querySelector('.git-content');
        const errBlock = document.createElement('h1');
        const gitLink = document.createElement('a');

        errBlock.classList.add('repository__description');
        errBlock.innerText = ERROR_TITLE;
        gitLink.classList.add('repository__link');
        gitLink.innerText = GITHUB_PAGE;
        gitLink.href = REPOSITORY_LINK;
        gitContent.appendChild(errBlock);
        gitContent.appendChild(gitLink);
        gitContent.classList.add('repository__error');
        console.error(err);
    };

    const makeRequest = (page, pagination) => {
        octokit.request('GET /users/:username/repos', {
            username: 'ashmee',
            type: 'private',
            page: page,
            per_page: 3,
            sort: 'updated'
        })
            .then(result => {
                const formattedResult = [];
                const pageInfo = result.headers.link;
                result.data.map(item => {
                    const {
                        name,
                        html_url,
                        description,
                        language,
                        updated_at
                    } = item;
                    formattedResult.push({
                        name,
                        html_url,
                        description,
                        language,
                        updated_at
                    });
                });

                buildReposBlock(formattedResult);
                if (pagination) {
                    parseData(pageInfo);
                }
            })
            .catch(err => errDrawer(err));
    };

    window.onscroll = () => {
        const sideMenuButton = document.querySelector('.side-menu');
        const sideArrow = document.querySelector('.side-arrow');
        const currentCoord = window.pageYOffset;
        const sideMenu = document.getElementById('mySidenav');

        if ((sideMenu.classList.contains('sidenav--open') || currentCoord > 200) && screen.width > 975 && window.innerWidth > 975) {
            sideMenuButton.classList.add('visible-flex');
            sideArrow.classList.add('visible-block');
        } else {
            sideMenuButton.classList.remove('visible-flex');
            sideArrow.classList.remove('visible-block');
        }
    };

    makeRequest(1, true);
})();

const closeMenuOnEscape = (event = 'click') => {
    if (event.code === 'Escape' || event === 'click') {
        document.getElementById('mySidenav').classList.add('sidenav--closed');
        document.querySelector('.side-menu').classList.add('hidden');
        document.body.removeEventListener('keydown', closeMenuOnEscape);
    }
};

const menuClickHandler = () => {
    const sideMenu = document.getElementById('mySidenav');
    const sideMenuButton = document.querySelector('.side-menu');

    if (sideMenu.classList.contains('sidenav--open')) {
        sideMenuButton.setAttribute('class', 'side-menu visible-flex');
        sideMenu.classList.remove('sidenav--open');
        closeMenuOnEscape();
    } else {
        sideMenuButton.setAttribute('class', 'side-menu opened visible-flex');
        sideMenu.classList.remove('sidenav--closed');
        sideMenu.classList.add('sidenav--open');
        document.body.addEventListener('keydown', closeMenuOnEscape);
    }
};

const menuMobileClickHandler = () => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuButton = document.querySelector('.mobile-menu');

    if (mobileMenu.classList.contains('visible-flex')) {
        mobileMenuButton.setAttribute('class', 'mobile-menu');
        document.body.classList.remove('menu--open');
        mobileMenu.classList.remove('visible-flex');
    } else {
        mobileMenu.classList.add('visible-flex');
        mobileMenuButton.setAttribute('class', 'mobile-menu opened');
        document.body.classList.add('menu--open');
    }
};