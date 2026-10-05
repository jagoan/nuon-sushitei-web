$(document).ready(function() {	

	/***** CHECK LOGIN STATUS *****/
	$('.overlay').show();
    const token = localStorage.getItem(CONFIG.PREFIX + "token");
    if (token) {
        window.location.replace("voucher.html");
    }
    $('.overlay').hide();


    /***** LOGIN *****/
	$('.submit-login').on('click', function(event) {
		event.preventDefault();
		$('.overlay').show();

		var username	= $('.input-username').val();
		var password	= $('.input-password').val();   
		//console.log(role);
        
		$.ajax({
			url			: CONFIG.API_URL + 'admin/login',
			type		: 'POST',
			dataType	: 'json',
			cache		: false,
			data		: { username:username, password:password },
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
				console.log(data);
				if (data.status == "SUCCESS") {
                    localStorage.setItem(CONFIG.PREFIX + "token", data.data.token);
                    window.location.replace("voucher.html");
					$('.overlay').hide();

				} else {
					$('.alert-message').removeClass('alert-success');
					$('.alert-message').addClass('alert-danger');
					$('.alert-message').text(data.message);
					$('.alert-message').show();
					$('.overlay').hide();
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			$('.alert-message').removeClass('alert-success');
			$('.alert-message').addClass('alert-danger');
			$('.alert-message').text(msg.responseJSON.message);
			$('.alert-message').show();
			$('.overlay').hide();
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg.responseJSON) );
		});		
	});	
	
});

const headTitle = `
	<title>Login - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);