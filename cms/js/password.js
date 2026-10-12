$(document).ready(function() {	

	/***** CHECK LOGIN STATUS *****/
	$('.overlay').show();
    const token = localStorage.getItem(CONFIG.PREFIX + "token");
    if (token) {
        window.location.replace("voucher.html");
    }
    $('.overlay').hide();


    /***** RESET PASSWORD *****/
	$('.reset-password').on('click', function(event) {
		event.preventDefault();
		$('.overlay').show();

		var email	= $('.input-email').val();   
		//console.log(role);
        
		$.ajax({
			url			: CONFIG.API_URL + 'admin/password',
			type		: 'POST',
			dataType	: 'json',
			cache		: false,
			data		: { email:email },
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
				console.log(data);
				if (data.status == "SUCCESS") {
                    $('.alert-message').removeClass('alert-danger');
					$('.alert-message').addClass('alert-success');
					$('.alert-message').text('New password already sent to your email.');
					$('.alert-message').show();
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
	<title>Forgot Password - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);