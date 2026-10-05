document.addEventListener("DOMContentLoaded", function () {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    if (!pageName) {
        return;
    }

    const scriptPage = document.createElement("script");
    scriptPage.src = "js/" + pageName + ".js" + "?v=" + Date.now();
    scriptPage.defer = true;
    document.head.appendChild(scriptPage);

    if (pageName != "login") {
        const scriptPassword = document.createElement("script");
        scriptPassword.src = "js/password-change.js" + "?v=" + Date.now();
        scriptPassword.defer = true;
        document.head.appendChild(scriptPassword);
    }
    
});