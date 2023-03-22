//
// ISP Midterm - Exercise 2
//
var mySound;
var playStopButton;
var jumpButton;
var sliderVolume;

// rectangles and frquency buckets
var numRect = 8;      // number of rectangles accross screen
var buckPerRect = 32; // number of buckets per rectagle

// for jump %
var jumpPos = 0;

// for using Meyda
var analyzer;
var circleSize;
var circleRed;
var spcenpos;
var meydaPowSpectrum = [];

// for speech recognition
var speechButton;
var listening = false;
var myRec;
var bgColor = [0, 0, 0];

function preload() {
  soundFormats('wav', 'mp3');

  // load the sound file and do not loop
  mySound = loadSound('./sounds/Kalte_Ohren_(_Remix_).mp3');
  mySound.setLoop(false);
}

function setup() {
  createCanvas(1200, 650);
  background(180);

  //define speech recognition object
  myRec = new p5.SpeechRec('en-US', parseResult); // new P5.SpeechRec object
	myRec.continuous = true; // do continuous recognition
	myRec.interimResults = true; // allow partial recognition (faster, less accurate)
  myRec.start();

  circleSize = 0;
  spcenpos = 0;

  // track controls
  playStopButton = createButton('play');
  playStopButton.position(250, 10);
  playStopButton.mousePressed(playStopSound);
  jumpButton = createButton('random jump');
  jumpButton.position(310, 10);
  jumpButton.mousePressed(jumpSong);

  sliderVolume = createSlider(0, 1, 0.5, 0.01);
  sliderVolume.position(20,15);

  // activate speech recognition
  speechButton = createButton('voice on');
  speechButton.position(510, 10);
  speechButton.mousePressed(enableVoice);

  // create Meyda analyser
  if (typeof Meyda === "undefined") {
    console.log("Meyda could not be found");
  } else {
    console.log("Meyda could be found");
    analyzer = Meyda.createMeydaAnalyzer({
      "audioContext": getAudioContext(),
      "source": mySound,
      "bufferSize": 512,
      "featureExtractors": ["rms", "zcr","spectralCentroid","amplitudeSpectrum","powerSpectrum"],
      "callback" : features => {
        // spectral centroid circle (SCC) size based on sound rms value
        circleSize = features.rms*1000;
        // set SCC position on width of screen based on position of SC
        spcenpos = map(features.spectralCentroid, 0, 255, 0, width);
        // get array [0 to 255] of power values
        meydaPowSpectrum = features.powerSpectrum;
        // set SCC fill colour red intensity based on power at centriod position
        circleRed  = meydaPowSpectrum[int(features.spectralCentroid)]*255;
      }
    });
  }
}

function draw() {
  //background(180, 400);
  background(bgColor);

  // sound controls
  fill(255);
  text(`volume ${sliderVolume.value()}`,170,25);

  let vol = sliderVolume.value();
  //console.log(vol);                  
  mySound.setVolume(vol);
  text(`jump time (%) ${jumpPos}`,410,25);

  // the buffersize is 256 i.e. there are 256 different frequency buckets
  // we can create 256 different rectangles, each representing a frequency bucket

  // However 256 bucket are difficult to represent on a screen 
  // Have 8 rectangles representing a groups of 32 frequency buckets i.e. 256
  for (let i=0; i < numRect; i++) {
    drawRectangle(i, meydaPowSpectrum);
  }

  // draw a circle at a position where the spectural centroid is and fill with red
  // intensity based on strength of spectural centroid
  push();
  fill(circleRed, 0, 0);
  noStroke();
  ellipse(spcenpos, height/2, circleSize, circleSize);
  pop();
}

function drawRectangle(i, meydaPowSpectrum) {
  // this draws the rectangle representing the frequency bucket
  push();
  translate(20 + i*150, 50);

  // there are 32 frequency buckets that make up each of the 8 rectangles
  // we can sum the values in these array elements
  let sumBuckets = 0;
  for (j=0; j< buckPerRect; j++) {
    let elementVal = isNaN(meydaPowSpectrum[i + j]) ? 0.0: meydaPowSpectrum[i + j];
    sumBuckets += elementVal;
  }
  //console.log(`sumBuckets= ${sumBuckets}`);

  let factor = sumBuckets % 2;
  scale(factor, factor);
  //noStroke();
  stroke(255 - 125*factor, 125*factor, 100);
  strokeWeight(2*factor);
  fill(125*factor, 255 - 125*factor, 100);
  rect(0, 0, 100, 300);
  pop();
}

function jumpSong() {
  var dur = mySound.duration();
  var t = random(dur);
  jumpPos = round(t*100/dur);
  mySound.jump(t);
}

function playStopSound() {
  if (mySound.isPlaying())
    {
      mySound.stop();
      analyzer.stop
      //mySound.pause();
      playStopButton.html('play');
      background(180);
    } else {
      //mySound.play();
      mySound.loop()   
      analyzer.start();
      playStopButton.html('stop');
    }  
}

function parseResult()
{
  // don't do anything if not listening
  if (!listening) return;
  // recognition system will often append words into phrases.
  // so hack here is to only use the last word:
  var mostrecentword = myRec.resultString.split(' ').pop();
  if(mostrecentword.indexOf("play")!==-1) { 
    mySound.loop()   
    analyzer.start();
    playStopButton.html('stop');
  }
  else if(mostrecentword.indexOf("stop")!==-1) { 
    mySound.stop();
    analyzer.stop
    //mySound.pause();
    playStopButton.html('play');
  }
  else if(mostrecentword.indexOf("more")!==-1) {
    // increment volume
    let vol = sliderVolume.value();
    vol = min(1, vol+0.1);
    sliderVolume.value(vol);
  }
  else if(mostrecentword.indexOf("less")!==-1) {
    // decrement volumn
    let vol = sliderVolume.value();
    vol = max(0, vol-0.1);
    sliderVolume.value(vol);
  }
  else if(mostrecentword.indexOf("jump")!==-1) {
    // jump to some random position
    jumpSong();
  }
  else if(mostrecentword.indexOf("black")!==-1) {
    bgColor = [0, 0, 0];
  }
  else if(mostrecentword.indexOf("white")!==-1) {
    bgColor = [255, 255, 255];
  }
  else if(mostrecentword.indexOf("blue")!==-1) {
    bgColor = [0, 0, 255];
  }
  else if(mostrecentword.indexOf("green")!==-1) {
    bgColor = [0, 255, 0];
  }
  console.log(mostrecentword);
}

function enableVoice() {
  if (!listening) {
    speechButton.html('voice off');
  } else {
    speechButton.html('voice on');
  }
  listening = !listening;
  console.log(`listening : ${listening}`);
}