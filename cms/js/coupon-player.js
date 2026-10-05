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
			'url': CONFIG.API_URL + 'coupon/player',
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
			{ data: null },
			{ data: 'id' },
			{ data: 'player' },
			{ data: 'coupon_code' },
			{ data: 'redeemed_at' },
			/*{
                data: 'player',
                render: function(data, type, row) { 
					return row.player; 
				},
                width: "120px"
            },
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
            },
            {
                data: null,
                className: "data-action",
                render: function(data, type, row) { return '<i class="fa fa-trash link" data-id="'+data.id+'" data-toggle="modal" data-target="#voucher-delete"/>'; },
                orderable: false,
				width: "20px"
            },*/
		]				
	});

    table.on( 'draw.dt', function () {
        var PageInfo = $('#dataTable').DataTable().page.info();
        table.column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });	


    /**** Player Redeemed Download *****/
	$('#player-download').on('click', function() {
		$('.overlay').show();
		const searchValue = $('#dataTable_filter input').val();
		console.log("Search Value:", searchValue);

		/* get data */
		$.ajax({
			url			: CONFIG.API_URL + 'coupon/export?search=' + encodeURIComponent(searchValue),
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
	
});

const headTitle = `
	<title>Coupon: Player Redeemed - ${CONFIG.SITE_NAME}</title>
`;
// Inserts the HTML string right before the closing </head> tag
document.head.insertAdjacentHTML('beforeend', headTitle);