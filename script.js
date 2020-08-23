const video = document.querySelector("#video");

const startVideo = () => {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.oGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { video: true },
      (stream) => {
        video.srcObject = stream;
      },
      (err) => {
        alert("You must allow your camera to use this app");
      }
    );
  }
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);
startVideo();

video.addEventListener("play", (e) => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const { width, height } = video;

  const displaySize = { width, height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    // .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, width, height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    // resizedDetections.forEach((detect) => {
    //   const box = detect.detection.box;
    //   const drawBox = new faceapi.draw.DrawBox(box, {
    //     label: Math.round(detect.age) + " year old, " + detect.gender,
    //   });

    //   drawBox.draw(canvas);
    // });
  }, 100);
});
