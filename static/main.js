
// Client-side Validation
function checkFileUpload() {
	const uploadBtn = document.getElementById('uploadButton');

	// 1. Check whether file is uploaded or not
	if (uploadBtn.files.length == 1) {

		fileNameArray = uploadBtn.files[0].name.split('.');
		// Prepend "." as checking is more convenient that way
		uploadedFileFormat = "." + fileNameArray[fileNameArray.length - 1];

		// Get the file format to convert to from the Dropdown in the form
		const fileFormatSelect = document.getElementById('fileFormatSelect').options;
		const fileFormatSelected = fileFormatSelect[fileFormatSelect.selectedIndex].innerText;

		supportedFileFormatsArray = ['.mp4', '.avi', '.mkv', '.flv', '.webm', '.wmv'];

		errorMessageText = "";

		// 2. Are format to convert to and uploaded file format, the same?
		if (uploadedFileFormat == fileFormatSelected)
			errorMessageText = "File format to convert to should be different than uploaded file format";

		// 3. Is uploaded file of supported format?
		else if (!supportedFileFormatsArray.includes(uploadedFileFormat))
			errorMessageText = "The uploaded file format is not supported";

		// Passed all checks and can now be sent to server
		else {
			loaders = document.getElementById("loading");
			loaders.style.display = 'block';
			return true;
		}

		// Did not pass check, so show the errorMessageDiv and do not allow form to be submitted
		showErrorDiv(errorMessageText);
		return false;
	}
	
	errorMessageText = "No file uploaded";
	showErrorDiv(errorMessageText)

	return false;
}

function showErrorDiv(errorMessageText) {
	// Set text property of "span" tag element nested within the errorMessageClient div with errorMessageText
	$("#errorMessageClient").find("span").text(errorMessageText);

	// Unhide the "small" tag element nested within the errorMessageClient div
	$("#errorMessageClient").find("small").show();
}

/*
	When page is loaded as well as when user backspaces into home page,
	Hide the client-side error message ("small" tag) and reset form data
*/
function clearPage() {
	$("#errorMessageClient").find("small").hide();
	$("#uploadForm").trigger("reset");
}

/* 
	All individual scripts (non-functions) are added under this JQuery document.ready() function 
	so that the <script src=" "> can be linked in <head> tag 
	but all the scripts will start executing only when the page actually loads
	and it will be able to find all the document elements (by id, name, etc.), 
	otherwise the script will not find reference and basically will not run
*/
$(document).ready(function() {

	/* 
		JavaScript that will update text of element with id="fileChosen" to be equal to the name of the file uploaded, 
		a feature that is provided by HTML by default but we hid it to make a better looking button
	*/
	const uploadBtn = document.getElementById('uploadButton');
	const fileChosenSpan = document.getElementById('fileChosen');

	uploadBtn.addEventListener('change', function(){
	  fileChosenSpan.innerHTML = "Your uploaded file is \"<i><b>" + this.files[0].name + "</b></i>\""
	});

	/* 
		Script for close button, when clicked, hide its parent element ("small" tag) with slideUp animation
	*/
	$(".close-button").click(function() {
		$(".close-button").parent().slideUp(1000);
	});	

	/*
		typed.js script that shows up on home page with fancy text animation on header text
		How it works is pretty straightforward
	*/
	if ($(".text-slider").length == 1) { 

		var typed_strings = "It is a Video Converter, It is Free to Use, Convert your Videos within seconds!, The Online Video Converter"

		var typed = new Typed(".text-slider", { 
			strings: typed_strings.split(", "), 
			typeSpeed: 30, 
			backDelay: 1000, 
			backSpeed: 30, 
		}); 
	}

	/*
		When Convert Button is clicked, hide both error messages (client and server)
		But do not hide the div, instead hide the "small" tag that's nested within the div
		which contains the actual error message as well as the close icon
	*/
	$("#convertButton").click(function() {
		$("#errorMessageClient").find("small").hide();
		$("#errorMessageServer").find("small").hide();
	});

});