$(function () {

  var PARTNER_STATUS_TYPES = JSON.parse($("[name='PARTNER_STATUS_TYPES']").val());
  var PARTNER_TYPES = JSON.parse($("[name='PARTNER_TYPES']").val());

  var searchParentComponent = $("[name='search']").parent();
  var selectableFieldNames = {
    status: PARTNER_STATUS_TYPES,
    type: PARTNER_TYPES
  };



  function setSearchField(value, byUser){
    var searchVal = $("[name='search']").val()
    $("[name='search']").remove();
    if(Object.keys(selectableFieldNames).indexOf(value) > -1){
      var newSelectField = $("<select class='form-control' name='search' />");
      var html = ""
      for(var p in selectableFieldNames[value]){
        if(selectableFieldNames[value].hasOwnProperty(p)){
          var field = selectableFieldNames[value][p];
          html += "<option value='" + $('<div/>').text(p).html() + "' " + (p === searchVal ? "selected='selected'" : "") + ">" + $('<div/>').text(p.toLowerCase().ucFirst()).html() + "</option>"
        }
      }
      newSelectField.html(html)
      searchParentComponent.append(newSelectField)
    } else {
      var newTextField = $("<input class='form-control' name='search' />")
      if(!byUser){
        newTextField.val(searchVal)
      }
      searchParentComponent.append(newTextField)
    }
  }

  $("[name='field']").on("change", function (e) {
    e.preventDefault();
    setSearchField($(this).val(), true)
  })

  setSearchField($("[name='field']").val(), false);








})
