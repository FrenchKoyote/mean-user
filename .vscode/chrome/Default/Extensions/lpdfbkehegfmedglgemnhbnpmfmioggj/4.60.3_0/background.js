
var bRet = document.all;
var PWMGRPlugObject = document.getElementById("objPlugin");
var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';
var port = null;

function Map(){
	var struct = function(key, value){
		this.key = key;
		this.value = value;
	}
	//push value at the back of array
	var push_back = function(key, value){
		for(var i=0; i<this.arr.length; i++){
			if(this.arr[i].key === key){
				this.arr[i].value = value;
				return;
			}
		}
		this.arr[this.arr.length] = new struct(key, value);
	}
	//get value by key.
	var get = function(key){
		for(var i=0; i<this.arr.length; i++){
			if(this.arr[i].key === key){
				return this.arr[i].value;
			}
		}
		return null;
	}
	//remove item by key
	var remove = function(key){
		var v;  
		for (var i = 0; i < this.arr.length; i++) {  
			v = this.arr.pop();  
			if ( v.key === key ) {  
				break;  
			}  
			this.arr.unshift(v);  
		} 
	}
	var size = function() {  
		return this.arr.length;  
	}; 
	
	this.arr = new Array();  
	this.get = get;  
	this.push_back = push_back;  
	this.remove = remove;  
	this.size = size;
}

var loadRecordResponseMap = new Map();
function onNativeMessage(message) {
	try{
		if(message.COMMAND == "LOAD_BROWSER_RECORD")
		{
			var webUrl = message.URL;
			var bRet = message.RETURN;
			var nPwdFieldCount = (bRet & 0x000000FF);

			var loadRecordResponse = loadRecordResponseMap.get(webUrl);
			if(loadRecordResponse == null || typeof(loadRecordResponse) == "undefined")
				return;
			
			if (0 == nPwdFieldCount) {
				loadRecordResponse({ PwdFieldCount: nPwdFieldCount });
			}
			else {
				var nTextFieldCount = (bRet & 0x00000FF00);
				nTextFieldCount >>= 8;

				var bAutoFill = (bRet & 0x0000F0000);
				bAutoFill >>= 16;

				var bAutoSumbit = (bRet & 0x000F00000);
				bAutoSumbit >>= 20;
				
				var pwFieldArray = message.PW_FIELD_ARRAY;
				var pwValueArray = message.PW_VALUE_ARRAY;
				var textFieldArray = message.TEXT_FIELD_ARRAY;
				var textValueArray = message.TEXT_VALUE_ARRAY;

				loadRecordResponse({ PwdFieldCount: nPwdFieldCount,
					TextFieldCount: nTextFieldCount,
					AutoFill: bAutoFill,
					AutoSumbit: bAutoSumbit,
					TextFields: textFieldArray,
					TextValues: textValueArray,
					PWDFields: pwFieldArray,
					PWDValues: pwValueArray
				});
				loadRecordResponseMap.remove(webUrl);
			}
		}
	}
	catch(err)
	{
	}
}

function onDisconnected() {
	port = null;
}

function connect() {
  try{
	  var hostName = "com.lenovo.pwdmgr";
	  port = chrome.runtime.connectNative(hostName);
	  port.onMessage.addListener(onNativeMessage);
	  port.onDisconnect.addListener(onDisconnected);
  }
  catch(err)
  {
  
  }
}

function parseStringToArray(jsonSource)
{
	try{
		var array = new Array();
		for(var i=0; i<jsonSource.length; i++)
		{
			array.push(jsonSource[i]);
		}
		return array;
	}
	catch(err)
	{
	}
}

chrome[runtimeOrExtension].onMessage.addListener(
    function (request, sender, sendResponse) {
		if(port == null)
		{
			connect();
		}
        if (request.command == "loadBrowserRecord") {
			message = {"COMMAND": "RESET"};
			port.postMessage(message);
			
			message = 
			{
				"COMMAND": "LOAD_BROWSER_RECORD",
				"SITE_URL": request.url,
				"SITE_TITLE": request.title,
			};
			loadRecordResponseMap.push_back(request.url,sendResponse);
			//loadRecordResponse = sendResponse;
			port.postMessage(message);
			//listener must return true if you want to send a response after the listener returns
			return true;
        }
        else if (request.command == "createBrowserRecord") {
			message = {"COMMAND": "RESET"};
			port.postMessage(message);
			
			message =
			{
				"COMMAND": "CREATE_BROWSER_RECORD",
				"SITE_URL": request.url,
				"SITE_TITLE": request.title,
				"PW_FIELDS": request.PWDFieldNames,
				"PW_VALUES": request.PWDFieldValues,
				"TEXT_FIELDS": request.TextFieldNames,
				"TEXT_VALUES": request.TextFieldValues
			}
			port.postMessage(message);
        }
        else {
            sendResponse({}); // snub them.
        }
    } // function
); // addListener