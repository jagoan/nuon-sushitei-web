$(document).ready(function() {
  const $input = $('#voucherCode');
  const $slots = $('#codeSlots .slot');

  // Focus input when clicking anywhere on slots area
  $('.code-input-container').on('click', function() {
    $input.focus();
  });

  // Handle Input Changes
  $input.on('input propertychange', function() {
    let val = $(this).val().toUpperCase();
    // Allow alphanumeric characters only
    val = val.replace(/[^A-Z0-9]/g, '');
    $(this).val(val);

    updateSlots(val);
  });

  // Update visual slot display
  function updateSlots(val) {
    $slots.each(function(index) {
      const char = val[index] || '';
      $(this).text(char);
      
      // Toggle CSS classes for active slot / filled slots
      $(this).removeClass('has-char active caret');
      
      if (char !== '') {
        $(this).addClass('has-char');
      }

      if (index === val.length) {
        $(this).addClass('active caret');
      }
    });

    if (val.length === 0) {
      $slots.eq(0).addClass('active caret');
    }
  }

  // Initialize focus state
  $input.focus();
  updateSlots('');

  // Submit Button Handler
  $('#btnSubmit').on('click', function() {
    const code = $input.val().trim();

    if (code.length === 0) {
      showToast('Harap masukkan kode voucher terlebih dahulu!', 'error');
      $input.focus();
      return;
    }

    if (code.length != 6) {
      showToast('Kode voucher harus 6 karakter!', 'error');
      $input.focus();
      return;
    }

    // Voucher validation API call
    $(this).prop('disabled', true).text('Verifying...');

    $.ajax({
        url:"https://suteigustaging.sushiteigroup.co.id/api/voucher/convert",
        method:"POST",
        contentType:"application/json",
        dataType:"json",
        data:JSON.stringify({
            voucher_code:code
        }),

        success:function(res){
          //console.log(code + " => " + res.data[0].voucher_link);

          if(res.status=='SUCCESS'){
            //console.log(res.data[0].voucher_link);
            var url=res.data[0].voucher_link;

            //window.location.href=url;
            window.open(url, '_blank');

            showToast('Selamat! Kode Voucher ' + code + ' Berhasil Diklaim!', 'success');
            $('#voucherCode').val("");
            $('#codeSlots .slot').text("").removeClass('has-char active caret');
            $('#codeSlots .slot').eq(0).addClass('active caret');
            $('#btnSubmit').prop('disabled', false).text('Submit');
            return;
          }

          showToast(res.message || "Voucher code not found.", 'error');

          $('#btnSubmit').prop('disabled', false).text('Submit');
          $('#voucherCode').select();
        },

        error:function(xhr){
          let msg="An error occurred on the server.";

          if (xhr.responseJSON) {
            msg=xhr.responseJSON.message || msg;

          } else if (xhr.responseText) {
            try {
              let obj=JSON.parse(xhr.responseText);
              msg=obj.message || msg;

            } catch(e) {
              msg=xhr.responseText;
            }
          }

          showToast(msg, 'error');

          $('#btnSubmit').prop('disabled', false).text('Submit');
          $('#voucherCode').select();
        }

    });


    // Simulate voucher validation API call
    /*setTimeout(function() {
      showToast('Selamat! Kode Voucher ' + code + ' Berhasil Diklaim!', 'success');
      $('#btnSubmit').prop('disabled', false).text('Submit');
      // Reset input
      $input.val('');
      updateSlots('');
    }, 1200);*/
  });

  // Info Icon Tooltip Click
  $('#infoBtn').on('click', function() {
    showToast('Ikuti langkah-langkah di bawah untuk mendapatkan kode voucher.');
  });

  // Helper Function: Toast Notification
  function showToast(message, type = '') {
    const $toast = $('#toast');
    $toast.text(message).removeClass('success error').addClass('show');
    if (type) {
      $toast.addClass(type);
    }

    setTimeout(function() {
      $toast.removeClass('show');
    }, 3000);
  }
});
