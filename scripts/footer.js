document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".mapButton").forEach(button => {

        button.addEventListener("click", () => {
            window.location.href = "../../wayfinderapp.html";
        });

    });

});