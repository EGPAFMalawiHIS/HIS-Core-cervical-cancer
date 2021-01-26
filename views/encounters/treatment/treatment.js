
var tt_cancel_destination = "/views/patient_dashboard.html?patient_id=" + sessionStorage.patientID;



function showPostponedReason() {
  let select_treatment = $('select_treatment').value;
  return (select_treatment == 'Postponed treatment' ? true :  false);
}

function showReferralReason() {
  let select_treatment = $('select_treatment').value;
  return (select_treatment == 'Referral' ? true :  false);
}

function changeNextButton(){
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  let nextBTN = $('nextButton');
  nextBTN.setAttribute("onmousedown", "createEncounter();");
  nextBTN.innerHTML = "<span>Finish</span>";
}

function addOtherOptionsWait() {
  let inputFrame = $('inputFrame' +  tstCurrentPage);
  inputFrame.style = "width: 95.5%;";
  setTimeout(addOtherOptions(), 500);
}

function addOtherOptions() {
  let options = $('tt_currentUnorderedListOptions').getElementsByTagName('li');

  for(let i = 0; i < options.length; i++){
    options[i].setAttribute("onclick", "null; updateTouchscreenInputForSelect(this);changeBTNext(this);");
  }
}

function changeBTNext(e){
  let select_option = e.getAttribute('tstvalue');
  let nextBTN = $('nextButton');
  
  if(select_option ==  "Cryo" || select_option == 'Thermocoagulation'){
    nextBTN.setAttribute("onmousedown", "createEncounter();");
    nextBTN.innerHTML = "<span>Finish</span>";
  }else{
    nextBTN.setAttribute("onmousedown", "gotoNextPage();");
    nextBTN.innerHTML = "<span>Next</span>";
  }
}

function  createEncounter(){
  let selected_option = $('select_treatment').value;
  let params;
  if(selected_option == 'Cryo' || selected_option == 'Thermocoagulation'){
    params = {treatment: selected_option};
  }else if(selected_option == 'Postponed treatment'){
    if($('postponed_reason').value == ""){
      showMessage("Please select a valid reason");
      return;
    }

    params = {
      treatment: selected_option,
      reason: $('postponed_reason').value
    }
  }else if(selected_option == 'Referral'){
    if($('referred_location').value == ""){
      showMessage("Please select a valid location");
      return;
    }

    params = {
      treatment: selected_option,
      reason: $('referral_reason').value,
      referred_location: $('touchscreenInput' + tstCurrentPage).value
    }
  }else{
    showMessage("Please select a valid treatment option");
  }

  console.log(params);
}
