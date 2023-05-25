// jshint esversion: 8
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.

function logout(){
  firebase.auth().signOut();
  document.location.href = "login";
  localStorage.setItem("FW_loginChecked", "false");
  localStorage.setItem("FW_emailUser", null);
}

$(document).ready(function(){
  // Check whether user keeps login
  if(localStorage.getItem("FW_emailUser")==null&&localStorage.getItem("FW_anonymous")!=="true"){
    firebase.auth().currentUser.delete();
    logout();
  }
});

// Filter Bar
$(".l_filter_bar_responsive").click(function(){
  press = 1;
  if($("#filter_bar").css("display")==="none"){
    $("#filter_bar").css("display", "inherit");
  }
});
$(".l_filter_bar").click(function(){
  press = 1;
  if(($(document).width() <= 992)&&($("#filter_bar").css("display")==="block")){
    $("#filter_bar").css("display", "none");
  }
});

var width, press = 0;
setInterval(function () {
  if(width!==$(document).width()){
    if(width>992){
      $("#filter_bar").css("display", "inherit");
      press = 0;
    }
    else {
      if(press===0){
        $("#filter_bar").css("display", "none");
      }
    }
  } else if(width>992){
    $("#filter_bar").css("display", "inherit");
  }
  width = $(document).width();
}, 10);

$(".c_box").change(function(){
  if($("#s_0")[0].checked == true&&$("#c_0")[0].checked == true&&$("#f_0")[0].checked == true){
    initial();
  }

  // Checkbox 'All' is clicked
  if(!(this !== $("#s_0")[0]&&this !== $("#c_0")[0]&&this !== $("#f_0")[0])){
    all(".c_box_sub", "#s_0");
    all(".c_box_cat", "#c_0");
    all(".c_box_form", "#f_0");
  } else {
    select(this);
  }

});
function all(component, check){
  for( let i = 0; i < $(component).length; i++){
    $(component).eq(i)[0].checked = $(check)[0].checked;
  }
  if(!$(check)[0].checked){
    $(".card_html").html("");
  }
}

var list_sub, list_cat, list_form;
var storage_filter = [];
function select(component){
  list_sub = [], list_cat = [], list_form = [], storage_filter = [];
  let classSelect;
  if($(component).is(".c_box_sub")){
    classSelect = "sub";
  } else if($(component).is(".c_box_cat")){
    classSelect = "cat";
  } else {
    classSelect = "form";
  }
  for(let j = 0; j < $(".c_box_"+classSelect).length; j++){
    if($(".c_box_"+classSelect).eq(j)[0].checked){
      window["list_"+classSelect].push($(".c_box_"+classSelect).eq(j).parent().children("label").text());
    }
  }
  // if(window["list_"+classSelect].length === $(".c_box_"+classSelect).length){
  //   window["list_"+classSelect] = [];
  // }
  if(classSelect === "sub"){
    filter("subject", list_sub);
  } else if(classSelect === "cat"){
    filter("category", list_cat);
  } else {
    filter("level", list_form);
  }
}
function filter(type, list){
  if(list != ""){
    db.collection("Item").where("filter."+type, "in", list.slice(0, 10)).get().then(async (querySnapshot) => {
      await querySnapshot.forEach((doc) => {
        storage_filter.push(doc.id);
      });
      if(list.length > 10){
        await db.collection("Item").where("filter."+type, "in", list.slice(10, list.length)).get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            storage_filter.push(doc.id);
          });
        });
      }

      card_html = "";
      for(let k = 0; k < storage_filter.length; k++){
        await db.collection("Item").doc(storage_filter[k]).get().then(async (doc) => {
          db.collection("Mods-Item").doc(doc.id).get().then((docModsItem) => {
            if(docModsItem.data().Info_log === undefined){
              storage_item = doc.data();
              card_html += '<div class="col-xl-3 col-lg-4 col-md-6 col-sm-10"><div class="card item_card" id="'+doc.id+'" onclick="item(\''+doc.id+'\')"><div class="card-img-top img" style="background-image: url(\''+storage_item.photo+'\');"></div><div class="card-body"><h5 class="card-title l_item_name">'+storage_item.name+'</h5><p class="card-text l_price">RM <span class="no_price">'+storage_item.price['aft'].toFixed(2)+'</span></p>';
              if(!(storage_item.price['ori'].toFixed(2) === "NaN" || storage_item.price['ori'].toFixed(2) === "0.00")){
                card_html += '<p class="card-text"><span class="l_ori_price">RM <span class="no_oriPrice">'+storage_item.price['ori'].toFixed(2)+'</span></span>';
                if(((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0) !== "NaN"){
                  card_html += ' (<span class="l_discount"><span class="no_discount">'+((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0)+'</span>%</span> Discount)';
                }
                card_html += '</p>';
              }
              card_html += '<p class="card-text text-muted" id="l_name_'+doc.id+'"></p></div></div></div>';
              $(".card_html").html(card_html);
            }
          }).catch((error) => {
            console.log("Error getting document Mods Item:", error);
          });
        }).catch((error) => {
          console.log("Error getting collection Item:", error);
        });
      }
      if(storage_filter == ""){
        $(".card_html").html("");
      }
    });
  } else {
    $(".card_html").html("");
  }
}

