let appUtils = {
  showAlert : (msg) => {
    alert(msg);
  },
  /* showLoading bootstrap */
  showLoading : function(target, bFull = false) {        
    if (bFull) {
      if (!target.classList.contains('container-loading')) {        
        var spinnerHtml = document.createElement('div');
        spinnerHtml.classList.add('container-loader');
        spinnerHtml.innerHTML = app.panel.loader.html;
        target.classList.add('container-loading');
        target.appendChild(spinnerHtml);      
      } 
    } else if (target.classList.contains(app.panel.class)) {
      if (!target.classList.contains(app.panel.loadingClass)) {
        var targetBody = target.querySelector('.'+ app.panel.bodyClass);
        var spinnerHtml = document.createElement('div');
        spinnerHtml.classList.add(app.panel.loader.class);
        spinnerHtml.innerHTML = app.panel.loader.html;
        target.classList.add(app.panel.loadingClass);
        targetBody.appendChild(spinnerHtml);      
      }
    } else if (target.classList.contains('login-container')) {
      if (!target.classList.contains('container-loading')) {        
        var spinnerHtml = document.createElement('div');
        spinnerHtml.classList.add('container-loader');
        spinnerHtml.innerHTML = app.panel.loader.html;
        target.classList.add('container-loading');
        target.appendChild(spinnerHtml);      
      }      
    } else {
      
    }
  },
  /* hide Loading bootstrap */
  hideLoading : function(target, bFull = false) {
    if (bFull) {
      target.classList.remove('container-loading');
      target.querySelector('.container-loader').remove();      
    } else if (target.classList.contains(app.panel.class)) {
      target.classList.remove(app.panel.loadingClass);
      target.querySelector('.'+ app.panel.loader.class).remove();    
    } else if (target.classList.contains('login-container')) {
      target.classList.remove('container-loading');
      target.querySelector('.container-loader').remove();          
    }
  },
  /* ajax json datatype */
  ajaxJSON: function(url, data, sCallback, sError, modal) {
    if (typeof $ === 'function')
    {
      if (typeof modal !== 'undefined') modal.modal('show');

      $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'JSON',
        cache: false,
        success: function(dt) {
          if (dt.result == '102') {
            alert(dt.msg);
            document.location.href = dt.rUrl;
          } else if (typeof sCallback === 'function') {
            sCallback(dt);
          } else {
            console.log(dt);
          }
        },
        complete: function() {
          if (typeof modal !== 'undefined') modal.modal('hide');
        }, 
        error: function(j, s, e) {        
          console.log("code:"+j.status+"\n"+"message:"+j.responseText+"\n"+"error:"+e);
          if (typeof sError === 'function') {            
            sError(j);
          }
        }
      });
    } else console.log('jQuery undefined');
  },
  //Ajax file Json
  ajaxFileJSON: function(url, data, sCallback, modal, sError) {
    if (typeof $ === 'function')
    {
      if (typeof modal !== 'undefined') modal.modal('show');

      $.ajax({
        url: url,
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        cache: false,
        //success: typeof sCallback === 'function'?sCallback:function(dt) {console.log(dt)},
        success: function(dt) {
          if (dt.result == '102') {
            alert(dt.msg);
            document.location.href = dt.rUrl;
          } else if (typeof sCallback === 'function') {
            sCallback(dt);
          } else {
            console.log(dt);
          }
        },
        complete: function() {
          if (typeof modal !== 'undefined') modal.modal('hide');
        },
        error: function(j, s, e) {       
          if (typeof sError !== 'function') {
            console.log("code:"+j.status+"\n"+"message:"+j.responseText+"\n"+"error:"+e);
          } else {
            sError(j);
          }
        }
      });
    } else console.log('jQuery undefined');
  }, 
  /* init page */  
  page_init: function()
  {    
    document.location.href = window.location.pathname
  },
  /* reload page */
  page_link: function()
  {    
    $("#listForm")[0].action = window.location.pathname;
    $("#listForm")[0].submit();
  },
  /* view page content */
  page_view: function(bId, link)
  {
    $("#listForm")[0].s_mode.value = 'edit';
    $("#listForm")[0].s_bId.value = bId;
    $("#listForm")[0].action = link;
    $("#listForm")[0].submit();
  },
  /* move page */
  page_move: function(page)
  {
    $("#listForm")[0].s_page.value = page;   
    this.page_link();
  },
  /* search page */
  page_search: function()
  {
    let obj = $(event.target);

    if (!obj.is('button')) {
      obj.prop('readonly', true);
      obj.parent().find('button').prop('disabled', true);
    } else {
      obj.prop('disabled', true);
    }

    this.page_move(1);
  },
  //페이지새로고침
  page_reload: function()
  {   
    location.reload();
    //this.page_link();
  },  
  //소팅
  page_sorting: function(obj)
  {
    let frm = $(obj).parents('form[name=listForm]').eq(0);
    let s_order = $(obj).data('order');
    
    if (s_order) {
      let s_orderdir = $(obj).hasClass('sorting_desc')?'asc':'desc';

      frm.find('input[name=s_order]').val(s_order);
      frm.find('input[name=s_orderdir]').val(s_orderdir);

      appUtils.page_link();
    }
  },
  //달력표시
  setDatePicker : function(id) {
    if (typeof $ === 'function' && typeof $.datepicker === 'object') {
      $(id).datepicker({
        todayHighlight: true,
        autoclose: true,
        startDate: '2021-01-1',
        language: 'ko',
        clearBtn: true,
        zIndexOffset: 100
      });
    }      
  }, 
  //parse bank number
  parseBankNumber: function(num) {
    if (/^[^\-\s]*$/.test(num))
    return num.replace(/(.{4})/g, '$1 ');
  else 
    return num;
  },
  autoResize: function(obj) {
    let offset = obj.offsetHeight - obj.clientHeight;
    $(obj).css('height', 'auto').css('height', obj.scrollHeight + offset);
  },
  //Message alert
  swalSuccess: function(_text, _cb) {    
    swal({
      title: '성공',
      text: _text??'',
      icon: 'success',
      buttons: {
        cancel: {
          text: '닫기',
          value: null,
          visible: true,
          className: 'btn btn-default',
          closeModal: true,
        },
      }
    }).then(() => {
      if (typeof _cb === 'function') {            
        _cb();
      }
    });
  },
  //Message alert
  swalFailed: function(_text, _cb) {
    swal({
      title: '실패',
      text: _text??'',
      icon: 'error',
      buttons: {
        cancel: {
          text: '닫기',
          value: null,
          visible: true,
          className: 'btn btn-default',
          closeModal: true,
        },
      }
    }).then(() => {
      if (typeof _cb === 'function') {            
        _cb();
      }
    });    
  },  
  //Message Confirm alert 
  swalConfirm: function(_title, _text, _cb) {
    swal({
      title: _title??'정말 처리하겠습니까?',
      text: _text??'',
      icon: 'info',
      buttons: {
        cancel: {
          text: '취소',
          value: null,
          visible: true,
          className: 'btn btn-default',
          closeModal: true,
        },
        confirm: {
          text: '승인',
          value: true,
          visible: true,
          className: 'btn btn-primary',
          closeModal: true
        }
      }
    }).then((v) => {
      if (typeof _cb === 'function' && v) {            
        _cb();
      }
    });    
  },
  // 숫자가져오기
  getNumber: function(str) {
    var n = str.replace(/\,/g,'');
    n = Number(n);
    return isNaN(n)?0:n;
  },
  // 숫자 가져오기 all
  getNumbers: function(_str){
    var arr = _str.split('');
    var out = new Array();
    for(var cnt=0;cnt<arr.length;cnt++){
      if(isNaN(arr[cnt])==false){
        out.push(arr[cnt]);
      }
    }
    return Number(out.join(''));
  },
  getLength: function(_str) {
    let len = 0;
    for (let i = 0; i < _str.length; i++) {
        if (escape(_str.charAt(i)).length == 6) {
            len++;
        }
        len++;
    }
    return len;
  },  
  isNumeric: function(num, opt) {

    if (!num) return false;

    // 좌우 trim(공백제거)을 해준다.
    num = String(num).replace(/^\s+|\s+$/g, "");
   
    if(opt == "1"){
      // 모든 10진수 (부호 선택, 자릿수구분기호 선택, 소수점 선택)
      var regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    }else if(opt == "2"){
      // 부호 미사용, 자릿수구분기호 선택, 소수점 선택
      var regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    }else if(typeof opt == "undefined" || opt == "3"){
      // 부호 미사용, 자릿수구분기호 선택, 소수점 미사용
      var regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?$/g;
    }else if(opt == "4"){
      // 부호 미사용, 자릿수구분기호 미사용, 소수점 선택
      var regex = /^[0-9]+(\.[0-9]+)?$/g;
    }else{
      // only 숫자만(부호 미사용, 자릿수구분기호 미사용, 소수점 미사용)
      var regex = /^[0-9]$/g;
    }
   
    if( regex.test(num) ){
      num = num.replace(/,/g, "");
      return isNaN(num) ? false : true;
    }else{ return false;  }
  },  
  // 일력값 확인
  //fMsg:필드이름
  //fNam:필수입력 필드이름
  //fNum:숫자만 입력 속성
  //fMax:최대 길이 지정
  //fMin:최소 길이 지정
  //fMxN:최대값 지정
  //fMnN:최소값 지정
  //fMail:이메일형식
  checkFormValidation: function(f) {

    let timeFormat = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

    for (var i = 0; i < f.elements.length; i++) {

      let obj = f.elements[i];
      let vali = $(f.elements[i]).data('vali');
      let isDisabled = $(f.elements[i]).prop('disabled');

      if (vali != undefined && !isDisabled)
      {
        let fMsg = (vali.fMsg == undefined)?'':vali.fMsg+' ';
        let fNam = (!vali.fNam)?fMsg:vali.fNam+' ';

        if (vali.fNam != undefined && obj.value.length < 1)
        {
          alert(fNam+" 값을 입력하셔야 합니다.");
          obj.focus(); return false;
        }
        if (vali.fMin != undefined && this.getLength(obj.value) < parseInt(vali.fMin))
        {
          alert(fNam + "입력값은 "+vali.fMin+"자보다 커야합니다.");
          obj.focus(); return false;
        }
        if (vali.fMax != undefined && this.getLength(obj.value) > parseInt(vali.fMax))
        {
          alert(fNam+"입력값은 "+vali.fMax+"자보다 작아야합니다.");
          obj.focus(); return false;
        }
        if (vali.fMail != undefined)
        {
          var mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if(mailformat.test(obj.value) == false) {
            alert(vali.fMail+" 입력값은 이메일 형식이 아닙니다.");
            obj.focus(); return false;            
          }
        }
        //숫자체크
        if (vali.fNum != undefined || vali.fMnN != undefined || vali.fMxN != undefined)
        {
          if (this.isNumeric(obj.value, 2) == false)
          {
            alert(vali.fNum+" 입력값은 숫자만 입력가능합니다.");
            obj.focus(); return false;
          }
          if (vali.fMnN != undefined && this.getNumber(obj.value) < vali.fMnN)
          {
            alert(vali.fNum+" 입력값이 "+vali.fMnN+"보다 작습니다.");
            obj.focus(); return false;
          }
          if (vali.fMxN != undefined && this.getNumber(obj.value) > vali.fMxN)
          {
            alert(vali.fNum+" 입력값이 "+vali.fMxN+"보다 큽니다.");
            obj.focus(); return false;
          }
        }
        //시간
        if (!!vali.fTime && timeFormat.test(obj.value) == false) 
        {
            alert(fNam+"입력값은 00:00형식이어야 합니다.");
            obj.focus(); return false;          
        }
        //처음시작글자
        if (vali.fPix != undefined && obj.value.length > 0)
        {
          var sp = vali.fPix.split(',');
          var bfind = false;
          for (var j = 0; j < sp.length; j++) {
            if (obj.value.indexOf(sp[j].trim()) === 0)
            {
              bfind = true;
            }
          }
          if (bfind == false)
          {
            alert(fNam + "시작글자는 "+vali.fPix.split(',').join(' 또는 ')+" 로 시작해야합니다.");
            obj.focus(); return false;
          }
        }
      }
    }
    
    return true;
  },    
  //FormData To Json
  formDataToJson: function(frmData) {
    let object = {};
    frmData.forEach(function(value, key){
        object[key] = value;
    });
    return JSON.stringify(object);
  },
  //FormData To Object
  formDataToObject: function(frmData) {
    let object = {};
    frmData.forEach(function(value, key){
        object[key] = value;
    });
    return object;
  },
  makeToast: function(_txt) {
    if (typeof $ != 'function' || typeof $.gritter != 'object') return;

		$.gritter.add({
			title: 'alert',
			text: _txt
		});
  },
  //Form to FormData
  makeFormData: function(form, withFile) {
    var formData = new FormData();

    form.find('input, select, textarea, radio, checkbox').each(function(k, v) {
      if (v.type == 'file' && withFile == true) {
        for (var x = 0; x < v.files.length; x++) {
          console.log(v.files[x]);
          formData.append(v.name, v.files[x]);
        }      
      } else if (v.type == 'radio' || v.type == 'checkbox') {
        if (v.checked) formData.append(v.name, v.value);
      } else {
        formData.append(v.name, v.value);        
      }
    });

    return formData;
  },
  showFormData: function(fd) {
    for (let pair of fd.entries()) { 
      console.log(pair[0]+ ', ' + pair[1]); 
    }
  },
  /**
   * Change the number with comma
   * @param {Number} _x 
   * @returns 
   */
   setFormatNumber: function (_x) {
    let parts = _x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  /**
   * Change the number in a given format with
   * @param {Number} _x 
   * @param {Number} _places 
   * @param {Boolean} _fix 
   * @returns 
   */
  setFormatNumberWithPlaces: function (_x, _places, _fix = false) {
    if (_fix && _places != undefined) {            
      let num = Number(_x);
      if (typeof num === 'number' && isFinite(num)) {        
        return num
          .toFixed(_places)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return _x;
      }
    } else {
      return this.setFormatNumber(_x);
    }
  },
  /**
   * Numbers with Comma, decimal place
   * marked by <Small> by the decimal point
   * @param {Number} _x 
   * @param {Number} _places 
   * @param {Boolean} _fix 
   * @returns 
   */
  setFormatNumberWithPlacesSmall: function (_x, _places, _fix = false) {
    let rst = this.setFormatNumberWithPlaces(_x, _places, _fix);    
    let parts = rst.toString().split('.');
    return `${parts[0]}.<small>${parts[1]}</small>`;
  },  
  /** excel, print... */
  //filter object by props
  filterObject: function (obj, props) {
    const newObj = {};
    for (let prop of props) {
      if (obj.hasOwnProperty(prop)) {
        newObj[prop] = obj[prop];
      }
    }    
    return newObj;
  },
  //sheetjs autofit column width
  autofitColumns: function (json, worksheet, header) {

    const jsonKeys = header ? header : Object.keys(json[0]);

    let objectMaxLength = []; 
    for (let i = 0; i < json.length; i++) {
      let value = json[i];
      for (let j = 0; j < jsonKeys.length; j++) {
        if (typeof value[jsonKeys[j]] == "number") {
          objectMaxLength[j] = 10;
        } else {

          const l = value[jsonKeys[j]] ? value[jsonKeys[j]].length : 0;

          objectMaxLength[j] =
            objectMaxLength[j] >= l
              ? objectMaxLength[j]
              : l;
        }
      }

      let key = jsonKeys;
      for (let j = 0; j < key.length; j++) {
        objectMaxLength[j] =
          objectMaxLength[j] >= key[j].length
            ? objectMaxLength[j]
            : key[j].length;
      }
    }

    const wscols = objectMaxLength.map(w => { return { width: w} });
    
    worksheet["!cols"] = wscols;
  },  
  // obj list to excel file by heahers props
  excelFileExport: function (list, title, headers) {    

    let headkeys = Object.keys(headers);
    let rows = [];
    for (var i in list) {
      rows.push(appUtils.filterObject(list[i], headkeys));
    }

    let wb = XLSX.utils.book_new();    
    
    const ws =  XLSX.utils.json_to_sheet([]);
    const headval = Object.values(headers);

    XLSX.utils.sheet_add_json(ws, rows, { origin: 'A2', skipHeader: true });
    XLSX.utils.sheet_add_aoa(ws,[headval], {origin: 'A1'});

    appUtils.autofitColumns(rows, ws, headkeys);

    XLSX.utils.book_append_sheet(wb, ws, title);

    title = `${title}_${(new Date()).toISOString().slice(0,10).replace(/-/g,"")}.xlsx`;
    XLSX.writeFile(wb, title);

  },
  // array buffer in filesaver.js
  s2ab: function (s) {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf);  //create uint8array as viewer
    for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
  },
  // print file
  printFileExport: function (list, exportInfo, headers) {    

    let headkeys = Object.keys(headers);    
    let headvals = Object.values(headers);
    let rows = [];
    for (var i in list) {
      rows.push(Object.values(appUtils.filterObject(list[i], headkeys)));
    }

    var _link = document.createElement( 'a' );

    var addRow = function ( d, tag ) {
			var str = '<tr>';

			for ( var i=0, ien=d.length ; i<ien ; i++ ) {
				// null and undefined aren't useful in the print output
				var dataOut = d[i] === null || d[i] === undefined ?
					'' :
					d[i];

				var classAttr = '';

				str += '<'+tag+' '+classAttr+'>'+dataOut+'</'+tag+'>';
			}

			return str + '</tr>';
		};

    var _styleToAbs = function (el)  {
      var url;
      var clone = $(el).clone()[0];
      var linkHost;

      if ( clone.nodeName.toLowerCase() === 'link' ) {
        clone.href = _relToAbs( clone.href );
      }

      return clone.outerHTML;
    };    
    
    var _relToAbs = function ( href ) {
      // Assign to a link on the original page so the browser will do all the
      // hard work of figuring out where the file actually is
      _link.href = href;
      var linkHost = _link.host;

      // IE doesn't have a trailing slash on the host
      // Chrome has it on the pathname
      if ( linkHost.indexOf('/') === -1 && _link.pathname.indexOf('/') !== 0) {
        linkHost += '/';
      }

      return _link.protocol+"//"+linkHost+_link.pathname+_link.search;
    };     

    var html = '<table class="table table-striped table-bordered">';
    
    html += '<thead>'+ addRow( headvals, 'th' ) +'</thead>';

		html += '<tbody>';
		for ( var i=0, ien=rows.length ; i<ien ; i++ ) {
			html += addRow( rows[i], 'td' );
		}
		html += '</tbody>';

    html += '</table>';

    var win = window.open( '', '' );

    if (! win) {
      alert('지원하지 않는 브라우저입니다, 크롬 또는 엣지를 이용해주세요');
      return;
    }

    win.document.close();
    
    var head = '<title>'+exportInfo.title+'</title>';

		$('style, link').each( function () {
			head += _styleToAbs( this );
		} );

		try {
			win.document.head.innerHTML = head; // Work around for Edge
		}
		catch (e) {
			$(win.document.head).html( head ); // Old IE
		}    

		// Inject the table and other surrounding information
		win.document.body.innerHTML =
			'<h1>'+exportInfo.title+'</h1>'+
			'<div>'+(exportInfo.messageTop || '')+'</div>'+
			html+
			'<div>'+(exportInfo.messageBottom || '')+'</div>';

		$(win.document.body).addClass('dt-print-view');

		$('img', win.document.body).each( function ( i, img ) {
			img.setAttribute( 'src', _relToAbs( img.getAttribute('src') ) );
		} );

		// Allow stylesheets time to load
		var autoPrint = function () {
      win.print(); // blocking - so close will not
      win.close(); // execute until this is done
		};

		if ( navigator.userAgent.match(/Trident\/\d.\d/) ) { // IE needs to call this without a setTimeout
			autoPrint();
		}
		else {
			win.setTimeout( autoPrint, 1000 );
		}  
  }, 
  setAdminInfo: () => {

    const modal = '#modal-md';

    modalUtils.showmin(modal, '관리자정보수정', undefined, '취소', '', '수정', 
      () => {
        let frm = $(`${modal} form[name=FrmAdminInfo]`);

        if (appUtils.checkFormValidation(frm[0]) == false) return;

        modalUtils.disableButton(modal);
        modalUtils.showOverlay(modal);

        let formData = frm.serialize();

        appUtils.ajaxJSON('/admin/setPassword', formData, function(dt) {

          if (dt.result == 100) {
            appUtils.swalSuccess('수정되었습니다', ()=>{appUtils.page_reload()});
          } else {
            appUtils.showAlert(dt.msg);   
            modalUtils.enableButton(modal); 
          }                       

          modalUtils.hideOverlay(modal);
        });
      },
      () => {

        appUtils.ajaxJSON('/admin/myInfo', {}, function(dt) {

        if (dt.result == 100) {

          modalUtils.setContent(modal, $('#FrmAdminInfo').html());

          let frm = $(`${modal} form[name=FrmAdminInfo]`)[0];

          let data = dt.data;

          $(frm.id).val(data.id);
          $(frm.name).val(data.name).prop('disabled', true);
          $(frm.account).val(data.account).prop('disabled', true);
          $(`${modal} div.new-password-area`).show();
          $(frm.new_password).prop('disabled', false);

          let permission = data.permission;
          
          if (permission & 1) {
            $(`${modal} input[name=permission][value=1]`).prop('checked', true).prop('disabled', true);
          }
          if (permission & 2) {
            $(`${modal} input[name=permission][value=2]`).prop('checked', true).prop('disabled', true);
          }
          if (permission & 4) {
            $(`${modal} input[name=permission][value=4]`).prop('checked', true).prop('disabled', true);
          }
          if (permission & 8) {
            $(`${modal} input[name=permission][value=8]`).prop('checked', true).prop('disabled', true);
          }
          if (permission & 16) {
            $(`${modal} input[name=permission][value=16]`).prop('checked', true).prop('disabled', true);
          }

        } else {
          appUtils.showAlert(dt.msg);
          modalUtils.hide(modal);              
        }

        });        

      }
    );

  }   
}