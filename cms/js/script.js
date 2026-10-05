$(document).ready(function () {
    /* SB ADMIN JS */
    "use strict";    

    /* Load Components */
    $("[data-include]").each(function () {
        const container = $(this);
        const file = container.data("include");
        const url = getFreshUrl(file);

        container.load(url, function (response, status, xhr) {
            if (status === "success") {
                applyConfig(container);

                if (file === "components/navigation-top.html") {
                    sbNavigationTop();
                } else if (file === "components/navigation-left.html") {
                    sbNavigationLeft();
                }

            } else {
                console.error(
                    "Gagal load component:",
                    file,
                    xhr.status,
                    xhr.statusText
                );
            }
        });
    });
});


function applyConfig(container) {
    // Text
    container.find("[data-config]").each(function () {
        const key = $(this).data("config");
        if (CONFIG[key] !== undefined) {
            $(this).text(CONFIG[key]);
        }
    });

    // href
    container.find("[data-config-href]").each(function () {
        const key = $(this).data("config-href");

        if (CONFIG[key] !== undefined) {
            $(this).attr("href", CONFIG[key]);
        }
    });

    // src
    container.find("[data-config-src]").each(function () {
        const key = $(this).data("config-src");

        if (CONFIG[key] !== undefined) {
            $(this).attr("src", CONFIG[key]);
        }
    });
}

function getFreshUrl(url) {
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + "v=" + Date.now();
}

function sbNavigationTop() {
    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
    console.log("SB Admin Navigation Top Initialized");
}

function sbNavigationLeft() {
    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
        if (this.href === path) {
            $(this).addClass("active");
        }
    });
    console.log("SB Admin Navigation Left Initialized");
}

/* function: nl2br */
function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

/* function: check if json string */
function isJsonString(str) {
    try {
        const result = JSON.parse(str);
        // Optional: Ensure it's an object or array, and not a primitive like a number or boolean
        return typeof result === 'object' && result !== null;
    } catch (e) {
        return false;
    }
}