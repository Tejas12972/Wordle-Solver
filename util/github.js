document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#changelog a").addEventListener("click", function(event) {
        window.open(this.href, "_blank");
    });
});