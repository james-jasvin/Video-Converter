
// Client-side Validation
function checkFileUpload(uploadBtn, fileFormatSelected) {

	var errorMessageText = "";

	// 1. Check whether file is uploaded or not
	if (uploadBtn.files.length == 1) {

		var fileNameArray = uploadBtn.files[0].name.split('.');
		// Prepend "." as checking is more convenient that way
		var uploadedFileFormat = "." + fileNameArray[fileNameArray.length - 1];

		var supportedFileFormatsArray = ['.mp4', '.avi', '.mkv', '.flv', '.webm', '.wmv'];

		// 2. Are format to convert to and uploaded file format, the same?
		if (uploadedFileFormat == fileFormatSelected)
			errorMessageText = "File format to convert to should be different than uploaded file format";

		// 3. Is uploaded file of supported format?
		else if (!supportedFileFormatsArray.includes(uploadedFileFormat))
			errorMessageText = "The uploaded file format is not supported";

		// Passed all checks and can now be sent to server
		else {
			var loaders = document.getElementById("loading");
			loaders.style.display = 'block';
			return true;
		}

		console.log(errorMessageText);
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


	if ($("body").hasClass("homePage")) {

		/* 
			JavaScript that will update text of element with id="fileChosen" to be equal to the name of the file uploaded, 
			a feature that is provided by HTML by default but we hid it to make a better looking button
		*/
		var uploadBtn = document.getElementById('uploadButton');
		var fileChosenSpan = document.getElementById('fileChosen');

		uploadBtn.addEventListener('change', function(){
		  fileChosenSpan.innerHTML = "Your uploaded file is \"<i><b>" + this.files[0].name + "</b></i>\""
		});

		/* 
			Script for close button, when clicked, hide its parent element ("small" tag) with slideUp animation
		*/
		$(".close-button").click(function() {
			$(".close-button").parent().slideUp(1000);
		});	

		// When convert button is clicked, call client validation, if passed then post data to results route and
		// also hide the error messages and then call the poller function
		$("#convertButton").on('click', function() {

			var uploadBtn = document.getElementById("uploadButton");
			var fileFormatSelected = document.getElementById("fileFormatSelect").value;

			if (checkFileUpload(uploadBtn, fileFormatSelected) === false)
				return false;


			/*
				When Convert Button is clicked, hide both error messages (client and server)
				But do not hide the div, instead hide the "small" tag that's nested within the div
				which contains the actual error message as well as the close icon
			*/
			$("#errorMessageClient").find("small").hide();
			$("#errorMessageServer").find("small").hide();

			var formData = new FormData();
			formData.append('fileFormatSelect', fileFormatSelected);
			formData.append('file', uploadBtn.files[0]);

			$.ajax({
				url: '/results',
				data: formData,
				method: 'POST',
				processData: false,
				contentType: false
			})
			.done((res) => {
				console.log("Submitted Form Data")
			})
			.fail((err) => {
				console.log("Failed form submission");
				console.log(err);
			});

		});

	}

});