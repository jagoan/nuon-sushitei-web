$(document).ready(function() {
	console.log('Coupon');

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
			'url': CONFIG.API_URL + 'coupon',
			'data': function(data) {
				// data sent to the server
				console.log(data);
				//var filterValue = $('#config-filter').val();

				// Append to data
				//data.filterConfig = filterValue;
			},
			'beforeSend': function (request) {
				request.setRequestHeader("x-access-token", token);
			}
		},
		'columns': [
			{ data: null },
			{ data: 'id' },
			{ data: 'coupon_code' },
			{ data: 'coupon_description' },
			{ 	
				data: null,
				render: function(data, type, row) { 
					if (isJsonString(data.coupon_reward)) {
						/* parse JSON string into object */
						const jsonString	= data.coupon_reward;
						const jsonData		= JSON.parse(jsonString);
						const items 		= Object.entries(jsonData).map(([item, value]) => ({ item, value }));
						var newValue = '';
						items.forEach(({ item, value }) => {
							newValue += item + ': ' + value + '<br>';
						});
						return newValue; 

					} else {
						return data.coupon_reward; 
					}
				},
				orderable: false
			},
            {
                data: 'is_active',
                render: function(data, type, row) { 
					if (row.is_active == true) {
						return '<span class="text-success">Active</span>'; 
                    } else {
						return '<span class="text-secondary">Inactive</span>';
					}
				},
                width: "90px"
            },
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
                render: function(data, type, row) { return '<i class="fa fa-pencil-alt link" data-id="' + data.id + '" data-toggle="modal" data-target="#coupon-edit"/>'; },
                orderable: false,
				width: "20px"
            },
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { return '<i class="fa fa-trash link" data-id="'+data.id+'" data-toggle="modal" data-target="#coupon-delete"/>'; },
                orderable: false,
				width: "20px"
            },
		]				
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
		$('.input-code').val('');
		$('.input-description').val('');
		$('.input-status[value="true"]').prop("checked", true);
		$('.form-inline').html('');
		$(document.activeElement).blur();
		//console.log('Modal closed');
	});


	/***** Submit Coupon Add *****/
	$('#coupon-add .submit-add').on('click', function(e) {
		$('.overlay').show();
		var idConfig	= $('#coupon-add .input-id').val();
		var code		= $('#coupon-add .input-code').val();
		var description	= $('#coupon-add .input-description').val();
		var status		= $('#coupon-add .input-status:checked').val();

		e.preventDefault();
		const jsonData = {};

		$('#coupon-add .input-object-container .form-inline').each(function() {
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
			url			: CONFIG.API_URL + 'coupon/add',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								coupon_code: code,
								coupon_description: description,
								is_active: status,
								coupon_reward: jsonString
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
									$('#coupon-add').modal('hide');
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


	/***** Modal - Coupon Edit *****/
	$('#coupon-edit').on('show.bs.modal', function (event) {
		var button		= $(event.relatedTarget);
		var id			= button.data('id');

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'coupon/' + id,
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
					$('#coupon-edit .input-id').val(id);
					$('#coupon-edit .input-code').val(data.data[0]['coupon_code']);
					$('#coupon-edit .input-description').val(data.data[0]['coupon_description']);
					$('#coupon-edit .input-status[value="' + data.data[0]['is_active'] + '"]').prop('checked', true);

					/* parse JSON string into object and create input rows */
					const jsonString	= data.data[0]['coupon_reward'];
					const jsonData		= JSON.parse(jsonString);
					const items 		= Object.entries(jsonData).map(([item, value]) => ({ item, value }));
					$('#coupon-edit .input-object-container').html('');
					items.forEach(({ item, value }) => {
						$('#coupon-edit .input-object-container').append(
							createItemIngredient(item, value)
						);
					});
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});			
	});

	/* ingredient options */
	const itemOptions = [ "rice", "cucumber", "wasabi", "ginger", "salmon", "tuna", "shrimp", "crab", "nori", "beef", "chicken", "egg", "milk", "soda", "mocktail", "tea", "coffee", "coins", "fragments" ];

	/* select ingredient */
	function createItemIngredient(item = "", value = "") {
		let options = `<option value="">Select Reward</option>`;
		itemOptions.forEach(option => {
			options += `
				<option value="${option}" ${option === item ? "selected" : ""}>
					${option}
				</option>
			`;
		});

		return `
			<div class="form-inline mb-2">
				<select name="item[]" class="item form-control w-auto mr-2">
					${options}
				</select>

				<input 
					type="number" 
					step="any"
					name="value[]" 
					class="value form-control w-25"
					value="${value}"
				>

				<button type="button" class="btn-remove btn-danger btn btn-sm ml-2">
					Remove
				</button>
			</div>
		`;
	}

	$('.input-object-container').on('click', '.btn-remove', function() {
		$(this).closest('.form-inline').remove();
	});

	$('.btn-add').on('click', function() {
		$('.input-object-container').append(
			createItemIngredient()
		);
		console.log('Added new item row');
	});

	/***** Submit Coupon Edit *****/
	$('#coupon-edit .submit-edit').on('click', function(e) {
		$('.overlay').show();
		var idConfig	= $('#coupon-edit .input-id').val();
		var code		= $('#coupon-edit .input-code').val();
		var description	= $('#coupon-edit .input-description').val();
		var status		= $('#coupon-edit .input-status:checked').val();

		e.preventDefault();
		const jsonData = {};

		$('#coupon-edit .input-object-container .form-inline').each(function() {
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
			url			: CONFIG.API_URL + 'coupon/update',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								id: idConfig,
								coupon_code: code,
								coupon_description: description,
								is_active: status,
								coupon_reward: jsonString
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
									$('#coupon-edit').modal('hide');
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


	/***** Modal - Coupon Delete *****/
	$('#coupon-delete').on('show.bs.modal', function (event) {
		var button	= $(event.relatedTarget);
		var id		= button.data('id');
		//var blog	= button.data('blog');
		//var modal	= $(this);
		//console.log(product.role);
		console.log(id);
		//console.log(blog.reply_time_string);

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'coupon/' + id,
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
					$('#coupon-delete .input-id').val(id);
					$('#coupon-delete .delete-code').html(data.data[0]['coupon_code']);
					$('#coupon-delete .delete-description').html(data.data[0]['coupon_description']);
					
					if (isJsonString(data.data[0]['coupon_reward'])) {
						/* parse JSON string into object */
						const jsonString	= data.data[0]['coupon_reward'];
						const jsonData		= JSON.parse(jsonString);
						const items 		= Object.entries(jsonData).map(([item, value]) => ({ item, value }));
						var newValue = '';
						items.forEach(({ item, value }) => {
							newValue += item + ': ' + value + '<br>';
						});
						$('#coupon-delete .delete-reward').html(newValue);

					} else {
						$('#coupon-delete .delete-reward').html(data.data[0]['coupon_reward']);
					}

					if (data.data[0]['is_active'] == true) {
						$('#coupon-delete .delete-status').html('<span class="text-success">Active</span>');
					} else {
						$('#coupon-delete .delete-status').html('<span class="text-secondary">Inactive</span>');
					}
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});	
		
	});


	/***** Delete Coupon *****/
	$('.submit-delete').on('click', function() {
		$('.overlay').show();
		//var id	= $(this).data('id');
		var id	= $('#coupon-delete .input-id').val();
		console.log(id);

		$.ajax({
			url			: CONFIG.API_URL + 'coupon/' + id,
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
					$('#coupon-delete').modal('hide');
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
	<title>Coupon - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);