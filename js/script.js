window.addEventListener('DOMContentLoaded', (event) => {

	const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
	const API_KEY = '13f739a99c95d2f5a7c72922facb9534';
	const SERVER = 'https://api.themoviedb.org/3';

	const leftMenu = document.querySelector('.left-menu'),
		hamburger = document.querySelector('.hamburger'),
		tvShowList = document.querySelector('.tv-shows__list'),
		modal = document.querySelector('.modal'),
		tvShows = document.querySelector('.tv-shows'),
		tvCardImg = document.querySelector('.tv-card__img'),
		modalTitle = document.querySelector('.modal__title'),
		genresList = document.querySelector('.genres-list'),
		rating = document.querySelector('.rating'),
		description = document.querySelector('.description'),
		modalLink = document.querySelector('.modal__link'),
		searchForm = document.querySelector('.search__form'),
		searchFormInput = document.querySelector('.search__form-input'),
		preloader = document.querySelector('.preloader'),
		dropdown = document.querySelectorAll('.dropdown'),
		tvShowsHead = document.querySelector('.tv-shows__head'),
		posterWrapper = document.querySelector('.poster__wrapper'),
		modalContent = document.querySelector('.modal__content'),
		pagination = document.querySelector('.pagination');

	const loading = document.createElement('div');
	loading.className = 'loading';


	const DBService = class {

		getData = async (url) => {
			const res = await fetch(url);
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`Не удалось получить данные по адресу ${url}`);
			}
		}

		getTestData = () => {
			return this.getData('test.json');
		}

		getTestCard = () => {
			return this.getData('card.json');
		}

		getSearchResult = query => {
			this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&page=1&include_adult=true&query=${query}`;
			return this.getData(this.temp);
		}

		getNextPage = page => {
			return this.getData(this.temp + '&page=' + page);
		}

		getTvShow = id => {
			return this.getData(SERVER + '/tv/' + id + '?api_key=' + API_KEY + '&language=ru-RU');
		}

		getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);

		getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);

		getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);

		getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);

	}

	const dbService = new DBService();



	// * Render Cards =========================================================

	const renderCard = (responce, target) => {
		tvShowList.textContent = '';

		if (!responce.total_results) {
			loading.remove();
			tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
			tvShowsHead.style.cssText = 'color: red; font-size: 20px;';
			return;
		}

		tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
		tvShowsHead.style.cssText = 'color: #2d2d2d; font-size: 20px;';

		responce.results.forEach((item) => {

			const {
				backdrop_path: backdrop,
				name: title,
				poster_path: poster,
				vote_average: vote,
				id
			} = item;

			const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
			const backdropIMG = backdrop ? IMG_URL + backdrop : '';
			const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

			const card = document.createElement('li');
			card.idTV = id;
			card.className = 'tv-shows__item';
			card.innerHTML = `
				<a href="#" id="${id}" class="tv-card">
					${voteElem}
					<img class="tv-card__img"
						src="${posterIMG}"
						data-backdrop="${backdropIMG}"
						alt="${title}">
					<h4 class="tv-card__head">${title}</h4>
				</a>
			`;
			loading.remove();
			tvShowList.append(card);
		});

		pagination.textContent = '';

		if (!target && responce.total_pages > 1) {
			for (let i = 1; i <= responce.total_pages; i++) {
				pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
			}
		}
	};


	//* Search Form ===========================================================

	searchForm.addEventListener('submit', event => {
		event.preventDefault();

		const value = searchFormInput.value.trim();
		if (value) {
			tvShows.append(loading);
			dbService.getSearchResult(value).then(renderCard);
		}
		searchFormInput.value = '';

	});



	// * Open left menu =======================================================

	const closeDropdown = () => {
		dropdown.forEach(item => {
			item.classList.remove('active');
		});
	}

	hamburger.addEventListener('click', () => {
		leftMenu.classList.toggle('openMenu');
		hamburger.classList.toggle('open');
		closeDropdown();
	});

	document.addEventListener('click', event => {
		if (!event.target.closest('.left-menu')) {
			leftMenu.classList.remove('openMenu');
			hamburger.classList.remove('open');
			closeDropdown();
		}
	});

	leftMenu.addEventListener('click', event => {
		event.preventDefault();
		const target = event.target;
		const dropdown = target.closest('.dropdown');
		if (dropdown) {
			dropdown.classList.toggle('active');
			leftMenu.classList.add('openMenu');
			hamburger.classList.add('open');
		}

		if (target.closest('#top-rated')) {
			dbService.getTopRated().then((responce) => renderCard(responce, target));
		}
		if (target.closest('#popular')) {
			dbService.getPopular().then((responce) => renderCard(responce, target));
		}
		if (target.closest('#week')) {
			dbService.getWeek().then((responce) => renderCard(responce, target));
		}
		if (target.closest('#today')) {
			dbService.getToday().then((responce) => renderCard(responce, target));
		}

		if (target.closest('#search')) {
			tvShowList.textContent = '';
			tvShowsHead.textContent = '';
			pagination.textContent = '';
		}
	});


	// * Change Image Card ====================================================

	const changeImage = event => {
		const card = event.target.closest('.tv-shows__item');
		if (card) {
			const img = card.querySelector('.tv-card__img');

			if (img.dataset.backdrop) {
				[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
			}
		}
	};

	tvShowList.addEventListener('mouseover', changeImage);
	tvShowList.addEventListener('mouseout', changeImage);

	pagination.addEventListener('click', event => {
		event.preventDefault();
		const target = event.target;

		if (target.classList.contains('pages')) {
			tvShows.append(loading);
			dbService.getNextPage(target.textContent).then(renderCard);
		}
	});




	// * Open modal ===============================================================

	tvShowList.addEventListener('click', event => {

		event.preventDefault();

		const target = event.target;
		const card = target.closest('.tv-card');

		if (card) {

			preloader.style.display = 'block';

			dbService.getTvShow(card.id)
				.then(({
					poster_path: posterPath,
					name: title,
					genres,
					vote_average: voteAverage,
					overview,
					homepage }) => {

					if (posterPath) {
						tvCardImg.src = IMG_URL + posterPath;
						tvCardImg.alt = title;
						posterWrapper.style.display = '';
						modalContent.style.padding = '35px 50px 35px 150px';
					} else {
						posterWrapper.style.display = 'none';
						modalContent.style.padding = '35px 50px';
					}

					modalTitle.textContent = title;

					// * Получение списка жанров:
					genresList.textContent = '';
					for (const item of genres) {
						genresList.innerHTML += `<li>${item.name}</li>`;
					}
					// * Альтернативный вариант получения данных списка жанров:
					// genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');

					// * Получение рейтинга:
					rating.textContent = voteAverage;

					// * Описание:
					description.textContent = overview;

					// * Домашняя страница:
					modalLink.href = homepage;
				})

				.then(() => {
					document.body.style.overflow = 'hidden';
					modal.classList.remove('hide');
				})

				.finally(() => {
					preloader.style.display = 'none';
				});

			document.body.style.overflow = 'hidden';
			modal.classList.remove('hide');
		}

	});

	// * Close modal =================================================================

	modal.addEventListener('click', event => {
		if (event.target.closest('.cross') ||
			event.target.classList.contains('modal')) {
			document.body.style.overflow = '';
			modal.classList.add('hide');
		}
	});


});



