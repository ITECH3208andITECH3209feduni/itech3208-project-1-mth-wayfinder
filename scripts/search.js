let buildings = [];

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("pageSearch");
    const results = document.getElementById("searchResults");

    if (!searchInput) return;

    fetch("../../data/buildings.geojson")
        .then(response => response.json())
        .then(data => {

            buildings = data.features
                .filter(feature => feature.properties?.page)
                .map(feature => ({
                    name: feature.properties.name,
                    page: feature.properties.page
                }));

        });

    searchInput.addEventListener("input", () => {

        const query = searchInput.value.toLowerCase().trim();

        results.innerHTML = "";

        if (!query) {
            results.style.display = "none";
            return;
        }

        const matches = buildings.filter(building =>
            building.name.toLowerCase().includes(query)
        );

        matches.forEach(building => {

            const result = document.createElement("div");

            result.className = "search-result";

            result.textContent = building.name;

            result.addEventListener("click", () => {
                window.location.href = "../../" + building.page;
            });

            results.appendChild(result);

        });

        results.style.display =
            matches.length > 0 ? "block" : "none";
    });

    document.addEventListener("click", (event) => {

        if (!event.target.closest(".search-bar")) {
            results.style.display = "none";
        }

    });

});