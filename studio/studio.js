// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

// Firebase
function logout(){
  if(localStorage.getItem("FW_anonymous") === "true"){
		firebase.auth().currentUser.delete();
	}
  firebase.auth().signOut();
  document.location.href = "../login";
  localStorage.setItem("FW_loginChecked", "false");
  localStorage.setItem("FW_emailUser", null);
}

$("#t_name").keyup(function(){
  $("#count_name").text($("#t_name")[0].value.length);
});
$("#t_des").keyup(function(){
  $("#count_des").text($("#t_des")[0].value.length);
});

var f_list = {};
$(".file_f").change(function(){
	$(this).parent().children(".l_f_chosen").text(this.files[0].name);
  f_list[this.id] = this.files[0];
	$(this).parent().children(".image_chosen").css("backgroundImage", 'url("'+URL.createObjectURL(this.files[0])+'")');
  $(this).parent().parent().next(".file_upload_div").css("display", "block");
});
$("#f_photo").change(function(){
	$(this).parent().children(".image_chosen").css("backgroundImage", 'url("'+URL.createObjectURL(this.files[0])+'")');
});

$(document).ready(function(){
  // Check whether user keeps login
  // when deploying firebase remove this
  if(localStorage.getItem("FW_anonymous")==="true"){
    $(".main").html("&nbsp;&nbsp;Detect anonymous login. <a href='javascript: logout()'>Login / Register</a>");
  }
});

// Firebase gets data
var db = firebase.firestore();
var param = new URLSearchParams(window.location.search);
const action = param.get("action");
var id;
var storage_item;

if(!(action === "edit" || action === "upload")){
  $(".main").html('&nbsp;&nbsp;Invalid Link. Go to <a href="../">Homepage</a> or <a href="../studio?action=upload">Upload</a> New Item');
}

if(action === "edit"){
  id = param.get("id");
  $("#b_submit").text("Edit");

  db.collection("Item").doc(id).get().then(async (doc) => {
    if(doc.exists){
      storage_item = doc.data();
      $("#t_name")[0].value = storage_item.name;
      $("#c_sub")[0].value = storage_item.filter["subject"];
      $("#c_category")[0].value = storage_item.filter["category"];
      $("#c_level")[0].value = storage_item.filter["level"];
      $("#t_price_aft")[0].value = storage_item.price["aft"].toFixed(2);
      $("#t_price_ori")[0].value = storage_item.price["ori"].toFixed(2);
      $("#t_price_aft").attr("disabled", true);
      $("#t_price_ori").attr("disabled", true);
      $("#t_des")[0].value = storage_item.description;
      $("#t_publisher")[0].value = storage_item.publisher;
      $("#t_pages")[0].value = storage_item.pages;
      $("#media").css("display", "none");
    } else {
      $(".main").html("&nbsp;&nbsp;No such item. <a href='../'>Go Back</a>");
    }
  }).catch((error) => {
    console.log("Error getting document Item: "+error);
  });
} else {
  $("#b_submit").text("Upload");
}

