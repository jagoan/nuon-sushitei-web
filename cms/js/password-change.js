$(document).ready(function() {
	console.log('Password');

	/***** CHECK LOGIN STATUS *****/	
    const token = localStorage.getItem(CONFIG.PREFIX + "token");    
	//console.log("Token:", token);

	/***** Close Modal *****/
	$('.modal').on('hide.bs.modal', function() {
		$('.alert-message').text('');
		$('.alert-message').hide();
		$('.input-password-current').val('');
		$('.input-password').val('');
		$('.input-password-2').val('');
	});


	/***** Edit Password *****/
	$('#password-edit .submit-password').on('click', function() {
		//console.log('Submit Password');
		$('.overlay').show();
		//var id			= $(this).data('id');
		var passwordCurrent	= $('#password-edit .input-password-current').val();
		var password		= $('#password-edit .input-password').val();
		var password2		= $('#password-edit .input-password-2').val();
		//console.log(role);

		if (!passwordCurrent || !password || !password2) {
			$('.alert-message').text('All fields are mandatory');
			$('.alert-message').show();
			$('.overlay').hide();

		} else if (password != password2) {
			$('.alert-message').text('New Password & Confirm Password not match');
			$('.alert-message').show();
			$('.overlay').hide();

		} else {
			$.ajax({
				url			: CONFIG.API_URL + 'admin/password',
				type		: 'PUT',
				cache		: false,
				processData	: false,
				contentType	: 'application/json',
				data		: JSON.stringify({
									passwordCurrent:passwordCurrent, 
									password:password
								}),
				headers		: { "cache-control": "no-cache" },
				beforeSend	: function(xhr) {
									xhr.setRequestHeader("x-access-token", token);
									xhr.setRequestHeader("Cache-Control", "no-cache");
								},
				success		: function(data) {
									console.log(data);
									if (data.status == "SUCCESS") {
										$('#password-edit').modal('hide');
										$('.overlay').hide();

									} else {
										$('.alert-message').text(data.message);
										$('.alert-message').show();
										$('.overlay').hide();
									}
								},
				error		: function(xhr, status, error) {
									//console.log("Error: " + error + " - " + status + " - " + xhr.responseJSON.message);
									//$('.alert-message').text("An error occurred while updating the game config.");
									$('.alert-message').text(xhr.responseJSON.message || "An error occurred while updating the game config.");
									$('.alert-message').show();
									$('.overlay').hide();
								}

			}).done(function() {
				//table.draw(false);

			}).fail(function( msg ) {
				//alert( "Fail: " + JSON.stringify(msg) );
				console.log( "Fail: " + JSON.stringify(msg) );
			});				
		}

	});
	
});
