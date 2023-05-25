// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

// Firebase

$("#f_profile_img").change(function(){
		$(this).parent().children(".image_chosen").css("backgroundImage", 'url("'+URL.createObjectURL(this.files[0])+'")');
});

function logout(){
	if(localStorage.getItem("FW_anonymous") === "true"){
		firebase.auth().currentUser.delete();
	}
  firebase.auth().signOut();
  document.location.href = "../login";
  localStorage.setItem("FW_loginChecked", "false");
  localStorage.setItem("FW_emailUser", null);
}

// Firebase gets data
var db = firebase.firestore();
var storage_user;
var storage_user_param;
var storage_item;
var param = new URLSearchParams(window.location.search);
var param_id = param.get("id") || "undefined";
var card_html = "";

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
				$("#i_profile").css("display", "none");
        console.log("No such document!");
      }

      db.collection("Users").doc(param_id).get().then( async (doc) => {
        if(doc.exists){
          // Profile
          storage_user_param = doc.data();
          $(".l_profile_name").text(storage_user_param.name);
					$("title").text(storage_user_param.name);
					$(".l_school").text(storage_user_param.school)

					if(storage_user_param.contact !== undefined){
						if(storage_user_param.contact["provider"]==="messenger"||storage_user_param.contact["provider"]==="instagram"){
							$(".l_contact").attr("href", storage_user_param.contact["link"]);
						} else if (storage_user_param.contact["provider"]==="whatsapp"){
							$(".l_contact").attr("href", "https://api.whatsapp.com/send?phone="+storage_user_param.contact["link"]);
						} else {
							$(".l_contact").attr("href", "mailto:"+storage_user_param.contact["link"]);
						}
					} else {
						$(".l_contact").attr("href", "mailto:"+storage_user_param.email);
					}


          if(storage_user_param.photo !== undefined){
            $(".img_profile").css("backgroundImage", "url('"+storage_user_param.photo+"')");
          } else {
            $(".img_profile").css("backgroundImage", "url('../images/favicon/favicon-512.png')");
          }
					db.collection("Mods-Users").doc(param_id).get().then( async (doc) => {
						storage_user_mods = doc.data();
						if(storage_user_mods.seller){
							$(".l_badge").addClass("l_seller");
							$(".badge_type").text("Seller");
						} else {
							$(".l_badge").addClass("l_registered");
							$(".badge_type").text("Registered");
						}
						if(storage_user_mods.mods){
							$(".l_mods").css("display", "inline-table");
						}
						// Public Information
						if(uid === param_id){
							$("#t_name")[0].value = storage_user.name;
							if(storage_user.school !== undefined){
								$("#t_school")[0].value = storage_user.school;
							} else {
								$("#t_school")[0].value = "";
							}
							if(!storage_user_mods.seller){
								$("#b_upgrade").css("display", "block");
								$("#c_contact")[0].value = "email";
								$("#t_contact")[0].value = storage_user.email;
								placeholder();
							} else {
								$("#c_contact")[0].value = storage_user.contact["provider"];
								$("#t_contact")[0].value = storage_user.contact["link"];
								placeholder();
							}
						} else {
							$("#seller").html("");
							$("#b_new").css("display", "none");
						}

						if(storage_user_mods.seller){
							// Stock
							// Detect whether the user is selling items
							if(storage_user_param.items != ""){
								// Get items sold
								itemGet();
							} else {
								$(".card_html").html("&nbsp; &nbsp; &nbsp; No item is selling now.");
							}
						} else {
							$("#stock").html("");
						}

					}).catch((error) => {
						console.log("Error getting document Users", error);
					})

        } else {
          if(localStorage.getItem("FW_anonymous") === "true"){
            $(".main").html("&nbsp;&nbsp;Detect anonymous login. <a href='javascript: logout()'>Login / Register</a>");
          } else {
            $(".main").html("&nbsp;&nbsp;No such user! <a href='javascript: logout()'>Login / Register</a>");
          }
          console.log("No such document User Param!");
        }
      })
      .catch((error) => {
        console.log("Error getting document Users", error);
      });
    }).catch((error) => {
      console.log("Error getting document Users", error);
    });
  } else {
    $(".main").html("&nbsp;&nbsp;Detect anonymous login. <a href='javascript: logout()''>Login / Register</a>");
  }
});

