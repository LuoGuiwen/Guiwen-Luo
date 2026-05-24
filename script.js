(function () {
	document.querySelectorAll(".email-display[data-user][data-domain]").forEach(function (link) {
		var user = link.getAttribute("data-user");
		var domain = link.getAttribute("data-domain");
		var addr = user + "@" + domain;
		link.href = "mailto:" + addr;
		link.textContent = addr;
	});

	// Nav highlight on scroll
	var sections = document.querySelectorAll("main section[id]");
	var navLinks = document.querySelectorAll(".nav-links a[href^='#']");

	if (sections.length && navLinks.length && "IntersectionObserver" in window) {
		var navObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					var id = entry.target.getAttribute("id");
					navLinks.forEach(function (a) {
						a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
					});
				});
			},
			{ rootMargin: "-35% 0px -55% 0px", threshold: 0 }
		);
		sections.forEach(function (section) {
			navObserver.observe(section);
		});
	}

	// Subtle scroll-in (skip contact — hash jumps left it invisible)
	var revealTargets = document.querySelectorAll(
		".band-inner:not(.band-inner-narrow), .hero-inner, .card, .tile, .gallery-item"
	);

	function showReveal(el) {
		el.classList.add("reveal", "is-visible");
	}

	function markRevealsInView() {
		revealTargets.forEach(function (el) {
			if (el.classList.contains("is-visible")) return;
			var rect = el.getBoundingClientRect();
			if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
				el.classList.add("is-visible");
			}
		});
	}

	revealTargets.forEach(function (el) {
		el.classList.add("reveal");
	});

	if ("IntersectionObserver" in window) {
		var revealObserver = new IntersectionObserver(
			function (entries, observer) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
		);
		revealTargets.forEach(function (el) {
			revealObserver.observe(el);
		});
		markRevealsInView();
		window.addEventListener("load", markRevealsInView);
	} else {
		revealTargets.forEach(showReveal);
	}
})();