// Firebase gets data
var db = firebase.firestore();
var storage_item;
var uid;
var storage_user;
var card_html = "";

initial();
function initial(){
  card_html = "";
  db.collection("Item").get().then( async (querySnapshot) => {
    await querySnapshot.forEach((doc) => {
      db.collection("Mods-Item").doc(doc.id).get().then((docModsItem) => {
        db.collection("Mods-Users").doc(doc.data().ownerID).get().then((docModsUser) => {
          if(docModsUser.data().seller){
            if(docModsItem.data().Info_log === undefined){
              storage_item = doc.data();
              let docID = doc.id;
              db.collection("Users").doc(storage_item.ownerID).get().then((doc) => {
                $("#l_name_"+docID).text(doc.data().name);
              }).catch((erorr) => {
                console.log("Error getting collection Item:", error);
              });
              card_html += '<div class="col-xl-3 col-lg-4 col-md-6 col-sm-10"><div class="card item_card" id="'+doc.id+'" onclick="item(\''+doc.id+'\')"><div class="card-img-top img" style="background-image: url(\''+storage_item.photo+'\');"></div><div class="card-body"><h5 class="card-title l_item_name">'+storage_item.name+'</h5><p class="card-text l_price">RM <span class="no_price">'+storage_item.price['aft'].toFixed(2)+'</span></p>';
              if(!(storage_item.price['ori'].toFixed(2) === "NaN" || storage_item.price['ori'].toFixed(2) === "0.00")){
                card_html += '<p class="card-text"><span class="l_ori_price">RM <span class="no_oriPrice">'+storage_item.price['ori'].toFixed(2)+'</span></span>';
                if(((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0) !== "NaN"){
                  card_html += ' (<span class="l_discount"><span class="no_discount">'+((storage_item.price['ori']-storage_item.price['aft'])/storage_item.price['ori']*100).toFixed(0)+'</span>%</span> Discount)';
                }
                card_html += '</p>';
              }
              card_html += '<p class="card-text text-muted" id="l_name_'+doc.id+'"></p></div></div></div>';
              $(".card_html").html(card_html);
            }
          }
        }).catch((error) => {
          console.log("Error getting document Mods Users:", error);
        });


      }).catch((error) => {
        console.log("Error getting document Mods Item:", error);
      });
    });

  }).catch((error) => {
    console.log("Error getting collection Item:", error);
  });
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
      } else {
        console.log("No such document!");
        $("#i_profile").css("display", "none");
      }
    }).catch((error) => {
      console.log("Error getting document Users", error);
    });
  }
});

function item(id){
  document.location.href = "item?id="+id;
}

function profile(){
  document.location.href = "profile?id="+uid;
}
