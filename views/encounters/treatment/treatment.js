
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