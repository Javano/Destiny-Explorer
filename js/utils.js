function sortTable(n, sortType) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("tblStats");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "desc"; 
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (sortType == "int" && $(x).attr("data-val") && $(y).attr("data-val")) {
        var xVal = 0;
        var yVal = 0;
        if($(x).attr("data-val")){
          xVal = $(x).attr("data-val");
          }
          if($(y).attr("data-val")){
            yVal = $(y).attr("data-val");
          }
        if (dir == "asc") {
          if (parseInt(xVal.replace(',', '')) > parseInt(yVal.replace(',', ''))) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (parseInt(xVal.replace(',', '')) < parseInt(yVal.replace(',', ''))) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      } else if (sortType == "date" ) {
        var dateX = new Date("01/01/1990");
        var dateY = new Date("01/01/1990");
        if($(x).attr("data-val")){
        dateX = new Date($(x).attr("data-val"));
        }
        if($(y).attr("data-val")){
        dateY = new Date($(y).attr("data-val"));
        }
        if (dir == "asc") {
          if (dateX > dateY) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (dateY > dateX) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      } else {
        //Sort String
        if (dir == "asc") {
          if (x.textContent > y.textContent) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.textContent < y.textContent) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
    }
    if (shouldSwitch) { 
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++; 
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "desc") {
        dir = "asc";
        switching = true;
      }
    }
  }
  //reorderTable(table);
}
function reorderTable(table){
  $(table).find("tr td:first-of-type").each(function(i,e){
    $(e).text(i+1 + ".");
  });
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function enforceDomain() {
  if (window.location.hostname != `www.adamtcarruthers.com`) {
      location.replace(`https://www.adamtcarruthers.com/destiny`);
  }
}

function getHTMLID(string){
  return encodeURIComponent(string.replace(/\s/g, "_")).replace(`%`, `_`);
}

function ToInteger(x) {
  x = Number(x);
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}
function modulo(a, b) {
  return a - Math.floor(a / b) * b;
}
function ToUint32(x) {
  return modulo(ToInteger(x), Math.pow(2, 32));
}
function ToInt32(x) {
  var uint32 = ToUint32(x);
  if (uint32 >= Math.pow(2, 31)) {
      return uint32 - Math.pow(2, 32)
  } else {
      return uint32;
  }
}


function base64ToUint8Array(string) {
  var raw = atob(string);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));
  for (var i = 0; i < rawLength; i += 1) {
      array[i] = raw.charCodeAt(i);
  }
  return array;
}

var numDaysBetween = function(d1, d2) {
  var diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

Date.prototype.stdTimezoneOffset = function() {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function msieversion() {

  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var isIE = false;
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
  {
      //alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
      isIE = true;
  }

  return isIE;
}