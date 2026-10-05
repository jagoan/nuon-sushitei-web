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
	

    /***** GAME CONFIG LIST *****/
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
			'url': CONFIG.API_URL + 'game?entryid=items',
			'data': function(data) {
				// data sent to the server
				console.log(data);
				var filterValue = $('#config-filter').val();

				// Append to data
				data.filterConfig = filterValue;
			},
			'beforeSend': function (request) {
				request.setRequestHeader("x-access-token", token);
			}
		},
		'columns': [
			{ data: null },
			{ data: 'id' },
			{ data: 'category' },
			{ data: 'label' },
			{ 	
				data: null,
				render: function(data, type, row) { 
					if (data.datatype == 'object' || data.datatype == 'object-fixed' || data.datatype == 'object-option') {
						/* parse JSON string into object */
						const jsonString	= data.value;
						const jsonData		= JSON.parse(jsonString);
						const items 		= Object.entries(jsonData).map(([item, value]) => ({ item, value }));
						var newValue = '';
						items.forEach(({ item, value }) => {
							newValue += item + ': ' + value + '<br>';
						});
						return newValue; 

					} else {
						return data.value; 
					}
				},
				orderable: false
			},
            /*{
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
                render: function(data, type, row) { return '<i class="fa fa-pencil-alt link" data-id="' + data.id + '" data-type="' + data.datatype + '" data-toggle="modal" data-target="#game-edit-' + data.datatype + '"/>'; },
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
		$('.input-name').val('');
		$('.input-value').val('');
		$(document.activeElement).blur();
		//console.log('Modal closed');
	});


	/***** Publish Game Config to DataStore *****/
	$('.datastore-publish').on('click', function() {
		$('.overlay').show();
		//console.log(name);

		$.ajax({
			url			: CONFIG.API_URL + 'game/publish/items',
			type		: 'POST',
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
			$('.alert-message').text(msg.responseJSON.message);
			$('.alert-message').show();
			$('.overlay').hide();
		});		
	});


	/***** Modal - Game Config Edit Object *****/
	$('#game-edit-object, #game-edit-object-fixed, #game-edit-object-option').on('show.bs.modal', function (event) {
		var button		= $(event.relatedTarget);
		var id			= button.data('id');
		var dataType	= button.data('type');		

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'game/' + id,
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
					$('.input-name').val(data.data[0]['name']);
					$('.input-label').val(data.data[0]['category'] + ' - ' + data.data[0]['label']);
					//$('.input-value').val(data.data[0]['value']);

					/* parse JSON string into object and create input rows */
					const jsonString	= data.data[0]['value'];
					const jsonData		= JSON.parse(jsonString);
					const items 		= Object.entries(jsonData).map(([item, value]) => ({ item, value }));
					$('.input-object-container').html('');
					items.forEach(({ item, value }) => {
						if (dataType == 'object') {
							$('.input-object-container').append(
								createItemIngredient(item, value)
							);
						} else if (dataType == 'object-fixed') {
							$('.input-object-container').append(
								updateItemValue(item, value)
							);
						} else if (dataType == 'object-option') {
							$('.input-object-container').append(
								createItemOption(item, value)
							);
						}
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
	const itemOptions = [ "rice", "cucumber", "wasabi", "ginger", "salmon", "tuna", "shrimp", "crab", "nori", "beef", "chicken", "egg", "milk", "soda", "mocktail", "tea", "coffee" ];

	/* select ingredient - edit object*/
	function createItemIngredient(item = "", value = "") {
		let options = `<option value="">Select Ingredient</option>`;
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

	$('#btn-add').on('click', function() {
		$('.input-object-container').append(
			createItemIngredient()
		);
	});

	/* update item value - edit object fixed*/
	function updateItemValue(item = "", value = "") {
		return `
			<div class="form-inline mb-2">
				<input
					type="text"
					name="items[]"
					class="item form-control w-auto mr-2"
					value="${item}"
					disabled
				>
				<input 
					type="number" 
					step="any"
					name="value[]" 
					class="value form-control w-25"
					value="${value}"
				>
			</div>
		`;
	}

	/* create option row - edit object option - restaurant decoration */
	function createItemOption(key = "", option = {}) {
		return `
			<div class="option-row border-bottom mb-3 pb-3">
				<div class="form-inline mb-2">
					<label class="col-form-label w-25 justify-content-start">Decoration ID</label>
					<input
						type="text"
						class="option-key form-control w-75"
						value="${key}"
						placeholder="Decoration ID from the game frontend"
					>
				</div>
				<div class="form-inline mb-2">
					<label class="col-form-label w-25 justify-content-start">Name</label>
					<input
						type="text"
						class="option-name form-control w-75"
						value="${option.name ?? ""}"
						placeholder="Name of the decoration"
					>
				</div>
				<div class="form-inline mb-2">
					<label class="col-form-label w-25 justify-content-start">Cost</label>
					<input
						type="number"
						class="option-cost form-control w-25"
						value="${option.cost ?? 0}"
					>
				</div>

				<button type="button" class="btn-remove-option btn-danger btn btn-sm">
					Remove
				</button>
			</div>
		`;
	}

	$('.input-object-container').on('click', '.btn-remove-option', function() {
		$(this).closest('.option-row').remove();
	});

	$('#btn-add-option').on('click', function() {
		$('.input-object-container').append(
			createItemOption()
		);
	});

	/***** Submit Game Config Edit Object *****/
	$('#game-edit-object .submit-edit, #game-edit-object-fixed .submit-edit').on('click', function(e) {
		$('.overlay').show();
		var dataType	= $(this).val();
		var idConfig	= $('#game-edit-'+dataType+' .input-id').val();
		var name		= $('#game-edit-'+dataType+' .input-name').val();

		e.preventDefault();
		const jsonData = {};

		$('#game-edit-'+dataType+' .input-object-container .form-inline').each(function() {
			const item = $(this).find('.item').val();
			const value = $(this).find('.value').val();
			if (item) {
				jsonData[item] = Number(value);
			}
		});
		//console.log(Object.keys(jsonData).length);
		const jsonString = (Object.keys(jsonData).length > 0) ? JSON.stringify(jsonData) : "";
		console.log(jsonString);

		$.ajax({
			url			: CONFIG.API_URL + 'game/update',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								name: name,
								value: jsonString
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
									$('#game-edit-'+dataType).modal('hide');
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


	/***** Modal - Game Config Edit *****/
	$('#game-edit-string, #game-edit-boolean, #game-edit-number').on('show.bs.modal', function (event) {
		var button		= $(event.relatedTarget);
		var id			= button.data('id');
		var dataType	= button.data('type');
		//var blog	= button.data('blog');
		//var modal	= $(this);
		//console.log(report.is_approve);
		//console.log(report);
		//console.log(blog.description);	

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'game/' + id,
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
					$('.input-name').val(data.data[0]['name']);
					$('.input-label').val(data.data[0]['label']);

					if (dataType == 'boolean') {
						$('input[name="input-radio"][value="' + data.data[0]['value'] + '"]').prop('checked', true);
					} else {
						$('.input-value').val(data.data[0]['value']);
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


	/***** Submit Game Config Edit *****/
	$('#game-edit-string .submit-edit, #game-edit-number .submit-edit, #game-edit-boolean .submit-edit').on('click', function() {
		$('.overlay').show();
		var dataType	= $(this).val();
		var idConfig	= $('#game-edit-'+dataType+' .input-id').val();
		var name		= $('#game-edit-'+dataType+' .input-name').val();
		if (dataType == 'boolean') {			
			var value 		= $('input[name="input-radio"]:checked').val();		
		} else {
			var value 		= $('#game-edit-'+dataType+' .input-value').val();
		}

		$.ajax({
			url			: CONFIG.API_URL + 'game/update',
			type		: 'POST',
			cache		: false,
			processData	: false,
			contentType	: 'application/json',
			data		: JSON.stringify({
								name: name,
								value: value
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
									$('#game-edit-' + dataType).modal('hide');
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
	
});

const headTitle = `
	<title>Game Config - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);