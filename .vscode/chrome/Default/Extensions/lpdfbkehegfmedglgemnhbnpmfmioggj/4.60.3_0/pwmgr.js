/*************************************************************** 
* declare global variables which will be used in multiple functions
*
***************************************************************/
var g_nPWDFieldCount = new Number();
var g_arrPWDFieldNames = new Array();
var g_arrPWDFieldValues = new Array();
var g_arrPWDFieldElements = new Array(); // this element array point to the elements, and dynamically reflect its real value

var g_nTextFieldCount = new Number();
var g_arrTextFieldNames = new Array();
var g_arrTextFieldValues = new Array();
var g_arrTextFieldElements = new Array(); // this element array point to the elements, and dynamically reflect its real value

var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';

function isElementDisplayNone(elem) {
    try {
        if (typeof (elem) != "undefine" && elem) {
            var style = document.defaultView.getComputedStyle(elem, null);
            if (style.display == "none") {
                return true;
            } else {
                return this.isElementDisplayNone(elem.parentElement);
            }
        }
    } catch (e) {
    }

    return false;
}

/***************************************************************************************
*   retrieve password field names and values 
*   global variables will be set.
*   return: void
****************************************************************************************/
function getPasswordFields(bInputEnteredCount) {
    g_nPWDFieldCount = 0;

    for (var formCount = 0; formCount < document.forms.length; ++formCount) {
        var formObj = document.forms[formCount];

        for (var elementCount = 0; elementCount < formObj.elements.length; ++elementCount) {
            if (formObj.elements[elementCount].tagName == "INPUT") {
                if (formObj.elements[elementCount].type.match(/pass/i)
				|| (formObj.elements[elementCount].type.match(/text/i) && (formObj.elements[elementCount].name.match(/pass|pw/i) || formObj.elements[elementCount].id.match(/pass|pw/i)))) {
                    /*if (isElementDisplayNone(formObj.elements[elementCount])) {
                        continue;
                    }*/

                    if (bInputEnteredCount) {
                        if ("" == formObj.elements[elementCount].value) {
                            continue;
                        }
                    }

                    if ("" != formObj.elements[elementCount].name) {
                        g_arrPWDFieldNames[g_nPWDFieldCount] = formObj.elements[elementCount].name;
                    }
                    else // if("" != formObj.elements[elementCount].id)
                    {
                        g_arrPWDFieldNames[g_nPWDFieldCount] = formObj.elements[elementCount].id;
                    }

                    g_arrPWDFieldValues[g_nPWDFieldCount] = formObj.elements[elementCount].value;
                    g_arrPWDFieldElements[g_nPWDFieldCount] = formObj.elements[elementCount];
                    ++g_nPWDFieldCount;
                }
            }
        }
    }
}


/*****************************************************************************
*   retrieve Text field names and values 
*   global variables will be set.
*   return: void
******************************************************************************/
function getTextFields(bInputEnteredCount) {
    g_nTextFieldCount = 0;
    for (var xx = 0; xx < document.forms.length; ++xx) {
        var frmTarget = document.forms[xx];
        // try to search form's elements
        for (var xxx = 0; xxx < frmTarget.elements.length; ++xxx) {
            if (frmTarget.elements[xxx].tagName == "INPUT") {
                // text field
                if (frmTarget.elements[xxx].type.match(/text|email/i)) {
                    /*if (isElementDisplayNone(frmTarget.elements[xxx])) {
                        continue;
                    }*/
                    if (frmTarget.elements[xxx].name.match(/verifycode/) ||
                        frmTarget.elements[xxx].id.match(/verifycode/)) {
                        continue;
                    }
                    if (bInputEnteredCount) {
                        if ("" == frmTarget.elements[xxx].value)
                            continue;
                    }
                    if ("" != frmTarget.elements[xxx].name) {
                        g_arrTextFieldNames[g_nTextFieldCount] = frmTarget.elements[xxx].name;
                    }
                    else {
                        g_arrTextFieldNames[g_nTextFieldCount] = frmTarget.elements[xxx].id;
                    }
                    g_arrTextFieldValues[g_nTextFieldCount] = frmTarget.elements[xxx].value;
                    ++g_nTextFieldCount;
                }

            }
        }
    }//for(var xx = 0; xx < document.forms.length; ++xx)
}


