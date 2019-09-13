String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

String.prototype.ucFirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.formatUSPhone = function () {
  var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);

    //this = this.trim();
    var results = phoneTest.exec(this);
    if (results !== null && results.length > 8) {

        return "+1(" + results[3] + ") " + results[4] + "-" + results[5] + (typeof results[8] !== "undefined" ? " x" + results[8] : "");

    }
    else {
         return this;
    }
}

Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = (Math.round((Number(n) || 0) * 100) / 100).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };


 Number.prototype.formatDollars = function (c) {
   return this.formatMoney(c, '.', ',')
 }
