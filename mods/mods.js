// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

// Filter in Verifying part
function filter_sent(){
  if($("#c_sent")[0].value === "all"){
    initial();
  } else {
    db.collection("Users").where("sent", "==", JSON.parse($("#c_sent")[0].value)).get().then((querySnapshot) => {
      table_verify = "";
      querySnapshot.forEach((doc) => {
        show_verifying(doc);
      });
    });
  }
}
function filter_validated(){
  if($("#c_validated")[0].value === "all"){
    initial();
  } else {
    db.collection("Mods-Users").where("validated", "==", JSON.parse($("#c_validated")[0].value)).get().then((querySnapshot) => {
      table_verify = "";
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        show_verifying(doc);
      });
    });
  }
}
function filter_seller(){
  if($("#c_seller")[0].value === "all"){
    initial();
  } else {
    db.collection("Mods-Users").where("seller", "==", JSON.parse($("#c_seller")[0].value)).get().then((querySnapshot) => {
      table_verify = "";
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        show_verifying(doc);
      });
    });
  }
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

// Firebase gets data
var db = firebase.firestore();

// Get all users in Verifying part
initial();
function initial(){
  table_verify = "";
  db.collection("Users").get().then( async (querySnapshot) => {
    let storage_user_param, storage_user_mods;
    await querySnapshot.forEach(async (docUser) => {
      await show_verifying(docUser);
    });
  }).catch((error) => {
    console.log("Error getting collection Users:", error);
  });
}

var table_verify;
var list_mods_uid = [];
async function show_verifying(docUser){
  await db.collection("Mods-Users").doc(docUser.id).get().then(async (doc) => {
    storage_user_param = docUser.data();
    table_verify += '<tr><td id="name_verify_'+docUser.id+'">'+storage_user_param.name+'</td><td><a id="email_verify_'+docUser.id+'" href="mailto:'+storage_user_param.email+'" target="_blank">'+storage_user_param.email+'</a></td>';
    if(storage_user_param.contact !== undefined){
      table_verify += '<td><a href="';
      if(storage_user_param.contact["provider"] === "messenger" || storage_user_param.contact["provider"] == "instagram"){
        table_verify += storage_user_param.contact["link"];
      } else if (storage_user_param.contact["provider"] === "whatsapp"){
        table_verify += "https://api.whatsapp.com/send?phone="+storage_user_param.contact["link"];
      } else {
        table_verify += "mailto:"+storage_user_param.contact["link"];
      }
    table_verify += '" target="_blank">'+storage_user_param.contact["provider"]+'</a></td>';
    } else {
      table_verify += '<td>-</td>';
    }
    table_verify += '<td><a href="../profile/?id='+doc.id+'" target="_blank">'+doc.id+'</a><br><button type="button" class="bt b_disable" onclick="disable(\''+doc.id+'\')">Disable Account</button></td>';
    if(storage_user_param.sent){
      table_verify += '<td><i class="fa-solid fa-check"></i></td>';
    } else {
      table_verify += '<td><i class="fa-solid fa-xmark"></i>';
    }
    storage_user_mods = doc.data();
    if(storage_user_mods.validated){
      table_verify += '<td><i class="fa-solid fa-check"></i><p>at '+new Date(storage_user_mods.Info_validated["time"].seconds*1000).toLocaleString()+'<br>by <span class="l_uid_'+storage_user_mods.Info_validated["uid"]+'"></span><br>uid: (<a href="../profile/?id='+storage_user_mods.Info_validated["uid"]+'" target="_blank">'+storage_user_mods.Info_validated["uid"]+'</a>)</p></td>';
      // db.collection("Users").doc(storage_user_mods.Info_validated["uid"]).get().then((doc) => {
      //   $("#l_uid_"+storage_user_mods.Info_validated["uid"]).text(doc.data().name);
      // })
      // .catch((error) => {
      //   console.log("Error getting Users document: " + error);
      // });
      list_mods_uid.push(storage_user_mods.Info_validated["uid"]);
    } else {
      table_verify += '<td><i class="fa-solid fa-xmark"></i>';
      if(storage_user_param.sent){
        table_verify += '<br>Waiting . . .';
      }
      table_verify += '</td>';
    }
    if(storage_user_mods.seller){
      table_verify += '<td><i class="fa-solid fa-check"></i><br>';
    } else {
      table_verify += '<td><i class="fa-solid fa-xmark"></i>';
      if(storage_user_mods.validated){
        table_verify += '<br><p>'+storage_user_mods.Info_seller["reason"]+'</p>';
      }
    }
    if(storage_user_param.sent){
      table_verify += '<button type="button" name="button" class="bt b_profile" onclick="verifyUID(\''+docUser.id+'\', \''+storage_user_mods.seller+'\', \''+storage_user_mods.validated+'\')">Edit</button>';
    }
    table_verify += '</td></tr>';
    $("#table_verify").html(table_verify);
    for (let i = 0; i < list_mods_uid.length; i++){
      db.collection("Users").doc(list_mods_uid[i]).get().then((doc) => {
        $(".l_uid_"+list_mods_uid[i]).text(doc.data().name);
      })
      .catch((error) => {
        console.log("Error getting Users document: " + error);
      });
    }
  }).catch((error) => {
    console.log("Error getting document Mods-Users");
  });
}

