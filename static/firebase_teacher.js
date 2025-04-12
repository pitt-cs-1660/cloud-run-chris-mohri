firebase.initializeApp(config);

function updateAttendanceList(){
    fetch('/update_html', {
      method: 'GET',
      headers: {
      }
    }).then(response => {
      if (!response.ok) throw new Error("Failed to fetch :(");
      return response.json();
    }).then(data => {
        console.log("Received from python:", data);
        updateHTML(data);
        console.log("Updated the HTML!");
      })
      .catch(error => {
        console.error("failed to update HTML :(", error);
      });
  }

function updateHTML(data){
    console.log("entered updateHTML()");
    var section = document.getElementById('present_section');
  
    var code = document.getElementById('daily_code').innerText;
  
    //reset 
    section.innerHTML = '';
  
    data.forEach(entry => {
      //only show if the entry has the correct code
      if (entry[2]==code || entry[2]==999999){
        const name = entry[0];
      
        const div = document.createElement('div');
        div.textContent = name;
        div.style.backgroundColor="lightblue";
        div.style.padding = '4px';
        div.style.marginBottom = '2px';
        div.style.borderBottom = '1px solid #ccc';
        section.appendChild(div);
      }
      
  
    });
  }