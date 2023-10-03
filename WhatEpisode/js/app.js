(function() {
	// Initialize Firebase
  const config = {
    apiKey: "AIzaSyAu1jQVx0ZF0KWn3-5U393Xp7K0Z2izYnw",
    authDomain: "whatepisode-3c98a.firebaseapp.com",
    databaseURL: "https://whatepisode-3c98a.firebaseio.com",
    projectId: "whatepisode-3c98a",
    storageBucket: "whatepisode-3c98a.appspot.com",
    messagingSenderId: "822747306142"
  };
  // Check if firebase app is already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  var loggedInUser = "";

  // Changes a@gmail.com to a@gmail,com
  function convertEmail(emailWithPeriod) {
    var lastIndexOfPeriod = (emailWithPeriod).lastIndexOf(".");
    var emailLength = (emailWithPeriod).length;
    var emailWithComma = (emailWithPeriod).substring(0, lastIndexOfPeriod) + "," + (emailWithPeriod).substring(lastIndexOfPeriod + 1, emailLength);
    return emailWithComma;
  }

  // Uses regex to check email
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function httpGetAsync(theUrl, callback) {
  	var xmlHttp = new XMLHttpRequest();
  	xmlHttp.onreadystatechange = function() {
  	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
  		callback(xmlHttp.responseText);
  	}
  	xmlHttp.open("GET", theUrl, true); // true for asynchronous
  	xmlHttp.send(null);
  }

  function writeUserData(email) {
    firebase.database().ref('users/' + email).set({
      moviesToWatch: "",
      moviesWatched: "",
      showsFinished: ""
    });
    console.log("executed. write user data.")
  }

  // This populates the tv show selection page
  function handleTvResult(result) {
  	var listGroup = document.getElementsByClassName('list-group')[0];
  	// If result lists already exists, remove it first.
  	if (listGroup != null) {
  		listGroup.parentNode.removeChild(listGroup);
  	}
  	// Parse JSON from string
  	var jsonResult = JSON.parse(result);
  	// The array of shows as objects
  	var tvResults = jsonResult.results;
  	var container = document.getElementsByClassName('container')[0];
  	var tvDiv = document.createElement('div');
  	tvDiv.classList.add('list-group');
  	container.appendChild(tvDiv);

    // Go through each tv result
  	for (i = 0; i < tvResults.length; i++) {
      // Create element to hold each TV result
  		var tvListItem = document.createElement('a');
  		tvListItem.href = '#';
  		tvListItem.classList.add('list-group-item');
      var showName = tvResults[i].name;
      // Grab show name and year it was created
      if (tvResults[i].first_air_date == '') { // If theres no first air date data, ignore putting one
        var textNode = document.createTextNode(showName + '\t');
      } else {
        var textNode = document.createTextNode(showName + ' (' + tvResults[i].first_air_date.substring(0,4) + ')\t');
      }
  		var image = document.createElement("IMG");
  		image.classList.add('tvImage');
      // Grab the image
  		image.src = 'https://image.tmdb.org/t/p/w300' + tvResults[i].poster_path;
      if (image.src == 'https://image.tmdb.org/t/p/w300null') {
        image.src = 'img/default-image.jpg';
      }
      // Plus icon
      var plusIcon = document.createElement('span');
      var showId = tvResults[i].id;
      plusIcon.setAttribute('data-id', showId);
      plusIcon.classList.add('glyphicon');
      plusIcon.classList.add('glyphicon-plus-sign');
      plusIcon.onclick = function() {
        var user = firebase.auth().currentUser;
        var showIDtoAdd = this.getAttribute('data-id');
        var storedEmail = convertEmail(user.email);
        var showsFinished = firebase.database().ref('users/' + storedEmail + '/showsFinished');
        showsFinished.once('value', function(snapshot) {
          if (snapshot.val() != "") { // Already data in showsFinished
            firebase.database().ref("users/" + storedEmail).update({ showsFinished: snapshot.val() + ' ' + showIDtoAdd });
          } else {
            firebase.database().ref("users/" + storedEmail).update({ showsFinished: showIDtoAdd });
          }
        });
        swal({
          title: "Show has been added",
          text: "Show will now appear in your shows finished page.",
          timer: 2500,
          showConfirmButton: false,
          allowOutsideClick: true,
          type: "success"
        });
      };
      // Info icon
      var infoIcon = document.createElement('span');
      var showDesc = tvResults[i].overview;
      var showTitle = tvResults[i].name;
      infoIcon.setAttribute('data-desc', showDesc);
      infoIcon.setAttribute('data-title', showTitle);
      infoIcon.setAttribute('data-img', image.src);
      infoIcon.classList.add('glyphicon');
      infoIcon.classList.add('glyphicon-info-sign');
      infoIcon.onclick = function() {
        swal({
          title: this.getAttribute('data-title'),
          text: this.getAttribute('data-desc'),
          allowOutsideClick: true,
          confirmButtonText: "Close",
          imageUrl: this.getAttribute('data-img'),
          imageSize: "400x400"
        });
      };
      // Append to HTML
  		tvListItem.appendChild(image);
  		tvListItem.appendChild(textNode);
      tvListItem.appendChild(plusIcon);
      tvListItem.appendChild(infoIcon);
  		tvDiv.appendChild(tvListItem);
  	}
  }

  // This populates the movies selection page
  function handleMovieResult(result) {
    var listGroup = document.getElementsByClassName('list-group')[0];
    // If result lists already exists, remove it first.
    if (listGroup != null) {
      listGroup.parentNode.removeChild(listGroup);
    }
    // Parse JSON from string
    var jsonResult = JSON.parse(result);
    // The array of shows as objects
    var movieResults = jsonResult.results;
    var container = document.getElementsByClassName('container')[0];
    var movieDiv = document.createElement('div');
    movieDiv.classList.add('list-group');
    container.appendChild(movieDiv);

    // Go through each movie result
    for (i = 0; i < movieResults.length; i++) {
      // Create element to hold each movie result
      var movieListItem = document.createElement('a');
      movieListItem.href = '#';
      movieListItem.classList.add('list-group-item');
      var movieName = movieResults[i].title;
      // Grab movie name and year it was created
      if (movieResults[i].release_date == '') { // If theres no first air date data, ignore putting one
        var textNode = document.createTextNode(movieName + '\t');
      } else {
        var textNode = document.createTextNode(movieName + ' (' + movieResults[i].release_date.substring(0,4) + ')\t');
      }
      var image = document.createElement("IMG");
      image.classList.add('tvImage');
      // Grab the image
      image.src = 'https://image.tmdb.org/t/p/w300' + movieResults[i].poster_path;
      if (image.src == 'https://image.tmdb.org/t/p/w300null') {
        image.src = 'img/default-image.jpg';
      }
      // Plus icon
      var plusIcon = document.createElement('span');
      var movieId = movieResults[i].id;
      plusIcon.setAttribute('data-id', movieId);
      plusIcon.classList.add('glyphicon');
      plusIcon.classList.add('glyphicon-plus-sign');
      plusIcon.onclick = function() {
        var user = firebase.auth().currentUser;
        var movieIDtoAdd = this.getAttribute('data-id');

        var lastIndexOfPeriod = (user.email).lastIndexOf(".");
        var emailLength = (user.email).length;
        var storedEmail = (user.email).substring(0, lastIndexOfPeriod) + "," + (user.email).substring(lastIndexOfPeriod + 1, emailLength);
        var moviesWatched = firebase.database().ref('users/' + storedEmail + '/moviesWatched');
        moviesWatched.once('value', function(snapshot) {
          if (snapshot.val() != "") { // Already data in moviesWatched
            firebase.database().ref("users/" + storedEmail).update({ moviesWatched: snapshot.val() + ' ' + movieIDtoAdd });
          } else {
            firebase.database().ref("users/" + storedEmail).update({ moviesWatched: movieIDtoAdd });
          }
        });
        swal({
          title: "Movie has been added",
          text: "Movie will now appear in your movies watched page.",
          timer: 2500,
          showConfirmButton: false,
          allowOutsideClick: true,
          type: "success"
        });
      };
      // Info icon
      var infoIcon = document.createElement('span');
      var movieDesc = movieResults[i].overview;
      var movieTitle = movieResults[i].title;
      infoIcon.setAttribute('data-desc', movieDesc);
      infoIcon.setAttribute('data-title', movieTitle);
      infoIcon.setAttribute('data-img', image.src);
      infoIcon.classList.add('glyphicon');
      infoIcon.classList.add('glyphicon-info-sign');
      infoIcon.onclick = function() {
        swal({
          title: this.getAttribute('data-title'),
          text: this.getAttribute('data-desc'),
          allowOutsideClick: true,
          confirmButtonText: "Close",
          imageUrl: this.getAttribute('data-img'),
          imageSize: "400x400"
        });
      };
      // Append to HTML
      movieListItem.appendChild(image);
      movieListItem.appendChild(textNode);
      movieListItem.appendChild(plusIcon);
      movieListItem.appendChild(infoIcon);
      movieDiv.appendChild(movieListItem);
    }
  }

  // Adds a single movie cell to html
  function showSingleMovieResult(result) {
    // Parse JSON from string
    var jsonResult = JSON.parse(result);
    var movieDiv = document.getElementsByClassName('list-group')[0];
    // Create element to hold each movie result
    var movieListItem = document.createElement('a');
    movieListItem.href = '#';
    movieListItem.classList.add('list-group-item');
    var movieName = jsonResult.title;
    // Grab movie name and year it was created
    if (jsonResult.release_date == '') { // If theres no first air date data, ignore putting one
      var textNode = document.createTextNode(movieName + '\t');
    } else {
      var textNode = document.createTextNode(movieName + ' (' + jsonResult.release_date.substring(0,4) + ')\t');
    }
    var image = document.createElement("IMG");
    image.classList.add('tvImage');
    // Grab the image
    image.src = 'https://image.tmdb.org/t/p/w300' + jsonResult.poster_path;
    if (image.src == 'https://image.tmdb.org/t/p/w300null') {
      image.src = 'img/default-image.jpg';
    }
    // Delete icon
    var deleteIcon = document.createElement('span');
    var movieId = jsonResult.id;
    var deleteConfirm = false;
    deleteIcon.setAttribute('data-id', movieId);
    deleteIcon.classList.add('glyphicon');
    deleteIcon.classList.add('glyphicon-remove-circle');
    deleteIcon.onclick = function() {
      swal({
        title: "Are you sure?",
        text: "Do you want to delete this from your watched list?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){
        swal("Deleted!", "This movie has been deleted from watched list.", "success");
        deleteConfirm = true;
      });
      setTimeout(function(){
      if (deleteConfirm) {
        var user = firebase.auth().currentUser;
        var movieIDtoDelete = deleteIcon.getAttribute('data-id');
        var storedEmail = convertEmail(user.email);
        var moviesWatched = firebase.database().ref('users/' + storedEmail + '/moviesWatched');
        moviesWatched.once('value', function(snapshot) {
          var moviesWatchedIDs = (snapshot.val()).split(" ");
          if (moviesWatchedIDs.length == 1) { // If there's only 1 movie stored, set the list to blank
            firebase.database().ref("users/" + storedEmail).update({ moviesWatched: "" }); // Update firebase
          } else {
            var indexToRemoveAt;
            for (var i = 0; i < moviesWatchedIDs.length; i++) { // Go through list to see where you should remove
              if (moviesWatchedIDs[i] == movieIDtoDelete) {
                  indexToRemoveAt = i;
                  break;
              }
            }
            moviesWatchedIDs.splice(indexToRemoveAt, 1); // Remove from array the id you want gone
            var newMoviesWatchedIDs = moviesWatchedIDs.join(" "); // Turns array into string, formats it to be stored in firebase
            firebase.database().ref("users/" + storedEmail).update({ moviesWatched: newMoviesWatchedIDs }); // Update firebase
          }
        });
      }}, 2500);
    };
    // Info icon
    var infoIcon = document.createElement('span');
    var movieDesc = jsonResult.overview;
    var movieTitle = jsonResult.title;
    infoIcon.setAttribute('data-desc', movieDesc);
    infoIcon.setAttribute('data-title', movieTitle);
    infoIcon.setAttribute('data-img', image.src);
    infoIcon.classList.add('glyphicon');
    infoIcon.classList.add('glyphicon-info-sign');
    infoIcon.onclick = function() {
      swal({
        title: this.getAttribute('data-title'),
        text: this.getAttribute('data-desc'),
        allowOutsideClick: true,
        confirmButtonText: "Close",
        imageUrl: this.getAttribute('data-img'),
        imageSize: "400x400"
      });
    };
    // Append to HTML
    movieListItem.appendChild(image);
    movieListItem.appendChild(textNode);
    movieListItem.appendChild(deleteIcon);
    movieListItem.appendChild(infoIcon);
    movieDiv.appendChild(movieListItem);
  }

  // Adds a single tv cell to html
  function showSingleTvResult(result) {
    // Parse JSON from string
    var jsonResult = JSON.parse(result);
    var tvDiv = document.getElementsByClassName('list-group')[0];
    // Create element to hold each movie result
    var tvListItem = document.createElement('a');
    tvListItem.href = '#';
    tvListItem.classList.add('list-group-item');
    var showName = jsonResult.name;
    // Grab show name and year it was created
    if (jsonResult.release_date == '') { // If theres no first air date data, ignore putting one
      var textNode = document.createTextNode(showName + '\t');
    } else {
      var textNode = document.createTextNode(showName + ' (' + jsonResult.first_air_date.substring(0,4) + ')\t');
    }
    var image = document.createElement("IMG");
    image.classList.add('tvImage');
    // Grab the image
    image.src = 'https://image.tmdb.org/t/p/w300' + jsonResult.poster_path;
    if (image.src == 'https://image.tmdb.org/t/p/w300null') {
      image.src = 'img/default-image.jpg';
    }
    // Delete icon
    var deleteIcon = document.createElement('span');
    var showId = jsonResult.id;
    var deleteConfirm = false;
    deleteIcon.setAttribute('data-id', showId);
    deleteIcon.classList.add('glyphicon');
    deleteIcon.classList.add('glyphicon-remove-circle');
    deleteIcon.onclick = function() {
      swal({
        title: "Are you sure?",
        text: "Do you want to delete this from your finished list?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      },
      function(){
        swal("Deleted!", "This show has been deleted from finished list.", "success");
        deleteConfirm = true;
      });
      setTimeout(function(){
      if (deleteConfirm) {
        var user = firebase.auth().currentUser;
        var showIDtoDelete = deleteIcon.getAttribute('data-id');
        var storedEmail = convertEmail(user.email);
        var showsFinished = firebase.database().ref('users/' + storedEmail + '/showsFinished');
        showsFinished.once('value', function(snapshot) {
          var showsFinishedIDs = (snapshot.val()).split(" ");
          if (showsFinishedIDs.length == 1) { // If there's only 1 show stored, set the list to blank
            firebase.database().ref("users/" + storedEmail).update({ showsFinished: "" }); // Update firebase
          } else {
            var indexToRemoveAt;
            for (var i = 0; i < showsFinishedIDs.length; i++) { // Go through list to see where you should remove
              if (showsFinishedIDs[i] == showIDtoDelete) {
                  indexToRemoveAt = i;
                  break;
              }
            }
            showsFinishedIDs.splice(indexToRemoveAt, 1); // Remove from array the id you want gone
            var newShowsFinishedIDs = showsFinishedIDs.join(" "); // Turns array into string, formats it to be stored in firebase
            firebase.database().ref("users/" + storedEmail).update({ showsFinished: newShowsFinishedIDs }); // Update firebase
          }
        });
      }}, 2500);
    };
    // Info icon
    var infoIcon = document.createElement('span');
    var showDesc = jsonResult.overview;
    var showTitle = jsonResult.name;
    infoIcon.setAttribute('data-desc', showDesc);
    infoIcon.setAttribute('data-title', showTitle);
    infoIcon.setAttribute('data-img', image.src);
    infoIcon.classList.add('glyphicon');
    infoIcon.classList.add('glyphicon-info-sign');
    infoIcon.onclick = function() {
      swal({
        title: this.getAttribute('data-title'),
        text: this.getAttribute('data-desc'),
        allowOutsideClick: true,
        confirmButtonText: "Close",
        imageUrl: this.getAttribute('data-img'),
        imageSize: "400x400"
      });
    };
    // Append to HTML
    tvListItem.appendChild(image);
    tvListItem.appendChild(textNode);
    tvListItem.appendChild(deleteIcon);
    tvListItem.appendChild(infoIcon);
    tvDiv.appendChild(tvListItem);
  }

  function searchForTVShows(searchQuery) {
       // Check for empty search query
       if (searchQuery === '') {
        // Display pop up
        swal("Required" , "Please enter a show to search for.", "warning");
        return;
      }
	  	var url = "https://api.themoviedb.org/3/search/tv?api_key=e0bc761be93675224d98aba674169611&language=en-US&query=" + searchQuery + "&page=1";
	  	httpGetAsync(url, handleTvResult);
  }

  function searchForMovies(searchQuery) {
      // Check for empty search query
      if (searchQuery === '') {
        // Display pop up
        swal("Required" , "Please enter a movie to search for.", "warning");
        return;
      }
      var url = "https://api.themoviedb.org/3/search/movie?api_key=e0bc761be93675224d98aba674169611&language=en-US&query=" + searchQuery + "&page=1";
      httpGetAsync(url, handleMovieResult);
  }

  // Get elements
  // Login
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const currentUser = document.getElementById('currentUserTxt');
  // Signup
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const signupConfirmPassword = document.getElementById('signupConfirmPassword');
  const signupBtn = document.getElementById('signupBtn');
  // Confirmation buttons
  const confirmLoginBtn = document.getElementById('confirmLoginBtn');
  const confirmSignupBtn = document.getElementById('confirmSignupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  // TV Show search
  const tvSearchQuery = document.getElementById('tvSearchQuery');
  const tvSearchBtn = document.getElementById('tvSearchBtn');
  // Movie search
  const movieSearchQuery = document.getElementById('movieSearchQuery');
  const movieSearchBtn = document.getElementById('movieSearchBtn');
  // Nav links
  const showsNavItem = document.getElementById('showsNavItem');
  const moviesNavItem = document.getElementById('moviesNavItem');
  const userNavItem = document.getElementById('userNavItem');
  const watchedNavItem = document.getElementById('watchedNavItem');

 // Handles tv search
 if (tvSearchBtn != null) {
	  // Add tv search event
	  tvSearchBtn.addEventListener('click', e => searchForTVShows(tvSearchQuery.value));
    
    tvSearchQuery.addEventListener('keyup', e => {
        const key = e.which || e.keyCode;
        // Check for 'Enter' key
        if (key === 13) {
            searchForTVShows(tvSearchQuery.value);
        }
    });
  }

  // Handles movie search
 if (movieSearchBtn != null) {
    // Add movie search event
    movieSearchBtn.addEventListener('click', e => searchForMovies(movieSearchQuery.value));

    movieSearchQuery.addEventListener('keyup', e => {
        const key = e.which || e.keyCode;
        // Check for 'Enter' key
        if (key === 13) {
            searchForMovies(movieSearchQuery.value);
        }
    });
      
  }

  // Handles login
  if (confirmLoginBtn != null) {
	  // Add login event
	  confirmLoginBtn.addEventListener('click', e => {
	  	const auth = firebase.auth();
	  	const loginEmailValue = loginEmail.value;
	  	const loginPassValue = loginPassword.value;
	  	// Log them in
	  	const promise = auth.signInWithEmailAndPassword(loginEmailValue, loginPassValue);
	  	promise
	  		.catch(e => alert(e.message));
	  });
  }

  // Handles logout
  if (logoutBtn != null) {
	  // Add logout event
	  logoutBtn.addEventListener('click', e => {
	  	// Log them out
	  	firebase.auth().signOut();
	  	window.location = "index.html";
	  	loginBtn.style.display = "block";
	  	signupBtn.style.display = "block";
	  });
  }

  // Handles signup
  if (confirmSignupBtn != null) {
	  //Add signup event
	  confirmSignupBtn.addEventListener('click', e => {
	  	const auth = firebase.auth();
	  	// Sign up
	  	const signupEmailValue = signupEmail.value;
	  	const signupPassValue = signupPassword.value;
	  	const signupConfirmPassValue = signupConfirmPassword.value;

	  	if ((signupPassValue === signupConfirmPassValue) && (validateEmail(signupEmailValue)) && (signupPassValue.length >= 6)) {
	  		firebase.auth().createUserWithEmailAndPassword(signupEmailValue, signupPassValue).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				alert(errorMessage);
				// ...
			});
      var storedEmail = convertEmail(signupEmailValue);
      writeUserData(storedEmail);
      swal({
        title: "Account Created!",
        text: "Your account has been successfully created.",
        timer: 2500,
        showConfirmButton: false,
        type: "success"
      });
    } else if (!validateEmail(signupEmailValue)){
        swal({
          title: "Email Format Error",
          text: "Email incorrectly formatted. Please enter a valid one.",
          timer: 2500,
          showConfirmButton: false,
          type: "error"
        });
	  } else if (signupPassValue != signupConfirmPassValue) {
        swal({
          title: "Password Error",
          text: "Passwords do not match. Please re-enter.",
          timer: 2500,
          showConfirmButton: false,
          type: "error"
        });
    } else if (signupPassValue.length < 6) {
        swal({
          title: "Password Error",
          text: "Password needs to be at least 6 characters. Please re-enter.",
          timer: 3500,
          showConfirmButton: false,
          type: "error"
        });
    }
	  });
  }

  firebase.auth().onAuthStateChanged(function(user) {
    // Grab current location in the website
    var currentLocation = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
	  if (user) {
	    // User is signed in.
	    var email = user.email;
	    var uid = user.uid;
      // Redirects user to homepage after logging in or signing up
	    if ((currentLocation === 'login.html') || (currentLocation === 'signup.html')) {
	    	window.location = "index.html";
	    }
	    currentUser.textContent = email;
      loggedInUser = email;
      // Hide login and signup
	    loginBtn.style.display = "none";
	    signupBtn.style.display = "none";
      // Show logout button
	    logoutBtn.style.display = "block";
	    logoutBtn.style.float = "right";
      showsNavItem.style.display = "inline";
      moviesNavItem.style.display = "inline";
      userNavItem.style.display = "inline";
      watchedNavItem.style.display = "inline";

	  } else { // User is not signed in.
     if ((currentLocation === 'shows.html') || (currentLocation === 'movies.html') || (currentLocation === 'moviesWatched.html') || (currentLocation === 'showsFinished.html')) {
        window.location = "login.html";
        alert("You need to log in to access this page. Please log in or sign up.")
      }
	  }
 });

setTimeout(function() {
  // Only run this on Movies Watched page, this populates the Movies Watched page
  if (window.location.href.indexOf('moviesWatched.html') > -1) {
    var user = firebase.auth().currentUser;
    if (user) {
      console.log("u signed in as " + user.email);
      var lastIndexOfPeriod = (user.email).lastIndexOf(".");
      var emailLength = (user.email).length;
      var storedEmail = (user.email).substring(0, lastIndexOfPeriod) + "," + (user.email).substring(lastIndexOfPeriod + 1, emailLength);
      var moviesWatched = firebase.database().ref('users/' + storedEmail + '/moviesWatched');
      moviesWatched.on('value', function(snapshot) {
        if (snapshot.val() != "") {
          console.log(snapshot.val());
          // Stores the id's of the movies the user has watched
          var moviesWatchedIDs = (snapshot.val()).split(" ");
          var listGroup = document.getElementsByClassName('list-group')[0];
          // If result lists already exists, remove it first.
          if (listGroup != null) {
            listGroup.parentNode.removeChild(listGroup);
          }
          var container = document.getElementsByClassName('container')[0];
          var movieDiv = document.createElement('div');
          movieDiv.classList.add('list-group');
          container.appendChild(movieDiv);
          for (var i = 0; i < moviesWatchedIDs.length; i++) {
            var url = "https://api.themoviedb.org/3/movie/" + moviesWatchedIDs[i] + "?api_key=e0bc761be93675224d98aba674169611&language=en-US";
            httpGetAsync(url, showSingleMovieResult);
          }
          console.log(moviesWatchedIDs);
        } else { // If the list stored in firebase is empty, have a fresh page
          var listGroup = document.getElementsByClassName('list-group')[0];
          if (listGroup != null) {
            listGroup.parentNode.removeChild(listGroup);
          }
        }
      });
    } else {
      // No user is signed in.
      console.log("u not signed in");
    }
 } else if (window.location.href.indexOf('showsFinished.html') > -1) {
   var user = firebase.auth().currentUser;
   if (user) {
     console.log("u signed in as " + user.email);
     var storedEmail = convertEmail(user.email);
     var showsFinished = firebase.database().ref('users/' + storedEmail + '/showsFinished');
     showsFinished.on('value', function(snapshot) {
       if (snapshot.val() != "") {
         console.log(snapshot.val());
         // Stores the id's of the shows the user has finished
         var showsFinishedIDs = (snapshot.val()).split(" ");
         var listGroup = document.getElementsByClassName('list-group')[0];
         // If result lists already exists, remove it first.
         if (listGroup != null) {
           listGroup.parentNode.removeChild(listGroup);
         }
         var container = document.getElementsByClassName('container')[0];
         var tvDiv = document.createElement('div');
         tvDiv.classList.add('list-group');
         container.appendChild(tvDiv);
         for (var i = 0; i < showsFinishedIDs.length; i++) {
           var url = "https://api.themoviedb.org/3/tv/" + showsFinishedIDs[i] + "?api_key=e0bc761be93675224d98aba674169611&language=en-US";
           httpGetAsync(url, showSingleTvResult);
         }
         console.log(showsFinishedIDs);
       } else { // If the list stored in firebase is empty, have a fresh page
         var listGroup = document.getElementsByClassName('list-group')[0];
         if (listGroup != null) {
           listGroup.parentNode.removeChild(listGroup);
         }
       }
     });
   } else {
     // No user is signed in.
     console.log("u not signed in");
   }
 }
}, 1000); // Delay of 1000ms

}());
