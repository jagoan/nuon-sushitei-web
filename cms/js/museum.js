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
		'searching': false,
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
			'url': CONFIG.API_URL + 'game?entryid=museum',
			'data': function(data) {
				console.log(data);
				// Read values
				//var follower = $('.filter-follower input[type=search]').val();

				// Append to data
				//data.filterByFollower = follower;
			},
			'beforeSend': function (request) {
				request.setRequestHeader("x-access-token", token);
			}
		},
		'columns': [
			{ 
				data: null,
				width: "30px" 
			},
			{ 
				data: null,
				width: "30px" 
			},
			/*{ data: 'id' },
			{ data: 'name' },
			{ data: 'value' },
			{ 	
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
                className: "museum-details",
                render: function(data, type, row) { 
					var imageUrl = (row.details[0]['image_url']) ? row.details[0]['image_url']:CONFIG.MAIN_URL + 'cms/img/default-image.jpg';
					return `<h4>` + row.category + `</h4>
					<div class="museum-segment museum-image">
						<img src="` + imageUrl + `" class="img-fluid"/>
						<i class="fa fa-pencil-alt link" data-id="` +  row.details[0]['id'] + `" data-toggle="modal" data-target="#museum-edit-` + row.details[0]['datatype'] + `"></i>
						<i class="fa fa-circle-info link" data-toggle="tooltip" title="` + row.details[0]['tooltip'] + `"></i>
					</div>
					<div class="museum-segment"><label>Title <i class="fa fa-pencil-alt link" data-id="` +  row.details[3]['id'] + `" data-toggle="modal" data-target="#museum-edit-` + row.details[3]['datatype'] + `"></i><i class="fa fa-circle-info link" data-toggle="tooltip" title="` + row.details[3]['tooltip'] + `"></i></label><div>` + row.details[3]['value'] + `</div></div>
					<div class="museum-segment"><label>Subtitle <i class="fa fa-pencil-alt link" data-id="` +  row.details[4]['id'] + `" data-toggle="modal" data-target="#museum-edit-` + row.details[4]['datatype'] + `"></i><i class="fa fa-circle-info link" data-toggle="tooltip" title="` + row.details[4]['tooltip'] + `"></i></label><div>` + row.details[4]['value'] + `</div></div>
					<div class="museum-segment"><label>Description <i class="fa fa-pencil-alt link" data-id="` +  row.details[5]['id'] + `" data-toggle="modal" data-target="#museum-edit-` + row.details[5]['datatype'] + `"></i><i class="fa fa-circle-info link" data-toggle="tooltip" title="` + row.details[5]['tooltip'] + `"></i></label><div>` + nl2br(row.details[5]['value']) + `</div></div>`; 
				},
                orderable: false,
				width: "20px"
            },
		],
		'pageLength': 2,
		'lengthMenu': [[2, 4, 8, 100], [2, 4, 8, "All"]],
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


	/***** Close Modal *****/
	$('.modal').on('hide.bs.modal', function() {
		$('.alert-message').text('');
		$('.alert-message').hide();
		$('.input-id').val('');
		$('.form-label').text('Value');
		$('.input-name').val('');
		$('.input-value').val('');
		$('.input-file').val('');
		$('.delete-link').text('');
		$('.delete-code').text('');
		$('.delete-description').text('');
		$('.delete-expired').text('');
		$('.delete-player').text('');
		$('.delete-claimed').text('');
		$('#summernote').summernote('code', '');
		//console.log('Modal closed');
	});


	/***** Publish Game Config to DataStore *****/
	$('.datastore-publish').on('click', function() {
		$('.overlay').show();
		//console.log(name);

		$.ajax({
			url			: CONFIG.API_URL + 'game/publish/museum',
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


	/***** Submit Game Config Edit File *****/
	$('#museum-edit-file .submit-edit').on('click', function() {
		$('.overlay').show();
		const file		= $('#museum-edit-file .input-file').prop('files')[0];
		var idConfig	= $('#museum-edit-file .input-id').val();
		var name		= $('#museum-edit-file .input-name').val();
		//console.log(name);

		let formData = new FormData();
		formData.append('file', file);
		formData.append('description', name);
		//formData.append('logo_3d', logo3d);

		$.ajax({
			url			: CONFIG.API_URL + 'game/upload',
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
					$('#museum-edit-file').modal('hide');
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
			$('.alert-message').text(msg.responseJSON.message);
			$('.alert-message').show();
			$('.overlay').hide();
		});		
	});


	/***** Modal - Game Config Edit - Rich Text *****/
	$('#museum-edit-text').on('show.bs.modal', function (event) {
		var button	= $(event.relatedTarget);
		var id		= button.data('id');
		//var blog	= button.data('blog');
		//var modal	= $(this);
		//console.log(report.is_approve);
		//console.log(report);
		//console.log(blog.description);	

		$('#summernote').summernote({
			// other options
			dialogsInBody: true,			
			height: 300,
			toolbar: [
				// [groupName, [list of button]]
				['style', ['bold', 'italic', 'underline', 'clear']],
				//['fontsize', ['fontsize']],
				//['para', ['ul', 'ol', 'paragraph']],
				//['insert', ['link', 'picture', 'video']],
				//['insert', ['link']],
			],
			callbacks: {
				/*onKeydown: function(e) {
					// Enter
					if (e.keyCode === 13) {
						e.preventDefault();
						var selection = window.getSelection();

						if (!selection.rangeCount) {
							return;
						}

						var range = selection.getRangeAt(0);
						// Buat <br/>
						var br = document.createElement('br');
						// Hapus selection kalau ada
						range.deleteContents();
						// Masukkan BR
						range.insertNode(br);
						// Pindahkan cursor setelah BR
						range.setStartAfter(br);
						range.setEndAfter(br);
						selection.removeAllRanges();
						selection.addRange(range);
					}
				}*/
			}
		});		

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
					$('.form-label').text(data.data[0]['label']);
					$('.input-name').val(data.data[0]['name']);
					$('.input-value').val(data.data[0]['value']);
					$('#summernote').summernote('code', data.data[0]['value']);
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});	
	});


	/***** Modal - Game Config Edit *****/
	$('#museum-edit-string, #museum-edit-file').on('show.bs.modal', function (event) {
		var button	= $(event.relatedTarget);
		var id		= button.data('id');
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
					$('.form-label').text(data.data[0]['label']);
					$('.input-name').val(data.data[0]['name']);
					$('.input-value').val(data.data[0]['value']);
				}
			}

		}).done(function() {
			//table.draw(false);

		}).fail(function( msg ) {
			//alert( "Fail: " + JSON.stringify(msg) );
			console.log( "Fail: " + JSON.stringify(msg) );
		});	
	});


	/***** Submit Game Config Edit String *****/
	$('#museum-edit-string .submit-edit').on('click', function() {
		$('.overlay').show();
		var idConfig		= $('#museum-edit-string .input-id').val();
		var name			= $('#museum-edit-string .input-name').val();
		var value			= $('#museum-edit-string .input-value').val();
		//var point		= $('#logo-edit .input-point').val();
		//const logo3d	= $('#logo-edit .input-logo-3d').prop('files')[0];
		//console.log(isDeleteImage);

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
									$('#museum-edit-string').modal('hide');
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


	/***** Submit Game Config Edit Text *****/
	$('#museum-edit-text .submit-edit').on('click', function() {
		$('.overlay').show();
		var idConfig		= $('#museum-edit-text .input-id').val();
		var name			= $('#museum-edit-text .input-name').val();
		var value			= cleanSummernote($('#museum-edit-text .input-value').val());
		//var point		= $('#logo-edit .input-point').val();
		//const logo3d	= $('#logo-edit .input-logo-3d').prop('files')[0];
		//console.log(isDeleteImage);

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
					$('#museum-edit-text').modal('hide');
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

function cleanSummernote(content) {

    return content
        .replace(/<br\s*\/?>/gi, '<br/>')

        .replace(/<\/p>\s*<p[^>]*>/gi, '<br/>')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '<br/>')

        .replace(/<\/div>\s*<div[^>]*>/gi, '<br/>')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/div>/gi, '<br/>')

        .replace(/(<br\/>){3,}/gi, '<br/><br/>')

		// <span ...> dan </span> → hapus
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '');
		
}

const headTitle = `
	<title>Museum - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);