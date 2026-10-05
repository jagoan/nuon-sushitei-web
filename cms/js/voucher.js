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
	

    /***** VOUCHER LIST *****/
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
			'url': CONFIG.API_URL + 'voucher',
			'data': function(data) {
				// data sent to the server
				console.log(data);
				var filterValue = $('#voucher-filter').val();

				// Append to data
				data.filterVoucher = filterValue;
			},
			'beforeSend': function (request) {
				request.setRequestHeader("x-access-token", token);
			}
		},
		'columns': [
			{ data: null },
			{ data: 'id' },
			{ data: 'voucher_code' },
			{ data: 'voucher_description' },
			{ data: 'voucher_expired' },
			{
                data: 'player',
                render: function(data, type, row) { 
					return row.player; 
				},
                width: "120px"
            },
			{ data: 'claimed_at' },
			/*{ 	
				data: 'is_featured',
				render: function(data, type, row) { 
					if (data == '1') {
						return '<span class="text-success">Featured</span>'; 
					} else {
						return '<span class="text-secondary">Regular</span>'; 
					}
				},
				width: "90px"
			},
            {
                data: 'report_media',
                render: function(data, type, row) { 
					/ *var fileImage	= ['jpg', 'png', 'gif'];
					if (row.report_media_ext == 'mp4') {
						return 'Video'; 
					} else if (fileImage.includes(row.report_media_ext)) {
						return 'Foto';
					} else {
						return '';
					}* /
					return row.report_media_all;
				},
                width: "90px"
            },*/
			/*{
                data: null,
                className: "data-action",
                render: function(data, type, row) { return '<i class="fa fa-file link" data-id="'+data.id_article+'" data-toggle="modal" data-target="#blog-preview"/>'; },
                orderable: false,
				width: "20px"
            },
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { return '<i class="fa fa-pencil-alt link" data-id="'+data.id_article+'" data-toggle="modal" data-target="#blog-edit"/>'; },
                orderable: false,
				width: "20px"
            },*/
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { return '<i class="fa fa-trash link" data-id="'+data.id+'" data-toggle="modal" data-target="#voucher-delete"/>'; },
                orderable: false,
				width: "20px"
            },
		],
		//'pageLength': 6,
		//'lengthMenu': [[6, 10, 25, 50], [6, 10, 25, 50]]			
	});

    table.on( 'draw.dt', function () {
        var PageInfo = $('#dataTable').DataTable().page.info();
        table.column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });	

	/***** Filter Voucher *****/
	$('#voucher-filter').on('change', function() {
		var filterValue = $(this).val();
		table.column(6).search(filterValue).draw();
	});

	/***** Close Modal *****/
	$('.modal').on('hide.bs.modal', function() {
		$('.alert-message').text('');
		$('.alert-message').hide();
		$('.input-id').val('');
		$('.input-file').val('');
		$('.delete-link').text('');
		$('.delete-code').text('');
		$('.delete-description').text('');
		$('.delete-expired').text('');
		$('.delete-player').text('');
		$('.delete-claimed').text('');
		//console.log('Modal closed');
	});


	/***** Submit Vooucher Upload *****/
	$('.submit-upload').on('click', function() {
		$('.overlay').show();
		const file		= $('#voucher-upload .input-file').prop('files')[0];
		//var point		= $('#logo-edit .input-point').val();
		//var mediaDelete	= ($('#blog-edit .input-media-delete').is(':checked')) ? "delete":"";
		//const logo3d	= $('#logo-edit .input-logo-3d').prop('files')[0];
		//console.log(name);

		let formData = new FormData();
		formData.append('file', file);
		//formData.append('delete_media', mediaDelete);
		//formData.append('logo_3d', logo3d);

		$.ajax({
			url			: CONFIG.API_URL + 'voucher/upload',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: false,
			data		: formData,
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
									$('#voucher-upload').modal('hide');
									table.draw(false);
									$('.overlay').hide();

								} else {
									$('.alert-message').text(data.message);
									$('.alert-message').show();
									$('.overlay').hide();
								}
							},
			error		: function(xhr, status, error) {
								console.log("Error: " + error + " - " + status + " - " + xhr.responseJSON.message);
								//$('.alert-message').text("An error occurred while updating the game config.");
								var itemVoucher = "";
								const voucherLink = xhr.responseJSON && xhr.responseJSON.voucher_link ? xhr.responseJSON.voucher_link : "";
								voucherLink.forEach(item => {
									itemVoucher += item + "\n";
								});
								
								//console.log("Voucher Link:", voucherLink.length);
								if (voucherLink.length > 0) {
									$('.alert-message').html(`Voucher link already exist in the database: <br><pre>${itemVoucher}</pre>`);
									//console.log("Voucher Link:", itemVoucher);
								} else {
									$('.alert-message').text(xhr.responseJSON.message || "An error occurred while updating the game config.");
								}
								//const errorMessage = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "An error occurred while updating the game config.";
								//$('.alert-message').text(errorMessage);
								$('.alert-message').show();
								$('.overlay').hide();
							}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
			//$('.alert-message').text(msg.responseJSON.message);
			//$('.alert-message').show();
			//$('.overlay').hide();
		});		
	});

	
	/**** Voucher Download *****/
	$('#voucher-download').on('click', function() {
		$('.overlay').show();
		const searchValue = $('#dataTable_filter input').val();
		const filterValue = $('#voucher-filter').val();
		console.log("Search Value:", searchValue);
		console.log("Filter Value:", filterValue);

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'voucher/export?search=' + encodeURIComponent(searchValue) + '&filterVoucher=' + encodeURIComponent(filterValue),
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
					const fileUrl = (data.data.file) ? CONFIG.API_URL.slice(0, -4) + 'files/' + data.data.file : null;
					if (fileUrl) {
						//window.location.href = fileUrl;
						window.open(fileUrl, '_blank', 'noopener,noreferrer');
					}
					$('.overlay').hide();
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
			$('.overlay').hide();
		});	
	});
	

	/***** Modal - Voucher Delete *****/
	$('#voucher-delete').on('show.bs.modal', function (event) {
		var button	= $(event.relatedTarget);
		var id		= button.data('id');
		//var blog	= button.data('blog');
		//var modal	= $(this);
		//console.log(product.role);
		console.log(id);
		//console.log(blog.reply_time_string);

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'voucher/' + id,
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
					$('.delete-link').html(data.data[0]['voucher_link']);
					$('.delete-code').html(data.data[0]['voucher_code']);
					$('.delete-description').html(data.data[0]['voucher_description']);
					$('.delete-expired').html(data.data[0]['voucher_expired']);
					$('.delete-player').html(data.data[0]['player']);
					$('.delete-claimed').html(data.data[0]['claimed_at']);
					$('.input-id').val(id);
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});	
		
	});


	/***** Delete Voucher *****/
	$('.submit-delete').on('click', function() {
		$('.overlay').show();
		//var id	= $(this).data('id');
		var id	= $('#voucher-delete .input-id').val();
		console.log(id);

		$.ajax({
			url			: CONFIG.API_URL + 'voucher/' + id,
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
					$('#voucher-delete').modal('hide');
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
	<title>Voucher - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);