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
		preloader = document.querySelector('.preloader');

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
			return this.getData(SERVER + '/search/tv?api_key=' + API_KEY +
				'&page=1&include_adult=true&query=' + query);
		}

		getTvShow = id => {
			return this.getData(SERVER + '/tv/' + id + '?api_key=' + API_KEY + '&language=ru-RU');
		}

	}



	// * Render Cards =========================================================

	const renderCard = responce => {
		tvShowList.textContent = '';
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
	};

	searchForm.addEventListener('submit', event => {
		event.preventDefault();

		const value = searchFormInput.value.trim();
		if (value) {
			tvShows.append(loading);
			new DBService().getSearchResult(value).then(renderCard);
		}
		searchFormInput.value = '';

	});



	// * Open menu ===============================================================

	hamburger.addEventListener('click', () => {
		leftMenu.classList.toggle('openMenu');
		hamburger.classList.toggle('open');
	});

	document.addEventListener('click', event => {
		if (!event.target.closest('.left-menu')) {
			leftMenu.classList.remove('openMenu');
			hamburger.classList.remove('open');
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
	});


	// * Change Image ============================================================

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


	// * Open modal ===============================================================

	tvShowList.addEventListener('click', event => {

		event.preventDefault();

		const target = event.target;
		const card = target.closest('.tv-card');

		if (card) {

			preloader.style.display = 'block';

			new DBService().getTvShow(card.id)
				.then(data => {
					tvCardImg.src = IMG_URL + data.poster_path;
					tvCardImg.alt = data.name;
					modalTitle.textContent = data.name;
					// * Получение списка жанров:
					genresList.textContent = '';
					for (const item of data.genres) {
						genresList.innerHTML += `<li>${item.name}</li>`;
					}
					// * Альтернативный вариант получения данных списка жанров:
					// genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
					// * Получение рейтинга:
					rating.textContent = data.vote;
					// * Описание:
					description.textContent = data.overview;
					// * Домашняя страница:
					modalLink.href = data.homepage;
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



