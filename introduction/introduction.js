// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

// Promotion
swal.fire ({
  title: 'Give Away!',
  html: 'Enjoy up to <b>50% discount</b> when buying the books! You can even get <b>free books</b> if fulfilling the condition set by seller! <br><br><b>Visit</b> our official FW Bookstore Instagram (<a href="https://www.instagram.com/fwbookstore_">@fwbookstore_</a>) and  Facebook (<a href="https://www.facebook.com/fwbookstore123">@fwbookstore123</a>) to get latest update on our website!',
  iconHtml: '<img src="https://gifimage.net/wp-content/uploads/2017/11/gift-gif-14.gif">',
  customClass: {
    icon: 'promotion_img'
  }
});
//https://cdn.dribbble.com/users/78025/screenshots/1167144/media/c95b5bea7a3dc987716f6e67e870d834.gif

// Firebase gets data
var db = firebase.firestore();
var storage_item;
var uid;
var storage_user;

// Profile image
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
    }).catch((error) => {
      console.log("Error getting document Users", error);
    });
  }
});

function profile(){
  document.location.href = "../profile?id="+uid;
}
