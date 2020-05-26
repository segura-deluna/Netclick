window.addEventListener('DOMContentLoaded', (event) => {

	const leftMenu = document.querySelector('.left-menu');
	const hamburger = document.querySelector('.hamburger');


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
		const target = event.target;
		const dropdown = target.closest('.dropdown');
		if (dropdown) {
			dropdown.classList.toggle('active');
			leftMenu.classList.add('openMenu');
			hamburger.classList.add('open');
		}
	});


	const changeImage = document.querySelectorAll('.tv-card__img');
	changeImage.forEach((img) => {
		const image = img.src;
		const imageDuble = img.getAttribute('data-backdrop');
		img.addEventListener('mouseover', () => {
			img.src = imageDuble;
		})
		img.addEventListener('mouseout', () => {
			img.src = image;
		})
	});

});



