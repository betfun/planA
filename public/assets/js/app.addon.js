let wasUtils = {
  do_login : (f) => {
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
  }
}