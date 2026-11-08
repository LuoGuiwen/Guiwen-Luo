(function () {
	var siteTop = document.querySelector(".site-top");
	var navToggle = document.querySelector(".nav-toggle");
	var navDrawer = document.getElementById("nav-drawer");
	var navBreakpoint = window.matchMedia("(min-width: 768px)");
	var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

	function isNavCompact() {
		return !navBreakpoint.matches;
	}

	function setNavOpen(open) {
		var compact = isNavCompact();
		document.documentElement.classList.toggle("nav-open", open && compact);
		if (navDrawer) {
			navDrawer.setAttribute("aria-hidden", open && compact ? "false" : compact ? "true" : "false");
		}
		if (navToggle) {
			navToggle.setAttribute("aria-expanded", open && compact ? "true" : "false");
			navToggle.setAttribute("aria-label", open && compact ? "Close menu" : "Open menu");
		}
	}

	function updateNavLayout() {
		if (siteTop) {
			siteTop.classList.toggle("nav--inline", navBreakpoint.matches);
		}
		setNavOpen(false);
	}

	updateNavLayout();
	navBreakpoint.addEventListener("change", updateNavLayout);

	if (navToggle && navDrawer) {
		navToggle.addEventListener("click", function () {
			var isOpen = document.documentElement.classList.contains("nav-open");
			setNavOpen(!isOpen);
		});

		navAnchors.forEach(function (anchor) {
			anchor.addEventListener("click", function () {
				if (isNavCompact()) {
					setNavOpen(false);
				}
			});
		});

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
				setNavOpen(false);
			}
		});
	}

	document.querySelectorAll(".email-display[data-user][data-domain]").forEach(function (link) {
		var user = link.getAttribute("data-user");
		var domain = link.getAttribute("data-domain");
		var addr = user + "@" + domain;
		link.href = "mailto:" + addr;
		link.textContent = addr;
	});

	// Nav highlight on scroll
	var sections = document.querySelectorAll("main section[id]");

	if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
		var navObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					var id = entry.target.getAttribute("id");
					navAnchors.forEach(function (a) {
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
