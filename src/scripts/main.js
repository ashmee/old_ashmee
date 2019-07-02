"use strict";
(function () {
    const octokit = new Octokit();

    const buildReposBlock = (formattedResult) => {
        let temp = document.querySelector(".template__repo");
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
                    gitRepoLangColor.style.backgroundColor = '#E00000';
                    break;
                case 'CSS':
                    gitRepoLangColor.style.backgroundColor = '#0094FF';
                    break;
                case 'JavaScript':
                    gitRepoLangColor.style.backgroundColor = '#FFC700';
                    break;
                default:
                    gitRepoLangColor.style.backgroundColor = '#83838E';
            }

            let updateTime = formattedResult[i].updated_at;
            let updateTimeUTC = new Date(Date.parse(`${updateTime}`));
            gitRepoUpdateTime.textContent = updateTimeUTC.toString().slice(4, 25);
            let clone = document.importNode(temp.content, true);
            gitBlock.appendChild(clone);
        }

    };

    //pagination click handler
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


    const parseData = (pageInfo) => {
        let parsedData = {};
        let arrData = pageInfo.split(",");
        let tempPage = document.querySelector(".template__pagination");
        let clone = document.importNode(tempPage.content, true);
        const gitBlock = document.querySelector('.git-content');

        let item;
        for (item of arrData) {
            let linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(item);
            parsedData[linkInfo[2]] = linkInfo[1]
        }
        gitBlock.appendChild(clone);
        document.body.querySelector('.pagination').addEventListener('click', pageClicker);
    };

    //error-handling block
    const errDrawer = (err) => {
        const gitContent = document.querySelector('.git-content');
        const errBlock = document.createElement('h1');
        const gitLink = document.createElement('a');
        errBlock.classList.add('repository__description');
        errBlock.innerText = "Извините, сейчас не удалось получить список репозиториев. Посмотреть их можно по ссылке:";
        gitLink.classList.add('repository__link');
        gitLink.innerText = "страница на GitHub";
        gitLink.href = "https://github.com/ashmee?tab=repositories";
        gitContent.appendChild(errBlock);
        gitContent.appendChild(gitLink);
        gitContent.style.background = "url(./images/err.png) no-repeat bottom left";
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
                    parseData(pageInfo)
                }
            })
            .catch(err => errDrawer(err));
    };

    window.onscroll = () => {
        const sideMenuButton = document.querySelector('.side-menu');
        const sideArrow = document.querySelector('.side-arrow');
        const currentCoord = window.pageYOffset;
        const sideMenu = document.getElementById('mySidenav');

        if ((sideMenu.style.width === "260px" ||currentCoord > 200) && screen.width > 975 && window.innerWidth > 975) {
            sideMenuButton.style.display="flex";
            sideArrow.style.display="block";
        } else {
            sideMenuButton.style.display="none";
            sideArrow.style.display="none";
        }
    };

    makeRequest(1, true);
})();

const menuClickHandler = () => {
    let sideMenu = document.getElementById('mySidenav');
    const sideMenuButton = document.querySelector('.side-menu');

    if (sideMenu.style.width === "260px") {
        sideMenuButton.setAttribute('class', 'side-menu');
        sideMenu.style.width = "0px";
        closeMenuOnEscape();
    } else {
        sideMenuButton.style.display="flex";
        sideMenuButton.setAttribute('class', 'side-menu opened');
        sideMenu.style.width = "260px";
        document.body.addEventListener('keydown', closeMenuOnEscape);
    }
};


const menuMobileClickHandler = () => {
    let mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuButton = document.querySelector('.mobile-menu');

    if (mobileMenu.style.width === "100vw") {
        mobileMenuButton.setAttribute('class', 'mobile-menu');
        mobileMenu.style.width = "0px";
        mobileMenu.style.height = "0px";
        mobileMenu.style.display="none";
    } else {
        mobileMenu.style.display="flex";
        mobileMenuButton.setAttribute('class', 'mobile-menu opened');
        mobileMenu.style.width = "100vw";
        mobileMenu.style.height = "100vh";
    }
};

const closeMenuOnEscape = (event = 'click')  => {
    if (event.code === 'Escape' || event === 'click') {
        document.getElementById('mySidenav').style.width = "0px";
        document.body.removeEventListener('keydown', closeMenuOnEscape)
    }
};