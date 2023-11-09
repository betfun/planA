var confirmUtils = {
  modal: null,
  showWating : function(id, title, content) {
    if (typeof title != "undefined") this.setTitle(id, title);
    if (typeof content != "undefined") this.setContent(id, content);
    
    $(id).find('.close-button').hide();
    $(id).find('.confirm-button').hide();

    $(id).show();
  },
  show : function(id, title, content, caption1, fnc1, caption2, fnc2) {
    if (typeof title != "undefined") this.setTitle(id, title);
    if (typeof content != "undefined") this.setContent(id, content);

    confirmUtils.enableButton(id);

		if (caption1 == "hide") {
      $(id).find('.close-button').hide();
    } else if (typeof caption1 != "undefined") {
			$(id).find('.close-button').text(caption1);			
		} else {
			$(id).find('.close-button').text('닫기');
		}

		if (typeof caption2 != "undefined") {
			$(id).find('.confirm-button').text(caption2);			
		} else {
			$(id).find('.confirm-button').text('적용');
		}

		$(id).find('.close-button, .ico-close-button, .confirm-button').off("click");

		if (typeof fnc1 == "function")
			$(id).find('.close-button, .ico-close-button').on("click", fnc1);
		else {
			$(id).find('.close-button, .ico-close-button').on("click", function(){
				confirmUtils.hide(id);
			});
    }

		if (typeof fnc2 == "function")
			$(id).find('.confirm-button').on("click", fnc2);
		else 
			$(id).find('.confirm-button').on("click", function(){
				confirmUtils.hide(id);
			});

    $(id).show();
  },
	setTitle : function(id, title) {		
		$(id).find('.modal-title').html(title);
	},
	setContent : function(id, content) {
		$(id).find('.card-body').html(content);
	},
	hide : function(id) {
		$(id).hide();
	},
  setCloseButton : function(id, fnc) {    
    $(id).find('.close-button, .ico-close-button').on("click", fnc);
  },
	disableButton : function(id) {
    $(id).find('.close-button, .ico-close-button').prop("disabled", true);
		$(id).find('.confirm-button').prop("disabled", true);
	},
	enableButton : function(id, close) {
    $(id).find('.close-button, .ico-close-button').show();
    $(id).find('.confirm-button').show();

    if (!close == false && close) {
      $(id).find('.close-button, .ico-close-button').prop("disabled", false);
    } else {
      $(id).find('.close-button, .ico-close-button').prop("disabled", false);
      $(id).find('.confirm-button').prop("disabled", false);
    }
	},
}