initial2();
function initial2(){
  let table_check = ""
  db.collection("Item").get().then( async (querySnapshot) => {
    let storage_item_param, storage_user, storage_item_mods, storage_user_mods;
    await querySnapshot.forEach(async (docItem) => {
      await db.collection("Users").doc(docItem.data().ownerID).get().then(async (docUser) => {
        await db.collection("Mods-Item").doc(docItem.id).get().then(async (docModsItem) => {
          storage_item_param = docItem.data();
          storage_user = docUser.data();
          storage_item_mods = docModsItem.data();
          table_check += '<tr><td>'+storage_item_param.name+'<br>(uid: <a href="../item/?id='+docItem.id+'" target="_blank">'+docItem.id+'</a>)<img src="'+storage_item_param.photo+'" class="img_check"></td><td><a id="email_item_'+docItem.id+'" href="mailto:'+storage_user.email+'" target="_blank">'+storage_user.email+'</a></td>';
          if(storage_user.contact !== undefined){
            table_check += '<td><a href="';
            if(storage_user.contact["provider"] === "messenger" || storage_user.contact["provider"] == "instagram"){
              table_check += storage_user.contact["link"];
            } else if (storage_user.contact["provider"] === "whatsapp"){
              table_check += "https://api.whatsapp.com/send?phone="+storage_user.contact["link"];
            } else {
              table_check += "mailto:"+storage_user.contact["link"];
            }
            table_check += '" target="_blank">'+storage_user.contact["provider"]+'</a></td>';
          } else {
            table_check += '<td>-</td>';
          }
          table_check += '" target="_blank">'+storage_user.contact["provider"]+'</a></td><td>'+new Date(storage_item_param.uploaded.seconds*1000).toLocaleString()+'</td><td><button type="button" class="bt b_edit mb-2" onclick="edit(\''+docItem.id+'\')" target="_blank">Edit</button><button type="button" class="bt b_suspend" onclick="suspend(\''+docItem.id+'\', this)"';
          if(storage_item_mods.Info_log !== undefined){
            if(storage_item_mods.Info_log["action"] === "Suspended"){
              table_check += 'style="background-color: #03993A;">Approve';
            }
            else if(storage_item_mods.Info_log["action"] === "Validating"){
              table_check += 'style="background-color: #865A8D;">Validate';
            }
            else {
              table_check += '>Suspend';
            }
            table_check += '</button></td><td>'+storage_item_mods.Info_log["action"]+' by '+'<span id="mods'+docItem.id+'"></span>'+'<br>(uid: <a href="../profile/?id='+storage_item_mods.Info_log["uid"]+'" target="_blank">'+storage_item_mods.Info_log["uid"]+'</a>)<br>at '+new Date(storage_item_mods.Info_log["time"].seconds*1000).toLocaleString()+'<br>'+storage_item_mods.Info_log["reason"]+'</td></tr>';
          } else {
            table_check += ">Suspend</button></td><td></td>";
          }
          $("#table_check").html(table_check);
          if(storage_item_mods.Info_log !== undefined){
            db.collection("Users").doc(storage_item_mods.Info_log["uid"]).get().then((docModsUsers) => {
              storage_user_mods = docModsUsers.data();
              $("#mods"+docItem.id)[0].innerText = storage_user_mods.name;
              table_check = $("#table_check").html();
            })
            .catch((error) => {
              console.log("Error getting Users document: " + error);
            });
          }
        }).catch((error) => {
          console.log("Error getting document Mods-Item: " + error);
        });
      }).catch((error) => {
        console.log("Error getting document Mods-Item: " + error);
      });
    });
  }).catch((error) => {
    console.log("Error getting collection Item:", error);
  });
}


// Profile image
var uid;
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    uid = user.uid;
    db.collection("Mods-Users").doc(uid).get().then((doc) => {
      if(doc.exists){
        if(!doc.data().mods){
          document.location.href = "../404.html";
        }
      } else {
        console.log("No such document!");
        document.location.href = "../404.html";
      }
    }).catch((error) => {
      console.log("Error getting document Users", error);
      document.location.href = "../404.html";
    });
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

