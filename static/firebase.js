firebase.initializeApp(config);

// Watch for state change from sign in
function initApp() {
  firebase.auth().onAuthStateChanged(user => {
    const signInButton = document.getElementById('signInButton');
    if (user) {
      // User is signed in.
      signInButton.innerText = 'Sign Out';
      document.getElementById('form').style.display = '';

    } else {
      // No user is signed in.
      signInButton.innerText = 'Sign In with Google';
      document.getElementById('form').style.display = 'none';
    }
  });
}

// check if authentication is disabled via query parameter
function authDisabled() {
  const urlParams = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;
  // Auth is disabled only if running on localhost and `auth=false` is passed
  return urlParams.get('auth') === 'false' && hostname === 'localhost';
}


// create ID token
async function createIdToken() {
  if (authDisabled()) {
    console.warn('Auth is disabled. Returning dummy ID token.');
    return new Promise((resolve) => {
      resolve('dummyToken');  // return a dummy ID token
    })
  } else {
    return await firebase.auth().currentUser.getIdToken();
  }
}

window.onload = function () {
  if (authDisabled()) {
    console.warn('Running with auth disabled.');
    document.getElementById('signInButton').innerText = '(Auth Disabled)';
    document.getElementById('form').style.display = '';
  } else {
    console.log('Running with auth enabled.');
    initApp();
  }
};

function signIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');

  var name = "a";
  var email = "b";
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(result => {

      // ======== NEW ============================
      name = result.user.displayName;
      email = result.user.email;

      addStudent(result.user.displayName, result.user.email);
      //=========================================================


      // Returns the signed in user along with the provider's credential
      console.log(`${result.user.displayName} logged in.`);
      window.alert(`Welcome ${result.user.displayName}!`);

    })
    .catch(err => {
      console.log(`Error during sign in: ${err.message}`);
      window.alert(`Sign in failed. Retry or check your browser logs.`);
    });

}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(result => { })
    .catch(err => {
      console.log(`Error during sign out: ${err.message}`);
      window.alert(`Sign out failed. Retry or check your browser logs.`);
    });
}

// Toggle Sign in/out button
function toggle() {
  if (authDisabled()) {
    window.alert('Auth is disabled.');
    return;
  }
  if (!firebase.auth().currentUser) {
    signIn();
  } else {
    signOut();
  }
}

// =========== FUNCTION TO REMOVE =======
/**
 * Sends the user's vote to the server.
 * @param team
 * @returns {Promise<void>}
 */
async function vote(team) {
  console.log(`Submitting a vote for ${team}...`);
  if (firebase.auth().currentUser || authDisabled()) {
    try {
      const token = await createIdToken();

      const formData = new URLSearchParams();
      formData.append("team", team);

      const response = await fetch("https://tabs-vs-spaces-945227819116.us-central1.run.app/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert("Vote submitted successfully!");
      } else {
        alert("Failed to vote");
      }

    } catch (err) {
      console.log(`Error when submitting vote: ${err}`);
      window.alert('Something went wrong... Please try again!');
    }
  } else {
    window.alert('User not signed in.');
  }
}

// ============= NEW ==================================

async function addStudent(name, email) {
  const formData = new URLSearchParams(window.location.search);
  if (formData.keys().length == 0) {
    formData.append("key", "000111");
  }
  formData.append("name", name);
  formData.append("email", email);

  fetch('/add_student', {
    method: 'POST',
    headers: {
    },
    body: formData
  }).then(response => {
    if (response.ok) {
      console.log('student added to db!');
    } else {
      console.error('student failed to add to db :(');
    }
  });

  // update HTML
  fetch('/update_html', {
    method: 'GET',
    headers: {
    }
  }).then(response => {
    if (!response.ok) throw new Error("Failed to fetch :(");
    return response.json();
  }).then(data => {
      console.log("Received from python:", data);
      console.log("Updated the HTML!");
    })
    .catch(error => {
      console.error("failed to update HTML :(", error);
    });
}

// new

// async function clearAttendance() {
//   fetch('/reset_attendance', {
//     method: 'POST',
//     headers: {
//     },
//   }).then(response => {
//     if (response.ok) {
//       console.log('Attendance List Cleared');
//     } else {
//       console.error('Failed to clear attendance list');
//     }
//   });
// }