var modalUtils = {
	show : function(id, title, content, caption, bstaycontent) {
		if (typeof title != "undefined") this.setTitle(id, title);
		if (typeof content != "undefined") this.setContent(id, content);
		
		if (caption == true) {
			this.showButton(id);
		} else if (typeof caption != "undefined") {
			this.showButton(id, caption);
		} else {
			this.hideButton(id);
		}

    $(id).find('.close-button, .ico-close-button').off("click");
    $(id).find('.close-button, .ico-close-button').on("click", function(){
      if (typeof bstaycontent != "undefined" && bstaycontent == true)
        modalUtils.hidestay(id);
      else
        modalUtils.hide(id);
    });
		
		$(id).modal({      
      keyboard: false,
      backdrop: 'static'
    });        

    $(id).modal('show');
	}, 
  // caption1, fnc1 : close 
  // caption2, fnc2 : done
	showmin : function(id, title, content, caption1, fnc1, caption2, fnc2, shownfnc) {

		if (typeof title != "undefined") this.setTitle(id, title);
		if (typeof content != "undefined") 
      this.setContent(id, content);
    else
      this.showOverlay(id);
		if (typeof caption1 != "undefined") {
			$(id).find('.close-button').text(caption1);			
		} else {
			$(id).find('.close-button').text('닫기');
		}
		
		if (caption2 == true) {
			this.showButton(id);
		} else if (typeof caption2 == "string") {
			this.showButton(id, caption2);
		} else {
			this.hideButton(id);
		}
		
		$(id).find('.close-button, .ico-close-button').off("click");

		if (typeof fnc1 == "function")
			$(id).find('.close-button, .ico-close-button').on("click", fnc1);
		else {
			$(id).find('.close-button, .ico-close-button').on("click", function(){
				modalUtils.hide(id);
			});
    }
		
    $(id).find('.modal-button').off('click');

		if (typeof fnc2 == "function")
			$(id).find('.modal-button').on("click", fnc2);
		else 
			$(id).find('.modal-button').on("click", function(){
				modalUtils.hide(id);
			});

    $(id).modal({
      keyboard: false,
      backdrop: 'static'
    });     

    $(id).off('shown.bs.modal');

    if (typeof shownfnc == "function") {
      $(id).on('shown.bs.modal', shownfnc);
    }

    $(id).modal('show');
	},
  fullscreen : function(obj) {
    let id = modalUtils.getModalId(obj);
    if ($(id).find('.modal-dialog').hasClass('modal-fullscreen'))
      $(id).find('.modal-dialog').removeClass('modal-fullscreen')
    else
      $(id).find('.modal-dialog').addClass('modal-fullscreen')
  },
  hidestay : function(id) {
		$(id).modal('hide');
    this.hideOverlay(id);
  },
	hide : function(id) {
		$(id).modal('hide');
    this.hideOverlay(id);
    this.setContent(id, '');
	},
  close : function(id) {
    $(id).find('.close-button').trigger("click");
  },
	setTitle : function(id, title) {		
		$(id).find('.modal-title').html(title);
	},
	setContent : function(id, content) {
		$(id).find('.modal-body').html(content);
    this.hideOverlay(id);
	},
	showButton : function(id, caption) {
		if (typeof caption != "undefined")
			$(id).find('.modal-button').text(caption);
		else 
			$(id).find('.modal-button').text("적용");
		$(id).find('.modal-button').show();
	},
	hideButton : function(id) {
		$(id).find('.modal-button').hide();
	}, 
	setButton : function(id, fnc) {
		$(id).find('.modal-button').off("click");
		$(id).find('.modal-button').on("click", fnc);
	},
  setCloseButton : function(id, fnc) {    
    $(id).find('.close-button, .ico-close-button').on("click", fnc);
  },
	disableButton : function(id) {
    $(id).find('.ico-close-button').prop("disabled", true);
    $(id).find('.close-button').prop("disabled", true);
		$(id).find('.modal-button').prop("disabled", true);
	},
	enableButton : function(id) {
    $(id).find('.ico-close-button').prop("disabled", false);
    $(id).find('.close-button').prop("disabled", false);
		$(id).find('.modal-button').prop("disabled", false);
	},
  showOverlay : function(id, fade) {
    $(id).find('.overlay').show().addClass('d-flex');    
    /*
    if (fade == undefined)
      $(id).find('.overlay').show().addClass('d-flex');    
    else {
      $(id).find('.overlay').fadeIn().addClass('d-flex');    
    }
    */
  },
  hideOverlay : function(id, fade) {
    if (fade == undefined)
      $(id).find('.overlay').hide().removeClass('d-flex');
    else
      $(id).find('.overlay').fadeOut(400, function() {$(id).find('.overlay').removeClass('d-flex')});
  },
  showConfirm : function(title, callback) {
    if (title == undefined) title = '수정하시겠습니까?';
    this.showmin('#modal-sm', '<i class="fas fa-cogs text-danger"></i> 알림', title, '아니요', '', '예', callback);
  },
  hideConfirm : function() {
    this.hide('#modal-sm');
  },
	showAlert : function(id, msg, autoClose) {
		
		$(id).find('.modal-alertmsg').text(msg);
		
		if (autoClose == true) {
			$(id).find('.modal-alert').fadeTo(4000, 500).slideUp(500, function () {
				$(id).find('.modal-alert').slideUp(500);
			});				
		} else {
			$(id).find('.modal-alert').show();
		}
			
	},
	hideAlert : function(id) {
		$(id).find('.modal-alert').hide();
	},
  getModalId : function(obj) {
    return '#'+$(obj).parents(".modal").attr("id");
  },
}

var gMapUtils = {
  map : null,
  webnautes : [],
  markers : [],
  glat : 37.566535,
  glng : 126.977969,
  initMap : function(id) {
    this.map = new google.maps.Map(document.getElementById(id), {
      zoom: 9,
      streetViewControl: false,
      mapTypeControl: false,
      center: {lat: this.glat, lng: this.glng}
    });
  },
  clearMarkers : function() {
    this.setMapOnAll(null);
    this.markers = [];
  },
  setMapOnAll : function(map) {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  },
  addMarker : function(loc) {
    var marker = new google.maps.Marker({
      position: loc,
      map: this.map
    });
    this.markers.push(marker);
  },
  setMarkers : function(map) {
    for (var i = 0; i < this.webnautes.length; i++) {
      this.addMarker({lat:this.webnautes[i][1], lng:this.webnautes[i][2]});
    }
  },
  getMarkers : function(map) {
    const baseURI1 = '/api_dir123/get_gps_miners_v2.php';
    gmap = this;
    $.get(
      baseURI1,
      $('#listForm').serialize(),
      function(data) {
        var tmp_buf =  JSON.parse(data)		
        console.log(tmp_buf)			
        if(tmp_buf.ret == "200") {
          console.log(tmp_buf);
          gmap.webnautes = tmp_buf.webnautes;
          console.log(this.webnautes);
        }
        gmap.setMarkers(map);
      }
    ).fail(function(response) {
      console.log("get error")
      console.log(JSON.stringify(response))
      gmap.setMarkers(map);
    });
  },
  viewMaker: function(lat, lng) {
    if (this.map == null) gMapUtils.initMap('map_canvas');

    this.clearMarkers();
    this.map.setZoom(13);
    this.addMarker({lat:lat, lng:lng});      
    this.map.setCenter({lat: lat, lng: lng});

    modalUtils.show('#modal-map', '광고장소', undefined, undefined, true);
  },
  viewMakers: function() {
    if (this.map == null) gMapUtils.initMap('map_canvas');

    this.clearMarkers();
    this.map.setCenter({lat: this.glat, lng: this.glng});
    this.map.setZoom(9);
    this.getMarkers(this.map);

    modalUtils.show('#modal-map', '광고장소', undefined, undefined, true);
  }
}