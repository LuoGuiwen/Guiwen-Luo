(function () {
	var link = document.getElementById("email-link");
	if (link) {
		var user = link.getAttribute("data-user");
		var domain = link.getAttribute("data-domain");
		if (user && domain) {
			var addr = user + "@" + domain;
			link.href = "mailto:" + addr;
			link.textContent = addr;
		}
	}

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

	// Subtle scroll-in (Apple-style section reveals)
	var revealTargets = document.querySelectorAll(
		".band-inner, .hero-inner, .card, .tile, .gallery-item"
	);
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
	} else {
		revealTargets.forEach(function (el) {
			el.classList.add("is-visible");
		});
	}
})();
