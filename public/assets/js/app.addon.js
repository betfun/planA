let wasUtils = {
  doLogin : (f) => {
    let target = f.closest('.login-container');
    appUtils.showLoading(target);

    appUtils.ajaxJSON(
      '/auth/login', 
      $(f).serialize(), 
      (data) => {                  
        switch(data['result']) {
          case 100:
            location.href = '/';
            return;
          default:
            alert(data.msg);
            break;
        }                  
        appUtils.hideLoading(target);  
      },
      (j) => {
        appUtils.hideLoading(target);
        alert('The right to use is restricted.');
      });
  },
  setOrder : (obj) => {
    let frm = $(obj).parents('form[name=listForm]').eq(0);
    let s_order = $(obj).data('order');
    
    let s_orderdir = $(obj).hasClass('sorting_desc')?'asc':'desc';

    frm.find('input[name=s_order]').val(s_order);
    frm.find('input[name=s_orderdir]').val(s_orderdir);

    appUtils.page_link();
  }, 
  validationTronAddress : async (_addr) => {

    const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify({address: _addr, visible: true})
    };
    
    try {
      let rs = await fetch('https://api.shasta.trongrid.io/wallet/validateaddress', options);
      return await rs.json();
    } catch (err) {
      return {result:false, message:err.message || 'check tron network'}
    }
    
  },
  setUserInfo : (useridx) => {
    
    const modal = '#modal-lg';

    modalUtils.showmin(modal, '회원정보수정', undefined, '취소', '', '수정',       
      async () => { //post
        let frm = $(`${modal} form[name=user-editor]`);

        if (appUtils.checkFormValidation(frm[0]) == false) return;

        if (frm[0].f_taddress.value) {
          let valiTronAddrss = await wasUtils.validationTronAddress(frm[0].f_taddress.value);

          if (!valiTronAddrss.result) {
            alert(`Validation Wallet Address : ${valiTronAddrss.message}`);
            return;
          }
        }

        modalUtils.disableButton(modal);

        let formData = appUtils.makeFormData(frm, false);

        appUtils.ajaxFileJSON('/api/user/setUserInfo', formData, function(dt) {

          if (dt.result == 100) {

            appUtils.swalSuccess('수정되었습니다', ()=>{appUtils.page_reload()});

          } else {

            appUtils.showAlert(dt.msg);   
            modalUtils.enableButton(modal); 

          }                       
        });
      }, 
      () => { //load
        appUtils.ajaxJSON('/api/user/getUserInfo', {useridx}, (dt) => {
          if (dt.result == 100) {
            modalUtils.setContent(modal, $('#FrmUserInfo').html());

            let frm = $(`${modal} form[name=user-editor]`)[0];

            let data = dt.data;

            frm.useridx.value = data.idx;            
            frm.f_email.value = data.f_email;
            frm.f_name.value = data.f_name;
            frm.f_token.value = data.f_token;
            frm.f_tnetwork.value = data.f_tnetwork;
            frm.f_taddress.value = data.f_taddress;
            frm.f_memo.value = data.f_memo;
            frm.f_status.value = data.f_status;
            frm.f_referralemail.value = data.f_referralemail;
            console.log(data.f_referralemail);
            //appUtils.autoResize(frm.memo);
            
            modalUtils.hideOverlay(modal)
          } else {
            alert(dt.msg);
            modalUtils.hide(modal);
          }

        }, (e) => {
          alert(e.responseText || '알수없는 오류입니다.')
          modalUtils.hide(modal);
        });        
      }
    );
  }, //--setUserInfo  
  addUserInfo : () => {

    const modal = '#modal-lg';
    modalUtils.showmin(modal, '신규회원등록', undefined, '취소', '', '등록',       
      async () => { //post
        let frm = $(`${modal} form[name=user-editor]`);

        if (appUtils.checkFormValidation(frm[0]) == false) return;

        if (frm[0].f_taddress.value) {
          let valiTronAddrss = await wasUtils.validationTronAddress(frm[0].f_taddress.value);

          if (!valiTronAddrss.result) {
            alert(`Validation Wallet Address : ${valiTronAddrss.message}`);
            return;
          }
        }

        modalUtils.disableButton(modal);

        let formData = appUtils.makeFormData(frm, false);

        appUtils.ajaxFileJSON('/api/user/addUserInfo', formData, function(dt) {

          if (dt.result == 100) {

            appUtils.swalSuccess('등록되었습니다', ()=>{appUtils.page_reload()});

          } else {

            appUtils.showAlert(dt.msg);   
            modalUtils.enableButton(modal); 
            
          }                       
        });
      }, 
      () => { 
        modalUtils.setContent(modal, $('#FrmUserInfo').html());

        let frm = $(`${modal} form[name=user-editor]`)[0];

        frm.f_status.value = 1;

        modalUtils.hideOverlay(modal)
      }
    );
  }, //addUserInfo
}