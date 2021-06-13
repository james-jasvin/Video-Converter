# Video-Converter-420

Web-app Link: https://video-converter-420.herokuapp.com/

Article Links: 
<a href="https://jasvin-manjaly.medium.com/integrating-redis-task-queue-with-flask-app-and-deployment-to-heroku-6f3e84f79978?source=friends_link&sk=ba3a292920c728d2cdacb03b30bd1405">Integrating Redis Task Queue with Flask App and Deployment to Heroku</a>
<br>
REALLY LONG ARTICLE ALERT!!! <br>
I describe the whole process of making the web-app in this article except for the basic steps of making a Flask web-app.

<a href="https://jasvin-manjaly.medium.com/fix-the-30-second-timeout-error-on-heroku-25755ffbca95?source=friends_link&sk=203e21eaafbd5d05c731234b0d9d7077">Fix the 30 Second Timeout Error on Heroku </a><br>
In this article I have given a standard template for Flask web-apps to avoid the 30 second timeout error on Heroku using Redis Task Queues.

# What it is?
A Flask web-app that uses the moviepy library to convert user uploaded videos from one format to another.

Supported formats include, mkv, mp4, flv, wmv, webm. "avi" was also supported before but it was taking too much time even on local deploy, let alone on a Heroku free dyno.

Do note that converting videos on the web-app will still take quite some time, definitely have to give it a few minutes because the video format uploaded and selected for conversion dictate how long the whole process will take.
A max cap of 10MB is placed on the video uploaded to prevent large files from being stored on the server.

# What is being used?
The web-app is built on Python Flask and uses moviepy for video conversion. The task of video conversion is given to a background worker with the help of Redis Task Queues.
This is done to prevent Client-Server communication to remain idle for the entire video conversion process resulting in a connection timeout error, 
typically known as the 30 second timeout error on Heroku. This is bypassed by the Client polling the Server every 2 seconds to check video conversion job status
until the job is finished in which case, the Client is redirected to results page with the download video button. 
This polling and Client-side requesting is done with the help of AJAX requests.

If there's any mistake that I might have made or some aspect that I could have improved on then do let me know as it will help me out a lot!
