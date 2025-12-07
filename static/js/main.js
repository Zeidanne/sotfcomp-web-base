document.addEventListener("DOMContentLoaded", function () {
    const collapsibles = document.querySelectorAll(".collapsible-header");

    // Initialize collapsibles that are already active
    document
        .querySelectorAll(".collapsible.active .collapsible-content")
        .forEach((content) => {
            // Use 'none' to allow dynamic content height
            content.style.maxHeight = "none";
        });

    collapsibles.forEach((header) => {
        header.addEventListener("click", function () {
            const content = this.nextElementSibling;
            const parent = this.parentElement;

            // Toggle active class
            parent.classList.toggle("active");

            // Toggle content visibility
            if (content.classList.contains("active")) {
                // Collapse: first set explicit height, then animate to 0
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.remove("active");
                // Force reflow then animate
                content.offsetHeight;
                content.style.maxHeight = "0";
            } else {
                // Expand: set to scrollHeight, then after animation set to 'none'
                content.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
                
                // After transition, set to 'none' to allow dynamic content
                setTimeout(() => {
                    if (content.classList.contains("active")) {
                        content.style.maxHeight = "none";
                    }
                }, 500); // Match the CSS transition duration
            }
        });
    });

    // Rule card toggle functionality
    const ruleCards = document.querySelectorAll(".rule-card");
    ruleCards.forEach((card) => {
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) {
            // Set initial state
            if (checkbox.checked) {
                card.classList.add("active");
            }

            checkbox.addEventListener("change", function () {
                if (this.checked) {
                    card.classList.add("active");
                } else {
                    card.classList.remove("active");
                }
            });

            // Make entire card clickable
            card.addEventListener("click", function (e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event("change"));
                }
            });
        }
    });

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // Add animation class to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    document.querySelectorAll(".collapsible").forEach((el) => {
        observer.observe(el);
    });
});

// Helper function to add loading state to buttons
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span> Memproses...';
        button.disabled = true;
        button.style.opacity = "0.7";
    } else {
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.disabled = false;
        button.style.opacity = "1";
    }
}

// Helper function to show toast notification
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
