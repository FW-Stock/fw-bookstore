// jshint esversion: 6
// FW Bookstore
// © Copyright 2022 FW Bookstore. Ideator: Francis Teoh Dun Yong, Developer: Lim Wen Hao, Social Media: Char Zhi Xuan.
var db = firebase.firestore();
var uid;

$(document).ready(function(){
  // Check whether user keeps login
  if(localStorage.getItem("FW_loginChecked")==="true"){
    alert("Login successfully!", "success");
    localStorage.setItem("FW_anonymous", false);
    localStorage.setItem("FW_emailUser", $("#t_email")[0].value);
		document.location.href = "../";
  } else {
    localStorage.setItem("FW_loginChecked", "false");
  }
});

if(new URLSearchParams(window.location.search).get("mode") === "register"){
  mode();
}

function mode(){
	if($(".l_login").text()==="Login"){
		$(".t_register").html('<div class="l_name mb-2"><i class="fa-solid fa-user t_fa"></i><input class="t_input" type="text" name="name" placeholder="Full Name" id="t_name"></div>');
		$(".l_x_important").eq(0).removeClass("mt-5");
		$(".l_x_important").eq(0).addClass("mt-2");
		$(".l_login").text("Register");
		$(".l_x_important").eq(1).html('Already have an account? Sign In <a class="link_red" href="javascript: mode()">Here</a>');
	} else {
		$(".t_register").html("");
		$(".l_x_important").eq(0).removeClass("mt-2");
		$(".l_x_important").eq(0).addClass("mt-5");
		$(".l_login").text("Login");
		$(".l_x_important").eq(1).html('Haven\'t registered? Sign Up <a class="link_red" href="javascript: mode()">Here</a>');
	}
}

// Native
function login(){
	if(($("#t_email")[0].value !== "") && ($("#t_pw")[0].value !== "")){
    // Email verification
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#t_email")[0].value)){
      // Firebase email verification
      var userEmail = $("#t_email")[0].value;
      var userPassword = $("#t_pw")[0].value;

      firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
      .then((userCredential) => {
        alert("Login successfully!", "success");
        localStorage.setItem("FW_anonymous", false);
        var user = userCredential.user;
        localStorage.setItem("FW_loginChecked", $("#c_login")[0].checked);
        localStorage.setItem("FW_emailUser", $("#t_email")[0].value);
				setTimeout(function(){document.location.href = "../introduction";}, 200);
      })
      .catch((error) => {
        alert(error.code+": "+error.message, 'danger');
      });
    }
    else{
      // Invalid email
      alert("Please fill in your email address in correct format.", "warning");
    }
  }
  else{
    alert("Please fill in the all the blanks.", "warning");
  }
}
function register(){
  if(($("#t_name")[0].value !== "") && ($("#t_email")[0].value !== "") && ($("#t_pw")[0].value !== "")){
    // Email verification
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#t_email")[0].value)){
      // Firebase email verification
      var userEmail = $("#t_email")[0].value;
      var userPassword = $("#t_pw")[0].value;

      // Register in Firebase Authentication Users
      firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword)
      .then((userCredential) => {
        var user = userCredential.user;

        // Add a new document in Cloud Firestore collection
        uid=firebase.auth().currentUser.uid;
        console.log(uid);
        db.collection("Users").doc(uid).set({
            name: $("#t_name")[0].value,
            email: $("#t_email")[0].value,
            sent: false
        })
        .then(() => {
            console.log("Document successfully written!");
            alert("Register successfully! Please re-login to verify your account.", "success");
            mode();
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });

        db.collection("Mods-Users").doc(uid).set({
          seller: false,
          validated: false,
          mods: false
        }, { merge: true}).then(() => {
            console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
      })
      .catch((error) => {
        if($(".l_login").text()==="Register"){
          if(error.code==="auth/email-already-in-use"){
            alert("Email is already in use.", "warning");
          }
          else if(error.code==="auth/weak-password"){
            alert("Weak password.", "warning");
          } else {
						alert(error.code+": "+error.messagee, 'danger');
					}
        }
      });
    } else{
      // Invalid email
      alert("Invalid email.", "warning");
    }
  } else{
    alert("Please fill in the all the blanks.", "warning");
  }
}

// Anonymous
function anonymous() {
  firebase.auth().signInAnonymously()
    .then(() => {
      alert("Successfully login anonymously!", "success");
			localStorage.clear();
			localStorage.setItem("FW_anonymous", true);
      localStorage.setItem("FW_loginChecked", false);
			localStorage.setItem("FW_emailUser", null);
      document.location.href = "../introduction";
    })
    .catch((error) => {
			alert(error.code+": "+error.message, 'danger');
    });
}

function authentication(result){
  /** @type {firebase.auth.OAuthCredential} */
  var credential = result.credential;
  var token = credential.accessToken;
  var user = result.user;
  let email = result.additionalUserInfo.profile.email;
  uid = firebase.auth().currentUser.uid;

  if(result.additionalUserInfo.isNewUser){
    db.collection("Users").doc(uid).set({
        name: user.displayName,
        email: email,
        photo: user.photoURL,
        sent: false
    })
    .then(() => {
        console.log("Document New User successfully written!");
        alert("Login successfully!", "success");
        localStorage.setItem("FW_anonymous", false);
        localStorage.setItem("FW_loginChecked", true);
        localStorage.setItem("FW_emailUser", email);
        setTimeout(function(){document.location.href = "../introduction";}, 200);
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });

    db.collection("Mods-Users/").doc(uid).set({
      seller: false,
      validated: false,
      mods: false
    }, { merge: true}).then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  } else {
    alert("Login successfully!", "success");
    localStorage.setItem("FW_anonymous", false);
    localStorage.setItem("FW_loginChecked", true);
    localStorage.setItem("FW_emailUser", email);
    setTimeout(function(){document.location.href = "../introduction";}, 200);
  }
}

// Google
function google(){
	var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
	firebase.auth().signInWithPopup(provider).then((result) => {
	  authentication(result);
	}).catch((error) => {
	  var email = error.email;
	  var credential = error.credential;
		alert(error.code+":"+error.message, "danger");
	});
}

// Facebook
function fb(){
	var provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().signInWithRedirect(provider);
  $("body").html("Loading . . .");
}
firebase.auth().getRedirectResult().then((result) => {
  authentication(result);
});

// Enter
$("body").keypress(function(e){
  if(e.key==="Enter"){
    submit();
  }
});

// Submit button is clicked
function submit(){
	if($(".l_login").text()==="Login"){
		login();
	} else {
		register();
	}
}

// Bootstrap alert
function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible d-flex align-items-center mt-2" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'+ message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  $("#liveAlertPlaceholder").append(wrapper);
}