$("#b_submit").click(function(){
  if(action === "edit"){
    if(validate()){
      swal({
        icon: "warning",
        buttons: ["No", "Yes"],
        poBookstoren: "top-end",
        text: "This action is permanent and not recoverable after done.",
        title: "Are you sure you want to edit the details of this item?"
      }).then((isConfirm) => {
        if(isConfirm){
          db.collection("Item").doc(id).set({
            name: $("#t_name")[0].value,
            filter: {
              subject: $("#c_sub")[0].value,
              category: $("#c_category")[0].value,
              level: $("#c_level")[0].value,
            },
            description: $("#t_des")[0].value.split("\n").join("<br>"),
            publisher: $("#t_publisher")[0].value,
            pages: $("#t_pages")[0].value.toString(),
            edited: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true })
          .then(() => {
            console.log("Document successfully written!");
            swal({
              title: "Successfully updated your item details! Close this dialog box to go back.",
              icon: "success",
              button: "Close",
              position: "top-end"
            }).then((isConfirm) => {
              if(isConfirm){
                window.history.back();
              }
            });
            setTimeout(function(){window.history.back();}, 3000);
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
            alert("Failed to update item details. Please check your internet connection and reload this page to re-edit the item details.", "danger");
          });
        } else {
          swal("Your item is safe from editing.");
        }
      });
    } else {
      alert("Please fill in all information required.", "warning");
    }
  } else {
    if(validate()){
      $(".overlay").css("display", "block");
    } else {
      alert("Please fill in all information required.", "warning");
    }
  }
});
function agree_upload(){
  $(".btn-success").addClass("disabled");
  db.collection("Item").add({
    name: $("#t_name")[0].value,
    filter: {
      subject: $("#c_sub")[0].value,
      category: $("#c_category")[0].value,
      level: $("#c_level")[0].value,
    },
    price: {
      aft: parseFloat($("#t_price_aft")[0].value),
      ori: parseFloat($("#t_price_ori")[0].value),
    },
    description: $("#t_des")[0].value.split("\n").join("<br>"),
    publisher: $("#t_publisher")[0].value,
    pages: $("#t_pages")[0].value.toString(),
    ownerID: uid,
    uploaded: firebase.firestore.FieldValue.serverTimestamp()
  }).then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    firebase.storage().ref("images/"+docRef.id+"/"+$("#f_photo")[0].files[0].name).put($("#f_photo")[0].files[0]).then((snapshot) => {
      console.log('Uploaded file Photo!');
      firebase.storage().ref("images/"+docRef.id+"/"+$("#f_photo")[0].files[0].name).getDownloadURL().then((downloadURL) => {
        db.collection("Item").doc(docRef.id).set({
          photo: downloadURL
        }, { merge: true })
        .then(() => {
          console.log("Document successfully written Item photo!");
          let f_list_url = [];
          for(let i = 0; i < Object.values(f_list).length; i++){
            firebase.storage().ref("images/"+docRef.id+"/"+i+"."+Object.values(f_list)[0].type.split("/")[1]).put(Object.values(f_list)[i]).then((snapshot) => {
              firebase.storage().ref("images/"+docRef.id+"/"+i+"."+Object.values(f_list)[0].type.split("/")[1]).getDownloadURL().then((downloadURL) => {
                f_list_url.push(downloadURL);
                console.log(downloadURL);
                db.collection("Item").doc(docRef.id).set({
                  image_collection: f_list_url
                }, { merge: true })
                .then(() => {
                  console.log("Document successfully written Image Collection!");
                })
                .catch((error) => {
                  console.error("Error writing document Image Colleciton: ", error);
                  alert("Failed to upload item to our database. Please re-upload.", "danger");
                });
              });
            });
          }

          storage_user.items.push(docRef.id);
          db.collection("Users").doc(uid).set({
            items: storage_user.items
          }, { merge: true}).then(() => {
            console.log("Document successfully written!");
          }).catch((error) => {
            console.error("Error writing document User: ", error);
          });

          db.collection("Mods-Item").doc(docRef.id).set({
            Info_log: {
              action: "Validating",
              reason: "<b>Waiting to be validated by mods . . .</b>",
              time: firebase.firestore.FieldValue.serverTimestamp(),
              uid: "<i>System</i>"
            }
          }, { merge: true}).then(() => {
            console.log("Document Mods-Item successfully written!");
          }).catch((error) => {
            console.error("Error writing document Mods-Item: ", error);
          });

          $(".overlay").css("display", "none");
          swal({
            title: "Document successfully sent to moderators for validating process!",
            text: "Woohoo! Thanks for using FW Bookstore! Please go to \'Our Page\' Section to report any bug or give comments and suggestion to us!",
            icon: "success",
            button: "Close",
            position: "top-end"
          }).then((isConfirm) => {
            if(isConfirm){
              setTimeout(function(){document.location.reload();}, 500);
            }
            setTimeout(function(){document.location.reload();}, 3000);
          });

        })
        .catch((error) => {
          console.error("Error writing document Item photo ", error);
          alert("Failed to upload profile image. Please re-upload.", "danger");
        });
      });
    });
  })
  .catch((error) => {
    console.error("Error adding document Item: ", error);
  });
}
function close_declare_upload(){
  $(".overlay").css("display", "none");
  swal("Failed to upload. Your Privacy cannot be taken care if You disagree Our Privacy Policy.");
}

function validate(){
  if($("#t_name")[0].value!==""||$("#t_price_aft")[0].value!==""||$("#t_price_ori")[0].value!==""){
    if(action === "edit"){
      return true;
    } else {
      if($("#f_photo")[0].value!==""){
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}
// Upload
function close_declare(){
  $(".overlay").css("display", "none");
}
function agree(){

}

// Profile image
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    uid = user.uid;
    db.collection("Users").doc(uid).get().then( async (doc) => {
      if(doc.exists){
        storage_user = doc.data();
        $("#b_user").children("i").attr("class", "");
        $("#i_profile").attr("src", storage_user.photo);

        db.collection("Mods-Users").doc(uid).get().then( (doc) => {
          if(doc.exists){
            if(!(doc.data().seller&&doc.data().validated)){
              $(".main").html("&nbsp;&nbsp;This feature is only available for seller account. Upgrade <a href='../profile?id="+uid+"#seller'>Here</a>!");
            }
          }
        }).catch((error) => {
          console.log("Error getting Document Mods-Users", error);
        })
      } else {
        $("#i_profile").css("display", "none");
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document Users", error);
    });
  }
});

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

function profile(){
  document.location.href = "../profile?id="+uid;
}

// Bootstrap alert
function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible d-flex align-items-center mt-2" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'+ message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  $("#liveAlertPlaceholder").append(wrapper);
}