function itemGet(){
  card_html = "";
  $(".stock_no").text(storage_user_param.items.length);
  for(let i = 0; i < storage_user_param.items.length; i++){
    db.collection("Item").doc(storage_user_param.items[i]).get().then( async (doc) => {
      storage_item = doc.data();
      if(doc.exists){
				let dis = ((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0) !== "NaN" ? ((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0) : "0";
        card_html += '<div class="col-lg-3 col-md-4 col-sm-6"><div class="card item_card" id="'+doc.id+'" onclick="item(\''+doc.id+'\')"><div class="card-img-top img" style="background-image: url(\''+storage_item.photo+'\');"></div><div class="card-body"><h5 class="card-title l_item_name">'+storage_item.name+'</h5><p class="card-text l_price">RM <span class="no_price">'+storage_item.price['aft'].toFixed(2)+'</span></p><p class="card-text"><span class="l_ori_price">RM <span class="no_oriPrice">'+storage_item.price['ori'].toFixed(2)+'</span></span> (<span class="l_discount"><span class="no_discount">'+dis+'</span>%</span> Discount)</p><p class="card-text text-muted">'+storage_user_param.name+'</p>';
				if(uid === param_id){
					card_html += '<button type="button" class="b_edit" onclick="edit(\''+doc.id+'\')">Edit</button><button type="button" class="b_sold" onclick="sold(\''+doc.id+'\')">Sold</button><button type="button" class="b_del" onclick="del(\''+doc.id+'\')">Delete</button>';
				}
				card_html += '</div></div></div>';
        $(".card_html").html(card_html);
				await db.collection("Mods-Item").doc(storage_user_param.items[i]).get().then((docModsItemSuspend) => {
					if(docModsItemSuspend.data().Info_log !== undefined){
						console.log(storage_user_param.items[i]);
						if(docModsItemSuspend.data().Info_log["action"]==="Suspended"){
							$("#"+storage_user_param.items[i]).children().eq(0).html('<span style="display: block; opacity: 1; text-shadow: 1px 1px 2px #EC1E1E, 0 0 1em #333, 0 0 0.2em #333; transform: rotate(-30deg);">SUSPENDED</span>');
							$("#"+storage_user_param.items[i]).children().eq(0).css("background-color", "#EC1E1E");
						}
						if(docModsItemSuspend.data().Info_log["action"]==="Validating"){
							$("#"+storage_user_param.items[i]).children().eq(0).html('<span style="display: block; opacity: 1; text-shadow: 1px 1px 2px #865A8D, 0 0 1em #333, 0 0 0.2em #333; transform: rotate(-30deg);">VALIDATING</span>');
							$("#"+storage_user_param.items[i]).children().eq(0).css("background-color", "#865A8D");
						}
						if(docModsItemSuspend.data().Info_log["action"]==="Sold"){
							$("#"+storage_user_param.items[i]).children().eq(0).html('<span style="display: block; opacity: 1; text-shadow: 1px 1px 2px #F7A207, 0 0 1em #333, 0 0 0.2em #333; transform: rotate(-30deg);">SOLD SOLD</span>');
							$("#"+storage_user_param.items[i]).children().eq(0).css("background-color", "#F7A207");
						}
						$("#"+storage_user_param.items[i]).children().eq(0).css("opacity", 0.75);
						if(uid !== param_id && docModsItemSuspend.data().Info_log["action"]!=="Sold"){
							$("#"+storage_user_param.items[i]).parent().remove();
						}
					}
				}).catch((error) => {
					console.log("Cannot get Mods-Item.")
				})
      }
    }).catch((error) => {
      console.log("No such document");
      console.log(error);
    });

  }
}

function profile(){
  document.location.href = "../profile?id="+uid;
}

// Bootstrap alert
function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible d-flex align-items-center mt-2" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'+ message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  $("#liveAlertPlaceholder").append(wrapper);
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

$("#c_contact").change(function(){
  placeholder();
});
$("#c_profile_img").change(function(){
  if($("#c_profile_img")[0].checked){
    $("#f_profile_img")[0].removeAttribute("disabled");
  } else {
    $("#f_profile_img")[0].setAttribute("disabled", "");
  }
});
var f_profile;
$("#f_profile_img").change(function(){
  f_profile = this.files[0];
});
function placeholder(){
  if($("#c_contact")[0].value==="messenger"||$("#c_contact")[0].value==="instagram"){
    $("#t_contact").attr("placeholder", "Social Media Link");
  } else if($("#c_contact")[0].value === "whatsapp"){
    $("#t_contact").attr("placeholder", "WhatsApp Phone Number (start with 60)");
  } else {
    $("#t_contact").attr("placeholder", "Email");
  }
}
// Update profile information
function update(){
  if($("#t_name")[0].value !== "" && $("#t_contact")[0].value !== ""){
    // check whether new photo is uploaded
    if(!$("#c_profile_img")[0].checked){
      checkedRegex(false);
    } else {
      if($("#f_profile_img")[0].value !== ""){
        checkedRegex(true);
      } else {
        alert("Please upload new profile image, or uncheck it.", "warning");
      }
    }
  } else {
    alert("Please filled in all requierd information.", "warning");
  }
}
function checkedRegex(bool){
  if($("#c_contact")[0].value === "messenger"){
    if(/http(?:s):\/\/(?:www\.)messenger\.com\/[t]\/\d*/.test($("#t_contact")[0].value)){
      validated(bool);
    } else {
      alert("Invalid link. Please follow this link format: https://www.messenger.com/t/xxxxx", "warning");
    }
  }
  if($("#c_contact")[0].value === "instagram"){
    if(/(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im.test($("#t_contact")[0].value)){
      validated(bool);
    } else {
      alert("Invalid link. Please follow this link format: https://www.instagram.com/xxxxx", "warning");
    }
  }
  if($("#c_contact")[0].value === "whatsapp"){
    if(/^[6](6?01)[02-46-9]-*[0-9]{7}$|^[6](6?01)[1]-*[0-9]{8}$|^[6](6?04)-*[0-9]{7}/gm.test($("#t_contact")[0].value)){
      validated(bool);
    } else {
      alert("Invalid WhatsApp phone number. Please follow this link format: 601xxxxxxx. Currently not supporting Non-Malaysia WhatsApp Phone Number format", "warning");
    }
  }
  if($("#c_contact")[0].value === "email"){
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#t_contact")[0].value)){
      validated(bool);
    } else {
      alert("Invalid email address.", "warning");
    }
  }
}


async function validated(bool){
  if(bool){
		$("#b_update").addClass("disabled");
		// Delete old profile image
		await firebase.storage().ref("profile/"+uid).listAll().then((res) => {
			if(res.items.length !== 0){
				res.items.forEach((itemRef) => {
					firebase.storage().ref("profile/"+uid+"/"+itemRef.name).delete().then(() => {
					  console.log("Item deleted");
					}).catch((error) => {
					  console.log("Error deleting item: " + error);
					});
		    });
			}
		}).catch((error) => {
			console.error("Error writing document Profile: ", error);
		});
    // Upload new profile image
    await firebase.storage().ref("profile/"+uid+"/"+f_profile.name).put(f_profile).then((snapshot) => {
      console.log('Uploaded file Profile!');
      firebase.storage().ref("profile/"+uid+"/"+f_profile.name).getDownloadURL().then((downloadURL) => {
        db.collection("Users").doc(uid).set({
          photo: downloadURL
        }, { merge: true })
        .then(() => {
            console.log("Document successfully written Profile!");
        })
        .catch((error) => {
            console.error("Error writing document Profile: ", error);
            alert("Failed to upload profile image. Please re-upload.", "danger");
        });
      });
    });
  }
  db.collection("Users").doc(uid).set({
    name: $("#t_name")[0].value,
    contact: {
      link: $("#t_contact")[0].value,
      provider: $("#c_contact")[0].value
    },
		school: $("#t_school")[0].value
  }, {merge: true}).catch((error) => {
    console.error("Error getting document Users: " + error);
  });
  swal({
    title: "Successfully updated your public information!",
    icon: "success",
    button: "Close",
    position: "top-end"
  }).then((isConfirm) => {
    if(isConfirm){
      document.location.reload();
    }
  });
  setTimeout(function(){document.location.reload();}, 2000);
}

// Ugrade to seller
function upgrade(){
  $(".overlay").css("display", "block");
}
function close_declare(){
  $(".overlay").css("display", "none");
}
function agree(){
  let provider, contactLink;
  if(storage_user.contact === undefined){
    provider = "email";
    contactLink = storage_user.email;
  } else {
    provider = storage_user.contact["provider"];
    contactLink = storage_user.contact["link"];
  }
  db.collection("Users").doc(uid).set({
    contact: {provider: provider, link: contactLink},
    items: [],
		school: $("#t_school")[0].value,
		sent: true
  }, {merge: true}).catch((error) => {
    console.error("Error getting document Users: " + error);
  });
  swal({
    title: "Your request as a seller has sent to the mods!",
		text: "Your request will be processed around 2 days!",
    icon: "success",
    button: "Close",
    position: "top-end"
  });
  $(".overlay").css("display", "none");
}

// Add new item
$("#b_new").click(function(){
  document.location.href = "../studio?action=upload";
});

var first = 1;
// Edit button
function edit(id){
  first = 0;
  document.location.href = "../studio?action=edit&id="+id;
}

function sold(id){
	first = 0;
	console.log(1);
	swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    position: "top-end",
    text: "This action is permanent and not recoverable after done. Item that is marked as sold will be closed forever.",
    title: "Are you sure you want to mark this item as sold?"
  }).then((isConfirm) => {
		if(isConfirm){
			db.collection("Mods-Item").doc(id).set({
	      Info_log: {
					action: "Sold",
					reason: "",
	        time: firebase.firestore.FieldValue.serverTimestamp(),
	        uid: uid
	      }
	    }, {merge: true}).then(() => {
	      console.log("Document successfully written Mods-User!");
	    });
			$("#"+id).children().eq(0).html('<span style="display: block; opacity: 1; text-shadow: 1px 1px 2px #F7A207, 0 0 1em #333, 0 0 0.2em #333; transform: rotate(-30deg);">SOLD SOLD</span>');
			$("#"+id).children().eq(0).css("background-color", "#F7A207");
			// setTimeout(function(){document.location.reload();}, 1000);
		}
	}).catch((error) => {
		console.error("Error marking document as sold: ", error);
	});
}

