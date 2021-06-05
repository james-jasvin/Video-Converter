/**
	* Client-side Validation (criteria explained in function comments)
	* @param {Node} uploadBtn: Reference to the file upload button on home.html
	* @param {String} fileFormatSelected: File format selected by the user for video conversion in dropdown list
	* @return {Boolean} : Returns true if Client validation passed, else returns false
*/
function checkFileUpload(uploadBtn, fileFormatSelected) {

	var errorMessageText = "No file uploaded";

	// 1. Check whether file is uploaded or not
	if (uploadBtn.files.length == 1) {
		// Split filename with delimiter "." to get filename and extension
		var fileNameArray = uploadBtn.files[0].name.split('.');

		// Prepend "." as checking is more convenient that way
		var uploadedFileFormat = "." + fileNameArray[fileNameArray.length - 1];

		var supportedFileFormatsArray = ['.mp4', '.mkv', '.flv', '.webm', '.wmv'];

		// 2. Are format to convert to and uploaded file format, the same?
		if (uploadedFileFormat == fileFormatSelected)
			errorMessageText = "File format to convert to should be different than uploaded file format";

		// 3. Is uploaded file of supported format?
		else if (!supportedFileFormatsArray.includes(uploadedFileFormat))
			errorMessageText = "The uploaded file format is not supported";

		// 4. Is file size less than 10MB?
		// 10MB = 10485760 Bytes
		else if (uploadBtn.files[0].size > 10485760)
			errorMessageText = "The uploaded file size should be less than 10MB";

		// Passed all checks and can now be sent to server
		else {
			// Turn on the loading screen spinners
			var loaders = document.getElementById("loading");
			loaders.style.display = 'block';
			return true;
		}
	}
	console.log(errorMessageText);

	// Did not pass check, so show the errorMessageDiv and do not allow form to be submitted
	showErrorDiv(errorMessageText);
	return false;
}

/**
	* Displays the Client Side Error Message Div which is triggered when Client Validation fails
	* @param {String} errorMessageText: Text that will be shown as part of error message
*/
function showErrorDiv(errorMessageText) {
	// Set text property of "span" tag element nested within the errorMessageClient div with errorMessageText
	$("#errorMessageClient").find("span").text(errorMessageText);

	// Unhide the "small" tag element nested within the errorMessageClient div
	$("#errorMessageClient").find("small").show();
}

/*
	* When page is loaded as well as when user backspaces into home page,
	* hide the client-side error message ("small" tag) and reset form data
*/
function clearPage() {
	$("#errorMessageClient").find("small").hide();
	$("#uploadForm").trigger("reset");
}

/* 
	* All individual scripts (non-functions) are added under this JQuery document.ready() function 
	* so that all the scripts will start executing only when the page actually loads
	* and it will be able to find all the document elements (by id, name, etc.), 
	* otherwise the script will not find reference to some of the elements and so will not run
*/
$(document).ready(function() {

	/*
		* typed.js script that shows up on home page with fancy text animation on header text
		* How it works is pretty straightforward
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

	// These scripts are associated with only home page, so that is why we added class "homePage" to body tag 
	// of home.html and then check it here in order to ensure which page this is
	if ($("body").hasClass("homePage")) {
		// If user is on home page but URL bar shows "jobs" or anything else
		// because of unauthorized access by user to "jobs" endpoint without submitting form
		// then redirect user to home with Unauthorized access error code (105)

		var location = window.location.href.split('/');
		var currentLocation = location[location.length - 1];
		if (currentLocation == "jobs")
			window.location.replace("../105");

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


		/*
			* Onsubmit event handler on the form which does the following actions,
			* 1. Prevents the form from being submitted via HTML
			* 2. Collects all the user submitted data in the form using the FormData() object
			* 3. Calls client-validation function to check whether client data passes tests or not.
			* 4. If validation passed, hide the error message div elements
			* 5. Submit the FormData() to the "jobs" route using an AJAX request which will start the Redis job
			* 6. Once AJAX request is successfully completed, the polling function is called which will ask for submitted job status
			
			* @returns: false, if client validation fails
		*/

		var form = document.getElementById("uploadForm");
		form.onsubmit = function(event) {
			event.preventDefault();

			var uploadBtn = document.getElementById("uploadButton");
			var fileFormatSelected = document.getElementById("fileFormatSelect").value;
			var presetSelected = document.getElementById("presetSelect").value;

			/*
				When Convert Button is clicked, hide both error messages (client and server)
				But do not hide the div, instead hide the "small" tag that's nested within the div
				which contains the actual error message as well as the close icon
				Note: Hide Client Side error message only when Client side validation is actually passed by submission.
				That's why its placed after validation call.
			*/
			$("#errorMessageServer").find("small").hide();

			if (checkFileUpload(uploadBtn, fileFormatSelected) === false)
				return false;

			$("#errorMessageClient").find("small").hide();

			var formData = new FormData();
			formData.append('fileFormatSelect', fileFormatSelected);
			formData.append('presetSelect', presetSelected);
			formData.append('file', uploadBtn.files[0], uploadBtn.files[0].name);

			// Send AJAX POST request with formData to jobs route, processData and contentType are required for file uploads with 
			// AJAX requests, otherwise it fails
			$.ajax({
				url: '/jobs',
				data: formData,
				method: 'POST',
				processData: false,
				contentType: false
			})
			.done((res) => {
				// If response has status as fail then it means server-side validation failed, so redirect
				// to home page with given error_code
				if (res['status'] === "fail") {
					var error_code = res['error_code'];
					window.location.replace('../home/' + error_code);
				}
				else {
					console.log("Calling Poller");
					getJobStatus(res['job_id']);
				}

			})
			.fail((err) => {
				console.log("Failed form submission");
				console.log(err);
			});
		}
	}
});


/**
	* Poller function that asks for job status of given job every 2 seconds via an AJAX GET request to "jobs/job_id" route
	* If job has finished execution, i.e., jobStatus = finished, then, acquire output video filename 
	* which is part of the response_object and send client to downloads page where video can be downloaded
	* @param {String} jobId: Job ID of job to keep track of
	* @return {Boolean} : Returns false as a placeholder value to prevent polling when job is completed or failed
*/
function getJobStatus(jobID) {
	$.ajax({
		url: `/jobs/${jobID}`,
		method: 'GET'
	})
	.done((res) => {
		var jobStatus = res['data']['job_status'];

		if (jobStatus === 'finished') {
			var outputFilename = res['data']['job_result']['filename'];
			window.location.href = '../downloads/' + outputFilename;
			return false;
		}
		else if (jobStatus === 'failed') {
			return false;
		}

		// This means that job has neither failed nor finished, so continue polling
		// Call poller function every 2 seconds (2000 ms)
		setTimeout(function() {
		  getJobStatus(res['data']['job_id']);
		}, 2000);
	})
	.fail((err) => {
		console.log(err);
	});
}