function fillInFields(
                        autoSubmit,
                        pwFieldCount,
                        pwFieldNames,
                        pwFieldValues,
                        textFieldCount,
                        textFieldNames,
                        textFieldValues) {
    var textFieldsMatched = 0;
    var pwFieldsMatched = 0;

    var FormSubmited = new Array;

    for (var xx = 0; xx < document.forms.length; ++xx) {
        var frmTarget = document.forms[xx];
        // try to search form's elements
        for (var xxx = 0; xxx < frmTarget.elements.length; ++xxx) {
            if (frmTarget.elements[xxx].tagName == "INPUT") {
                //pw field
                if (frmTarget.elements[xxx].type.match(/pass/i) ||
                    (frmTarget.elements[xxx].type.match(/text/i) &&
                        (frmTarget.elements[xxx].name.match(/pass|pw/i) ||
                          frmTarget.elements[xxx].id.match(/pass|pw/i)
                         )
                     )
                   ) {
                    for (var y = 0; y < pwFieldCount; y++) {
                        if ((frmTarget.elements[xxx].name == pwFieldNames[y]) || (frmTarget.elements[xxx].id == pwFieldNames[y])) {
                            FormSubmited[FormSubmited.length] = frmTarget;

                            pwFieldsMatched++;
                            frmTarget.elements[xxx].value = pwFieldValues[y];
                        }
                    }
                }
                    // text field
                else if (frmTarget.elements[xxx].type.match(/text|email/i)) {
                    for (var y = 0; y < textFieldCount; y++) {
                        if (frmTarget.elements[xxx].name == textFieldNames[y] || frmTarget.elements[xxx].id == textFieldNames[y]) {
                            textFieldsMatched++;
                            frmTarget.elements[xxx].value = textFieldValues[y];
                        }
                    }
                }
            }
        }
    }
    if (pwFieldsMatched == pwFieldCount &&
            textFieldsMatched == textFieldCount) {
        if (autoSubmit) {
            for (var nIndex = 0; nIndex < FormSubmited.length; ++nIndex)
                FormSubmited[nIndex].submit();
            //frmTarget.submit();
        }
    }
    return;
}




function parseDocument() {
    getPasswordFields(false);

    if (g_nPWDFieldCount > 0) {// there's password field count(s)	
        chrome[runtimeOrExtension].sendMessage({
            command: "loadBrowserRecord",
            url: document.URL,
            title: document.title
        },   // first parameter
         function (response)      // callback function
         {
             if (response.PwdFieldCount > 0) {
                 fillInFields(
                         response.AutoSumbit,
                         response.PwdFieldCount,
                         response.PWDFields,
                         response.PWDValues,
                         response.TextFieldCount,
                         response.TextFields,
                         response.TextValues);
             }
             else {// no records

             }

             //  document.getElementById()
         }
                                    ); // sendRequest
    }
    else {// do nothing

    }//if(allPasswordFieldCount > 0)
}


function onSubmit() {
    // refresh the text and pwd fields
    getPasswordFields(true);
    getTextFields(true);


    if (g_nPWDFieldCount > 0) {
        chrome[runtimeOrExtension].sendMessage({
            command: "createBrowserRecord",
            url: document.URL,
            title: document.title,
            PWDFieldCount: g_nPWDFieldCount,
            PWDFieldNames: g_arrPWDFieldNames,
            PWDFieldValues: g_arrPWDFieldValues,
            TextFieldCount: g_nTextFieldCount,
            TextFieldNames: g_arrTextFieldNames,
            TextFieldValues: g_arrTextFieldValues
        },   // first parameter
        function (response)      // callback function
        {
        });
    }
}

function handleWindowClick(event) {
    var origEl = event.target;
    var tag = origEl.tagName;

    var bContinue = false;

    if (tag == "INPUT" || tag == "BUTTON" || tag == "IMG" || tag == "A" || tag == "DIV" || tag == "SPAN") {
        bContinue = true;
    }

    if (bContinue) {
        var type = origEl.type;
        var keyCode = event.which;
		if(typeof(type) == "undefined"){
			bContinue = false;
		}
		
        if (bContinue && (type == "submit" || type == "reset" || type == "radio" || type == "checkbox" || type == "text" || type == "password"
        || type == "email" || type == "date" || type == "tel" || type == "search")
          && keyCode != 13) {
            bContinue = false;
        }

        if (bContinue)
            onSubmit();
    }
}

/******************** end of definitions***********************/



/******************************************************************
*   content script begins to work
*
******************************************************************/

setTimeout("parseDocument()", 500);

window.addEventListener("submit", onSubmit, true);
window.addEventListener("click", function (event) {
    handleWindowClick(event);
}, false);







