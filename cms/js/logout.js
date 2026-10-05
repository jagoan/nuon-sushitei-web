$(document).ready(function() {

    /***** LOGOUT *****/
	$('.overlay').show();
    localStorage.removeItem(CONFIG.PREFIX + "token");
    window.location.replace("login.html");
    $('.overlay').hide();
    console.log("Token:", localStorage.getItem(CONFIG.PREFIX + "token"));

});