
function toggle(i,j) {
    var password = document.getElementById(i);
    if (password.type == "password") {
 
            password.type = "text";
            
           document.getElementById(j).innerHTML='<i class="fa fa-eye"  aria-hidden="true"></i>';
 
    }
    else {
 
           document.getElementById(j).innerHTML='<i class="fa fa-eye-slash"  aria-hidden="true"></i>';
        password.type = "password";
    }
}

  var oldpass = document.getElementById("oldpass");
  var newpass = document.getElementById("newpass");
  var newpasscheck = document.getElementById("newpasscheck");
  var btn = document.getElementById("btn");
  var emtydiv = document.getElementById("emtydiv");
  //var atention = document.getElementById("atention");
  oldpass.addEventListener("click", function(){emtydiv.innerHTML = "";});
  newpass.addEventListener("click", function(){emtydiv.innerHTML = "";});
  newpasscheck.addEventListener("click", function(){emtydiv.innerHTML = "";});
  
      function changepass() {
        var xmlhttp = new XMLHttpRequest();
        var arrFromServer;
        var body = 'oldpass=' + oldpass.value + '&newpass=' + newpass.value + '&newpasscheck=' + newpasscheck.value;
        xmlhttp.onreadystatechange=function(){
          if(xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
            arrFromServer = JSON.parse(xmlhttp.responseText);
            console.log(arrFromServer);
            if(arrFromServer.responseCode == 1){
                emtydiv.innerHTML = arrFromServer.responseDesc;
                emtydiv.style.color = "red";
                emtydiv.style.fontSize = "18px";
            } else{
            emtydiv.innerHTML = arrFromServer.responseDesc;
            emtydiv.style.color = "green";
            emtydiv.style.fontSize = "18px";
            oldpass.value = "";
            newpass.value = "";
            newpasscheck.value = "";
          //  atention.style.display = 'none';
            }
          };
        }; 
        xmlhttp.open('post', '/passwordchange', true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded', 'charset=utf-8');
        xmlhttp.send(body);
      }
