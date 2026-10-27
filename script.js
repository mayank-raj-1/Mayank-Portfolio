// Wait until the HTML is fully loaded before looking for elements.
document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroTitleAnimation();
    setupNeuralNetworkAnimation();
});

function setupMobileNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const primaryNavigation = document.querySelector("#primary-navigation");

    // Stop safely if the navigation elements are not available.
    if (!navToggle || !primaryNavigation) {
        return;
    }

    const mobileMenuQuery = window.matchMedia("(max-width: 980px)");
    const navigationLinks = primaryNavigation.querySelectorAll("a");

    function setMenuState(isOpen) {
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
        navToggle.textContent = isOpen ? "Close" : "Menu";

        // The hidden attribute keeps the menu closed on mobile without needing CSS edits.
        if (mobileMenuQuery.matches) {
            primaryNavigation.hidden = !isOpen;
        } else {
            primaryNavigation.hidden = false;
        }
    }

    function closeMenu() {
        setMenuState(false);
    }

    function syncMenuWithScreenSize() {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        if (mobileMenuQuery.matches) {
            primaryNavigation.hidden = !isOpen;
        } else {
            primaryNavigation.hidden = false;
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Open navigation menu");
            navToggle.textContent = "Menu";
        }
    }

    navToggle.addEventListener("click", function () {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    if (typeof mobileMenuQuery.addEventListener === "function") {
        mobileMenuQuery.addEventListener("change", syncMenuWithScreenSize);
    } else {
        mobileMenuQuery.addListener(syncMenuWithScreenSize);
    }

    syncMenuWithScreenSize();
}

function setupHeroTitleAnimation() {
    const titleText = document.querySelector(".hero-title-placeholder span");

    // Stop safely if the hero title placeholder is not available.
    if (!titleText) {
        return;
    }

    const titles = [
        "Salesforce Developer",
        "C++ Programmer",
        "Software Developer"
    ];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
        titleText.textContent = titles[0];
        return;
    }

    let titleIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;

    function typeTitle() {
        const currentTitle = titles[titleIndex];

        if (isDeleting) {
            letterIndex -= 1;
        } else {
            letterIndex += 1;
        }

        titleText.textContent = currentTitle.slice(0, letterIndex);

        let delay = isDeleting ? 45 : 85;

        if (!isDeleting && letterIndex === currentTitle.length) {
            delay = 1400;
            isDeleting = true;
        }

        if (isDeleting && letterIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            delay = 350;
        }

        window.setTimeout(typeTitle, delay);
    }

    titleText.textContent = "";
    typeTitle();
}

function setupNeuralNetworkAnimation() {
    const canvas = document.querySelector("#neural-network-canvas");

    // Stop safely if the canvas is not available.
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = {
        x: 0,
        y: 0,
        isInsideCanvas: false
    };

    let nodes = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let animationFrameId = null;

    function getNodeCount() {
        const area = canvasWidth * canvasHeight;
        const count = Math.floor(area / 10500);

        return Math.max(26, Math.min(count, 58));
    }

    function createNode() {
        const speed = 0.18 + Math.random() * 0.35;
        const angle = Math.random() * Math.PI * 2;

        return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2.6 + Math.random() * 2.4
        };
    }

    function createNodes() {
        const nodeCount = getNodeCount();

        nodes = [];

        for (let index = 0; index < nodeCount; index += 1) {
            nodes.push(createNode());
        }
    }

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const bounds = canvas.getBoundingClientRect();

        canvasWidth = Math.max(bounds.width, 1);
        canvasHeight = Math.max(bounds.height, 1);

        canvas.width = Math.floor(canvasWidth * pixelRatio);
        canvas.height = Math.floor(canvasHeight * pixelRatio);

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        createNodes();
        drawNetwork();
    }

    function updateNodes() {
        nodes.forEach(function (node) {
            node.x += node.vx;
            node.y += node.vy;

            if (mouse.isInsideCanvas) {
                const dx = node.x - mouse.x;
                const dy = node.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionDistance = 170;

                if (distance > 0 && distance < interactionDistance) {
                    const force = (interactionDistance - distance) / interactionDistance;
                    node.x += (dx / distance) * force * 1.55;
                    node.y += (dy / distance) * force * 1.55;
                }
            }

            if (node.x <= node.radius || node.x >= canvasWidth - node.radius) {
                node.vx *= -1;
                node.x = Math.min(Math.max(node.x, node.radius), canvasWidth - node.radius);
            }

            if (node.y <= node.radius || node.y >= canvasHeight - node.radius) {
                node.vy *= -1;
                node.y = Math.min(Math.max(node.y, node.radius), canvasHeight - node.radius);
            }
        });
    }

    function drawLines() {
        const connectionDistance = Math.min(185, Math.max(120, canvasWidth * 0.34));

        for (let firstIndex = 0; firstIndex < nodes.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < nodes.length; secondIndex += 1) {
                const firstNode = nodes[firstIndex];
                const secondNode = nodes[secondIndex];
                const dx = firstNode.x - secondNode.x;
                const dy = firstNode.y - secondNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = 1 - distance / connectionDistance;

                    context.beginPath();
                    context.moveTo(firstNode.x, firstNode.y);
                    context.lineTo(secondNode.x, secondNode.y);
                    context.strokeStyle = "rgba(46, 252, 156, " + opacity * 0.46 + ")";
                    context.lineWidth = 1.15;
                    context.stroke();
                }
            }
        }
    }

    function drawNodes() {
        nodes.forEach(function (node) {
            context.beginPath();
            context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            context.fillStyle = "rgba(46, 252, 156, 0.96)";
            context.shadowColor = "rgba(46, 252, 156, 0.45)";
            context.shadowBlur = 12;
            context.fill();
            context.shadowBlur = 0;
        });
    }

    function drawNetwork() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        drawLines();
        drawNodes();
    }

    function animateNetwork() {
        updateNodes();
        drawNetwork();
        animationFrameId = window.requestAnimationFrame(animateNetwork);
    }

    function startAnimation() {
        if (animationFrameId !== null || prefersReducedMotion.matches || document.hidden) {
            drawNetwork();
            return;
        }

        animationFrameId = window.requestAnimationFrame(animateNetwork);
    }

    function stopAnimation() {
        if (animationFrameId === null) {
            return;
        }

        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    }

    function updateMousePosition(event) {
        const bounds = canvas.getBoundingClientRect();

        mouse.x = event.clientX - bounds.left;
        mouse.y = event.clientY - bounds.top;
        mouse.isInsideCanvas = true;
    }

    function clearMousePosition() {
        mouse.isInsideCanvas = false;
    }

    function handleReducedMotionChange() {
        stopAnimation();
        drawNetwork();
        startAnimation();
    }

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("mousemove", updateMousePosition);
    canvas.addEventListener("mouseleave", clearMousePosition);

    if (typeof prefersReducedMotion.addEventListener === "function") {
        prefersReducedMotion.addEventListener("change", handleReducedMotionChange);
    } else {
        prefersReducedMotion.addListener(handleReducedMotionChange);
    }

    resizeCanvas();
    startAnimation();
}
