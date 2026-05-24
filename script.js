(function () {
	var siteTop = document.querySelector(".site-top");
	var navToggle = document.querySelector(".nav-toggle");
	var navDrawer = document.getElementById("nav-drawer");
	var navLinks = document.querySelector(".nav-drawer .nav-links");
	var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

	function isNavCompact() {
		return siteTop && !siteTop.classList.contains("nav--inline");
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

	var navMeasureProbe = null;

	function measureInlineLinksWidth() {
		if (!navMeasureProbe) {
			navMeasureProbe = document.createElement("div");
			navMeasureProbe.className = "nav-measure-probe";
			navMeasureProbe.setAttribute("aria-hidden", "true");
			document.body.appendChild(navMeasureProbe);
		}

		var row = document.createElement("div");
		row.className = "nav-measure-row";
		navLinks.querySelectorAll("a").forEach(function (anchor) {
			var item = document.createElement("span");
			item.className = "nav-measure-link";
			item.textContent = anchor.textContent;
			row.appendChild(item);
		});
		navMeasureProbe.textContent = "";
		navMeasureProbe.appendChild(row);

		return row.scrollWidth;
	}

	/* Fold before links touch the logo; require slack before expanding again */
	var NAV_COLLAPSE_BUFFER = 2;
	var NAV_EXPAND_SLACK = 12;

	function navRowWidth(navInner, logo) {
		var innerStyle = getComputedStyle(navInner);
		var gap = parseFloat(innerStyle.columnGap || innerStyle.gap) || 0;
		var logoW = logo ? logo.offsetWidth : 0;
		var linksW = measureInlineLinksWidth();
		return logoW + (logoW > 0 && linksW > 0 ? gap : 0) + linksW;
	}

	function navFitsOneRow(navInner, logo, isInline) {
		var needed = navRowWidth(navInner, logo);
		var available = navInner.clientWidth;

		if (isInline) {
			return needed <= available - NAV_COLLAPSE_BUFFER;
		}
		return needed <= available - NAV_EXPAND_SLACK;
	}

	function updateNavLayout() {
		var navInner = document.querySelector(".nav-inner");
		var logo = document.querySelector(".nav-logo");
		if (!siteTop || !navLinks || !navInner) return;

		var isInline = siteTop.classList.contains("nav--inline");
		var fits = navFitsOneRow(navInner, logo, isInline);

		if (fits !== isInline) {
			if (!fits) {
				document.documentElement.classList.remove("nav-open");
				if (navDrawer) {
					navDrawer.setAttribute("aria-hidden", "true");
				}
				if (navToggle) {
					navToggle.setAttribute("aria-expanded", "false");
					navToggle.setAttribute("aria-label", "Open menu");
				}
				siteTop.classList.add("nav-mode-switch");
				siteTop.classList.remove("nav--inline");
				requestAnimationFrame(function () {
					siteTop.classList.remove("nav-mode-switch");
				});
			} else {
				siteTop.classList.add("nav--inline");
			}
		}

		if (fits) {
			setNavOpen(false);
			if (navDrawer) {
				navDrawer.setAttribute("aria-hidden", "false");
			}
		} else if (navDrawer && !document.documentElement.classList.contains("nav-open")) {
			navDrawer.setAttribute("aria-hidden", "true");
		}
	}

	if (siteTop && navLinks) {
		var navInnerEl = document.querySelector(".nav-inner");
		var layoutTimer = 0;
		var resizeActive = false;

		function setNavResizing(active) {
			document.documentElement.classList.toggle("nav-resizing", active);
		}

		updateNavLayout();

		function scheduleNavLayout(immediate) {
			if (immediate) {
				clearTimeout(layoutTimer);
				setNavResizing(false);
				updateNavLayout();
				return;
			}

			if (!resizeActive) {
				resizeActive = true;
				setNavResizing(true);
				setNavOpen(false);
			}

			clearTimeout(layoutTimer);
			layoutTimer = setTimeout(function () {
				resizeActive = false;
				setNavResizing(false);
				updateNavLayout();
			}, 180);
		}

		if (navInnerEl && "ResizeObserver" in window) {
			var layoutObserver = new ResizeObserver(function () {
				scheduleNavLayout(false);
			});
			layoutObserver.observe(navInnerEl);
		} else {
			window.addEventListener("resize", function () {
				scheduleNavLayout(false);
			});
		}

		window.addEventListener("load", function () {
			scheduleNavLayout(true);
		});
	}

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
