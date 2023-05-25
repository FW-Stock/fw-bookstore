// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

// Firebase gets data
var db = firebase.firestore();
var storage_item;
var storage_user_param;
var card_html = "";
var param = new URLSearchParams(window.location.search);
var id = param.get("id");
var touch = false;

if(id!==null){
	db.collection("Item").doc(id).get().then(async (doc) => {
		if(doc.exists){
			storage_item = doc.data();
      // Change metadata
      $("meta").eq(2).attr("content", storage_item.name);
      $("meta").eq(3).attr("content", storage_item.description);
      $("meta").eq(4).attr("content", storage_item.photo);
			$("title").text(storage_item.name);
      db.collection("Users").doc(storage_item.ownerID).get().then(async (doc) => {
        storage_user_param = doc.data();
        card_html = '<h5 class="card-title l_item_name mb-0">'+storage_item.name+'</h5><p class="card-text l_filter"><span class="l_subject">'+storage_item.filter["subject"]+'</span>, <span class="l_category">'+storage_item.filter["category"]+'</span>, <span class="l_level">'+storage_item.filter["level"]+'</span></p><p class="card-text l_x_important_data l_details mb-3">';

        if(storage_item.publisher !== ""){
          card_html += '<span class="l_publisher">'+storage_item.publisher+'</span> &nbsp;&nbsp;&nbsp; ';
        }
        if(storage_item.pages !== ""){
          card_html += '<span class="l_no_pages">'+storage_item.pages+'</span> pages</p>';
        }

        card_html += '<p class="card-text l_price mb-0">RM <span class="l_no_price">'+storage_item.price['aft'].toFixed(2)+'</span></p><p class="card-text l_price_aft">';
				if(!(storage_item.price['ori'].toFixed(2) === "NaN" || storage_item.price['ori'].toFixed(2) === "0.00")){
					card_html += '<span class="l_ori_price">RM <span class="l_no_oriPrice">'+storage_item.price['ori'].toFixed(2)+'</span></span>';
					if(((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0) !== "NaN"){
						card_html += ' (<span class="l_discount"><span class="l_no_discount">'+((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0)+'</span>%</span> Discount)';
					}
					card_html += '</p>';
				}
        if(storage_item.description !== ""){
          card_html += '<p class="card-text l_description">'+storage_item.description+'</p>';
        }
        card_html += '<div class="share_box"><p class="card-text l_x_important_data mb-0"><span class="l_updated_edited">Uploaded</span> on <span class="l_timestamp">'+new Date(storage_item.uploaded.seconds*1000).toLocaleString()+'</span></p><p class="card-text l_x_important_data">by <span class="l_owner"><a href="../profile?id='+storage_item.ownerID+'">'+storage_user_param.name+'</a></span></p><button type="button" name="button" id="b_share" onclick="share()"><i class="fa-light fa-share-nodes"></i></button></div><button type="button" name="button" id="b_contact" onclick="contact(\''+storage_user_param.contact["provider"]+'\', \''+storage_user_param.contact["link"]+'\')"><i class="font_awesome"></i> Contact the Owner</button>';
        $(".card_html").html(card_html);
				if(storage_item.edited !== undefined){
					$(".l_updated_edited").text("Edited");
					$(".l_timestamp").text(new Date(storage_item.uploaded.seconds*1000).toLocaleString());
				}
        if(storage_user_param.contact["provider"]==="email"){
          $(".font_awesome").addClass("fa-solid");
          $(".font_awesome").addClass("fa-envelope");
        } else if (storage_user_param.contact["provider"]==="messenger"){
          $(".font_awesome").addClass("fa-brands");
          $(".font_awesome").addClass("fa-facebook-messenger");
        } else if (storage_user_param.contact["provider"]==="instagram"){
          $(".font_awesome").addClass("fa-brands");
          $(".font_awesome").addClass("fa-instagram");
        } else if (storage_user_param.contact["provider"]==="whatsapp"){
          $(".font_awesome").addClass("fa-brands");
          $(".font_awesome").addClass("fa-whatsapp");
        }
      }).catch((error) => {
        console.log("No such document User Param:" + error);
      });

			$(".img").css("background-image", "url('"+storage_item.photo+"')");

			if(storage_item.image_collection!==undefined){
				for(let i = 0; i < storage_item.image_collection.length; i++){
					$(("#img_"+i).toString()).css("background-image", "url("+storage_item.image_collection[i]+")");
					$(("#img_"+i).toString()).css("visibility", "visible");
				}
			} else {
        $(".image_collection").css("display", "none");
      }

			// Zoom image
			(function() {
				var zoomBoxes = document.querySelectorAll('.detail-view');
				zoomBoxes.forEach(function(image) {
				var imageCss = window.getComputedStyle(image, false), imageUrl = imageCss.backgroundImage.slice(4, -1).replace(/['"]/g, '');
				var imageSrc = new Image();
				imageSrc.onload = function() {
          if(window.ontouchmove === undefined){
            var imageWidth = imageSrc.naturalWidth, imageHeight = imageSrc.naturalHeight, ratio = imageHeight / imageWidth;

            image.onmousemove = function(e) {
              var boxWidth = image.clientWidth, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, xPercent = x / (boxWidth / 100) + '%', yPercent = y / (boxWidth * ratio / 100) + '%';

              Object.assign(image.style, {
                backgroundPosition: xPercent + ' ' + yPercent,
                backgroundSize: imageWidth + 'px'
              });
            };
          } else {
            touch = true;
          }

					image.onmouseleave = function(e) {
						Object.assign(image.style, {
							backgroundPosition: 'center',
							backgroundSize: 'contain'
						});
					};
				}
				imageSrc.src = imageUrl;
				});
			})();

		} else {
			console.log("No such document!");
			$(".main").html("Not found!");
		}
	}).catch((error) => {
		console.log("Error getting document Item:", error);
		$(".main").html("Not found!");
	});
} else {
	$(".main").html("Not found!");
}

// Back button
$("#b_back").click(function(){
  if((document.referrer.indexOf(location.protocol + "//" + location.host) === 0)){
		if(history.length > 1){
			window.history.back();
		} else {
			document.location.href = "../";
		}
  } else {
    document.location.href = "../";
  }
});

// Share button
function share(){
  navigator.clipboard.writeText(document.location.href);
  swal({
    title: "Link copied to clipboard!",
    text: "Share it to your friends!",
    type: "success",
    confirmButtonText: "Close",
    position: "top-end"
  });
}

// Contact button
function contact(provider, link){
	if(provider==="email"){
		window.open("mailto:"+link, "_blank");
	} else if(provider==="messenger"||provider==="instagram"){
		window.open(link, "_blank");
	} else if(provider==="whatsapp"){
		window.open("https://api.whatsapp.com/send?phone="+link, "_blank");
	} else {
		alert("Loading . . .");
	}
}

// Enlarge image
$(".img").click(function(){enlarge(this);});
$(".img1").click(function(){enlarge(this);});

$("#b_image_close").click(function(){
  $(".image_enlarge").css("backgroundImage", "");
  $(".image_enlarge").css("visibility", "hidden");
  $(".image_enlarge").css("z-index", "-50");
});

function enlarge(component){
  if(touch){
    $(".image_enlarge").css("backgroundImage", $("#"+component.id).css("backgroundImage"));
    $(".image_enlarge").css("visibility", "visible");
    $(".image_enlarge").css("z-index", "50");
  }
}

// Profile image
var uid;
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    uid = user.uid;
    db.collection("Users").doc(uid).get().then( async (doc) => {
      if(doc.exists){
        storage_user = doc.data();
        $("#b_user").children("i").attr("class", "");
        $("#i_profile").attr("src", storage_user.photo);
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document Users", error);
    });
  }
});
function profile(){
  document.location.href = "../profile?id="+uid;
}