// Disable account
function disable(uid_param){
  // firebase.auth().updateUser(uid_param, {
  //   disabled: true
  // });
}

// Profile Edit Button
var uid_param_var;
function verifyUID(uid_param, seller, validated){
  $("#verify_agreement").css("display", "block");
  if(JSON.parse(seller)){
    $(".btn-success").addClass("disabled");
  }
  if(!JSON.parse(seller)&&JSON.parse(validated)){
    $(".btn-warning").addClass("disabled");
  }
  uid_param_var = uid_param;
}
function close_declare(){
  $(".overlay").css("display", "none");
  $(".btn-success").removeClass("disabled");
  $(".btn-warning").removeClass("disabled");
}
function allow(){
  $(".btn-success").addClass("disabled");
  swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    position: "top-end",
    text: "This action can affect the experience of the users.",
    title: "Are you sure you want to add this user as a seller?"
  }).then((isConfirm) => {
    db.collection("Mods-Users").doc(uid_param_var).set({
      validated: true,
      seller: true,
      Info_validated: {
        time: firebase.firestore.FieldValue.serverTimestamp(),
        uid: uid
      },
      Info_seller: {
        reason: "Approved seller"
      }
    }, {merge: true}).then(() => {
      console.log("Document successfully written Mods-User!");
      db.collection("AppSecret").doc('Email').get().then((doc) => {
        Email.send({
          Host: doc.data().Host,
          Username: doc.data().From,
          Password: doc.data().Password,
          To: $("#email_verify_"+uid_param_var).text(),
          From: doc.data().From,
          Subject: "Upgraded to Seller Account in FW Bookstore",
          Body: eval(doc.data().Body["verifyUser"])
        }).then(function (message) {
          console.log("Mail sent successfully!");
          $(".overlay").css("display", "none");
          $(".btn-success").removeClass("disabled");
          $(".btn-warning").removeClass("disabled");
          setTimeout(function(){document.location.reload();}, 500);
        });
      });
    });
  });
}
function disallow(){
  $(".btn-danger").addClass("disabled");
  swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    content: {
      element: "input",
      attributes: {
        placeholder: "Reason"
      }
    },
    position: "top-end",
    text: "This action can affect the experience of the users. Please state the reason of removing this user from FW Bookstore Seller List clearly in the textbox below.",
    title: "Are you sure you want to remove the status of this user as a seller?"
  }).then((isConfirm) => {
    if(isConfirm){
      db.collection("Mods-Users").doc(uid_param_var).set({
        validated: true,
        seller: false,
        Info_validated: {
          time: firebase.firestore.FieldValue.serverTimestamp(),
          uid: uid
        },
        Info_seller: {
          reason: isConfirm
        }
      }, {merge: true})
      .then(() => {
        console.log("Document successfully written Mods User!");
        db.collection("AppSecret").doc('Email').get().then((doc) => {
          console.log(doc.data());
          console.log($("#email_verify_"+uid_param_var).text());
          Email.send({
            Host: doc.data().Host,
            Username: doc.data().From,
            Password: doc.data().Password,
            To: $("#email_verify_"+uid_param_var).text(),
            From: doc.data().From,
            Subject: "FW Bookstore Seller Account Status is Removed",
            Body: eval(doc.data().Body["removeSeller"])
          }).then(function (message) {
            console.log("Mail sent successfully!");
            $(".overlay").css("display", "none");
            $(".btn-success").removeClass("disabled");
            $(".btn-warning").removeClass("disabled");
            setTimeout(function(){document.location.reload();}, 500);
          });
        });
      });
    } else {
      $(".x").removeClass("disabled");
    }
  });
}

