$(document).ready(function() {
	/***** CHECK LOGIN STATUS *****/
	$('.overlay').show();
    const token = localStorage.getItem(CONFIG.PREFIX + "token");
    if (!token) {
        localStorage.removeItem(CONFIG.PREFIX + "token");
        window.location.replace("login.html");
    }
    $('.overlay').hide();
	//console.log("Token:", token);
	

    /***** COUPON LIST *****/
	var table	= $('#dataTable').DataTable({
		'processing': true,
		'serverSide': true,
		'language'	: {
			'infoFiltered': ''
		},
		'columnDefs': [
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 0 ],
                "orderable": false,
                "searchable": false
            }
        ],
		//'order': [[ 6, "asc" ]],
		'serverMethod': 'get',
		'ajax': {
			'url': CONFIG.API_URL + 'admin',
			'data': function(data) {
				// data sent to the server
				console.log(data);
				//var filterValue = $('#config-filter').val();

				// Append to data
				//data.filterConfig = filterValue;
			},
			'beforeSend': function (request) {
				request.setRequestHeader("x-access-token", token);
			},
			error: function (xhr, error, thrown) {
				if (xhr.status === 401) {
					window.location.href = 'logout.html';
					return;
				}

				console.error('AJAX Error:', xhr.status, thrown);
				alert('Gagal mengambil data dari server.');
			}
		},
		'columns': [
			{ data: null },
			{ data: 'id' },
			{ data: 'username' },
			{ data: 'email' },
			{ data: 'role_name' },
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { 
					return '<span data-toggle="tooltip" title="Edit"><i class="fa fa-pencil-alt link" data-id="' + data.id + '" data-toggle="modal" data-target="#admin-edit"/></span>'; 
				},
                orderable: false,
				width: "50px"
            },
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { 
					if (data.role === 'ROLE01') {
						return '';
					} else {
						return '<span data-toggle="tooltip" title="Delete"><i class="fa fa-trash link" data-id="'+data.id+'" data-toggle="modal" data-target="#admin-delete"/></span>'; 
					}
				},
                orderable: false,
				width: "50px"
            },
		],
		"drawCallback": function(settings) {
			$('[data-toggle="tooltip"]').tooltip();
		}				
	});

    table.on( 'draw.dt', function () {
        var PageInfo = $('#dataTable').DataTable().page.info();
        table.column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });	

	/***** Filter Config *****/
	$('#config-filter').on('change', function() {
		var filterValue = $(this).val();
		table.column(6).search(filterValue).draw();
	});

	/***** Close Modal *****/
	$('.modal').on('hide.bs.modal', function() {
		$('.alert-message').text('');
		$('.alert-message').hide();
		$('.input-id').val('');
		$('.input-username').val('');
		$('.input-password').val('');
		$('.input-email').val('');
		$('.input-role').val('');
		$(document.activeElement).blur();
		//console.log('Modal closed');
	});


	/***** Submit Coupon Add *****/
	$('#admin-add .submit-add').on('click', function(e) {
		$('.overlay').show();
		var idAdmin		= $('#admin-add .input-id').val();
		var username	= $('#admin-add .input-username').val();
		var password	= $('#admin-add .input-password').val();
		var email		= $('#admin-add .input-email').val();
		var role		= $('#admin-add .input-role').val();

		$.ajax({
			url			: CONFIG.API_URL + 'admin/create',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								username: username,
								password: password,
								email: email,
								role: role
							}),
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("x-access-token", token);
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
								//data	= JSON.parse(data);
								console.log(data);
								//console.log(data.status);
								if (data.status == "SUCCESS") {
									$('#admin-add').modal('hide');
									table.draw(false);
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
	});


	/***** Modal - Admin Edit *****/
	$('#admin-edit').on('show.bs.modal', function (event) {
		var button		= $(event.relatedTarget);
		var id			= button.data('id');

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'admin/' + id,
			type		: 'GET',
			cache		: false,
			processData	: false,
			contentType	: false,
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("x-access-token", token);
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
				//data	= JSON.parse(data);
				console.log(data);            
				//console.log(data.status);
				if (data.status == "SUCCESS") {
					$('#admin-edit .input-id').val(id);
					$('#admin-edit .input-username').val(data.data[0]['username']);
					$('#admin-edit .input-email').val(data.data[0]['email']);
					$('#admin-edit .input-role option[value="' + data.data[0]['role'] + '"]').prop('selected', true);

					if (data.data[0]['username'] == 'admin') {
						$('#admin-edit .input-role option[value="ROLE02"]').prop('selected', true);
						$('#admin-edit .input-username').prop('disabled', true);
						$('#admin-edit .input-password').prop('disabled', true);
						$('#admin-edit .input-role').prop('disabled', true);
					}

				} else {
					$('.alert-message').text(data.message);
					$('.alert-message').show();
					$('.overlay').hide();	
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});			
	});


	/***** Submit Admin Edit *****/
	$('#admin-edit .submit-edit').on('click', function(e) {
		$('.overlay').show();
		var idAdmin	= $('#admin-edit .input-id').val();
		var username	= $('#admin-edit .input-username').val();
		var email		= $('#admin-edit .input-email').val();
		var role		= $('#admin-edit .input-role').val();
		var password	= $('#admin-edit .input-password').val();

		e.preventDefault();
		const jsonData = {};

		$('#admin-edit .input-object-container .form-inline').each(function() {
			const item = $(this).find('.item').val();
			const value = $(this).find('.value').val();
			if (item) {
				jsonData[item] = Number(value);
			}
		});
		//console.log(Object.keys(jsonData).length);
		const jsonString = (Object.keys(jsonData).length > 0) ? JSON.stringify(jsonData) : "";
		//console.log(jsonString);

		$.ajax({
			url			: CONFIG.API_URL + 'admin/update',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								id: idAdmin,
								username: username,
								email: email,
								role: role,
								password: password
							}),	
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("x-access-token", token);
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
								//data	= JSON.parse(data);
								console.log(data);
								//console.log(data.status);
								if (data.status == "SUCCESS") {
									$('#admin-edit').modal('hide');
									table.draw(false);
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
	});


	/***** Modal - Admin Delete *****/
	$('#admin-delete').on('show.bs.modal', function (event) {
		var button	= $(event.relatedTarget);
		var id		= button.data('id');
		console.log(id);

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'admin/' + id,
			type		: 'GET',
			cache		: false,
			processData	: false,
			contentType	: false,
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("x-access-token", token);
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
				//data	= JSON.parse(data);
				console.log(data);            
				//console.log(data.status);
				if (data.status == "SUCCESS") {
					$('#admin-delete .input-id').val(data.data[0]['username']);
					$('#admin-delete .delete-username').html(data.data[0]['username']);
					$('#admin-delete .delete-email').html(data.data[0]['email']);
					$('#admin-delete .delete-access').html(data.data[0]['role_name']);					
				
				} else {
					$('.alert-message').text(data.message);
					$('.alert-message').show();
					$('.overlay').hide();
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});	
		
	});


	/***** Delete Admin *****/
	$('.submit-delete').on('click', function() {
		$('.overlay').show();
		//var id	= $(this).data('id');
		var id	= $('#admin-delete .input-id').val();
		console.log(id);

		$.ajax({
			url			: CONFIG.API_URL + 'admin/' + id,
			type		: 'DELETE',
			dataType	: 'json',
			cache		: false,
			data		: { },
			headers		: { "cache-control": "no-cache" },
			beforeSend	: function(xhr) {
								xhr.setRequestHeader("x-access-token", token);
								xhr.setRequestHeader("Cache-Control", "no-cache");
							},
			success		: function(data) {
				console.log(data);
				if (data.status == "SUCCESS") {
					$('#admin-delete').modal('hide');
					table.draw(false);
					$('.overlay').hide();

				} else {
					$('.alert-message').text(data.message);
					$('.alert-message').show();
					$('.overlay').hide();
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});		
	});
	
});

const headTitle = `
	<title>Admin - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);