// Delete button
var deleteID;
function del(id){
  deleteID = id;
  first = 0;
  swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    position: "top-end",
    text: "This action is permanent and not recoverable after done. This item will be deleted forever.",
    title: "Are you sure you want to permanently delete this item?"
  }).then((isConfirm) => {
    if(isConfirm){
      // Delete item in items array in user collection
      storage_user_param.items.splice(storage_user_param.items.indexOf(deleteID), 1);

      // Delete document
      db.collection("Item").doc(deleteID).delete().then(() => {
        // Set new array in user collection
        db.collection("Users").doc(uid).set({
          items: storage_user_param.items
        }, { merge: true}).then(() => {
          console.log("Document successfully written!");
        }).catch((error) => {
          console.error("Error writing document User: ", error);
        });
        console.log("Document successfully deleted!");
        swal({
          title: "Document successfully deleted!",
          text: "You have saved the storage space of FW Bookstore!",
          icon: "success",
          button: "Close",
          position: "top-end"
        });
        itemGet();
      }).catch((error) => {
            console.error("Error removing document: ", error);
      });

			db.collection("Mods-Item").doc(deleteID).delete().then(() => {
				// Delete document images
				firebase.storage().ref("images/"+deleteID).listAll().then((res) => {
					res.items.forEach((itemRef) => {
						firebase.storage().ref("images/"+deleteID+"/"+itemRef.name).delete().then(() => {
							console.log("Document images deleted");
						}).catch((error) => {
							console.log("Error deleting document images: " + error);
						});
					});
				}).catch((error) => {
					console.error("Error writing document Mods-Item: ", error);
				});
      }).catch((error) => {
            console.error("Error removing document Mods-Item: ", error);
      });

    } else {
      swal("Your item is safe!");
    }
  });
}

// Go to item page
function item(id){
  if(first){
    document.location.href = "../item?id="+id;
  }
}