// Edit item
function edit(docItemID){
  swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    content: {
      element: "input",
      attributes: {
        placeholder: "Reason"
      }
    },
    position: "top-end",
    text: "This action can affect the experience of the users. Please state the reason of editing this item. \n\nAn email from donotreply.fwbookstore@gmail.com will be automatically sent to the owner of the item. The content includes the moderator name, the time and the reason the item was edited. You will redirect to the studio page to edit the items.",
    title: "Are you sure you want to edit this item?"
  }).then((isConfirm) => {
    if(isConfirm){
      db.collection("Mods-Item").doc(docItemID).set({
        Info_log: {
          action: "Edited",
          reason: isConfirm,
          time: firebase.firestore.FieldValue.serverTimestamp(),
          uid: uid
        }
      }, {merge: true})
      .then(() => {
        console.log("Document successfully written Mods Item!");
        db.collection("Item").doc(docItemID).get().then((docI) => {
          db.collection("AppSecret").doc('Email').get().then((doc) => {
            console.log(doc.data());
            Email.send({
              Host: doc.data().Host,
              Username: doc.data().From,
              Password: doc.data().Password,
              To: $("#email_item_"+docItemID).text(),
              From: doc.data().From,
              Subject: "Your Item in FW Bookstore was Edited",
              Body: eval(doc.data().Body["editItem"])
            }).then(function (message) {
              console.log("Mail sent successfully!");
              document.location.href = "../studio/?action=edit&id="+docItemID;
            });
        });
        });
      });
    }
  });
}
// Suspend item
function suspend(docItemID, component){
  if($(component).text() === "Suspend"){
    swal({
      icon: "warning",
      dangerMode: true,
      buttons: true,
      content: {
        element: "input",
        attributes: {
          placeholder: "Reason"
        }
      },
      position: "top-end",
      text: "This action can affect the experience of the users. Please state the reason of suspending this item. Suspended item will not be seen by public except the owner and FW Bookstore moderators.\n\nAn email from donotreply.fwbookstore@gmail.com will be automatically sent to the owner of the item. The content includes the moderator name, the time and the reason the item was suspended.",
      title: "Are you sure you want to suspend this item?"
    }).then((isConfirm) => {
      if(isConfirm){
        db.collection("Mods-Item").doc(docItemID).set({
          Info_log: {
            action: "Suspended",
            reason: isConfirm,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            uid: uid
          }
        }, {merge: true})
        .then(() => {
          console.log("Document successfully written Mods Item!");
          db.collection("Item").doc(docItemID).get().then((docI) => {
            db.collection("AppSecret").doc('Email').get().then((doc) => {
              console.log(doc.data());
              Email.send({
                Host: doc.data().Host,
                Username: doc.data().From,
                Password: doc.data().Password,
                To: $("#email_item_"+docItemID).text(),
                From: doc.data().From,
                Subject: "Your Item in FW Bookstore was Suspended",
                Body: eval(doc.data().Body["suspendItem"])
              }).then(function (message) {
                console.log("Mail sent successfully!");
                initial2();
                swal({
                  title: "The item is successfully suspended!",
                  text: "Suspended item will not be seen by public except the owner and FW Bookstore moderators.",
                  icon: "success",
                  button: "Close",
                  position: "top-end"
                });
              });
          });
        });
        });
      }
    });
  } else {
    swal({
      icon: "warning",
      dangerMode: true,
      buttons: true,
      position: "top-end",
      text: "This action can affect the experience of the users. By enabling this item, the item is removed from Suspended List in FW Bookstore. \n\nAn email from donotreply.fwbookstore@gmail.com will be automatically sent to the owner of the item.",
      title: "Are you sure you want to approve this item?"
    }).then((isConfirm) => {
      if(isConfirm){
        db.collection("Mods-Item").doc(docItemID).set({
          Info_log: firebase.firestore.FieldValue.delete()
        }, {merge: true})
        .then(() => {
          db.collection("Item").doc(docItemID).get().then((docI) => {
            db.collection("AppSecret").doc('Email').get().then((doc) => {
              console.log(doc.data());
              Email.send({
                Host: doc.data().Host,
                Username: doc.data().From,
                Password: doc.data().Password,
                To: $("#email_item_"+docItemID).text(),
                From: doc.data().From,
                Subject: "Your Item in FW Bookstore was Approved",
                Body: eval(doc.data().Body["enableItem"])
              }).then(function (message) {
                console.log("Mail sent successfully!");
                console.log("Document successfully written Mods Item!");
                initial2();
                swal({
                  title: "The item is successfully approved!",
                  text: "Approved item will be seen by public.",
                  icon: "success",
                  button: "Close",
                  position: "top-end"
                });
              });
            });
          });
        });
      }
    });
  }
}

function hide(ths){
  if($(ths).parent().parent().parent().children().eq(1).css("display") === "block"){
    $(ths).children().addClass("fa-up-right-and-down-left-from-center");
    $(ths).children().removeClass("fa-down-left-and-up-right-to-center");
    $(ths).attr("title", "Show");
    $(ths).parent().parent().parent().children().eq(1).css("display", "none");
  } else {
    $(ths).children().addClass("fa-down-left-and-up-right-to-center");
    $(ths).children().removeClass("fa-up-right-and-down-left-from-center");
    $(ths).attr("title", "Hide");
    $(ths).parent().parent().parent().children().eq(1).css("display", "block");
  }
}

function disable(disableID){
  swal({
    icon: "warning",
    dangerMode: true,
    buttons: true,
    position: "top-end",
    text: "This action can affect the experience of the users. Please be informed that disabled user cannot login to their account and the seller status of the user (if applicable) will be removed. \n\n Only developer has the right to disable user. Please report this issue to the developer Lim Wen Hao by stating the reason of disabling user (ID: " + disableID + ")",
    title: "Disable User"
  });
}
