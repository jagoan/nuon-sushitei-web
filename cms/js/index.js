$(document).ready(function() {

    /***** CHECK LOGIN STATUS *****/
	$('.overlay').show();

    const token = localStorage.getItem(CONFIG.PREFIX + "token");
    if (token) {
        window.location.replace("voucher.html");
    } else {
        localStorage.removeItem(CONFIG.PREFIX + "token");
        window.location.replace("login.html");
    }

    $('.overlay').hide();

});