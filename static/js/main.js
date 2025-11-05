document.addEventListener("DOMContentLoaded", function () {
    const collapsibles = document.querySelectorAll(".collapsible-header");

    // Initialize collapsibles that are already active
    document
        .querySelectorAll(".collapsible.active .collapsible-content")
        .forEach((content) => {
            content.style.maxHeight = content.scrollHeight + "px";
        });

    collapsibles.forEach((header) => {
        header.addEventListener("click", function () {
            const content = this.nextElementSibling;
            const parent = this.parentElement;

            // Toggle active class
            parent.classList.toggle("active");

            // Toggle content visibility
            if (content.classList.contains("active")) {
                content.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                content.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
