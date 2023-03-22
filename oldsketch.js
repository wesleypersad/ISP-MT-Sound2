var mySound;
var playStopButton;
var jumpButton;
var sliderVolume;
var sliderRate;
var sliderPan;

var fft;

// for the 3 exercise files
let radio;

// paths of the 3 songs
let song1 = './sounds/Ex2_sound1.wav';
let song2 = './sounds/Ex2_sound2.wav';
let song3 = './sounds/Ex2_sound3.wav';

// sound objects of 3 songs
let mySound1;
let mySound2;
let mySound3;

// for using Meyda
var analyzer;
var circleSize;
var circleColour;
var spcenpos;

function preload() {
  soundFormats('wav', 'mp3');

  // make ready the 3 exercise files
  //mySound1 = loadSound(song1);
  //mySound2 = loadSound(song2);
  //mySound3 = loadSound(song3);

  //mySound = loadSound('./sounds/233709__x86cam__130bpm-32-beat-loop_v2');
  mySound = loadSound('./sounds/Kalte_Ohren_(_Remix_).mp3');
}

function setup() {
  createCanvas(400, 400);
  background(180);

  circleSize = 0;
  spcenpos = 0;
    
  playStopButton = createButton('play');
  playStopButton.position(200, 20);
  playStopButton.mousePressed(playStopSound);
  jumpButton = createButton('jump');
  jumpButton.position(250, 20);
  jumpButton.mousePressed(jumpSong);

  sliderVolume = createSlider(0, 1, 0.5, 0.01);
  sliderVolume.position(20,25);
  sliderRate = createSlider(-2, 2, 1, 0.01);
  sliderRate.position(20,70);
  sliderPan = createSlider(-1, 1, 0, 0.01);
  sliderPan.position(20,115);
  
  fft = new p5.FFT(0.2, 2048);

  // create Meyda analyser
  if (typeof Meyda === "undefined") {
    console.log("Meyda could not be found");
  } else {
    console.log("Meyda could be found");
    analyzer = Meyda.createMeydaAnalyzer({
      "audioContext": getAudioContext(),
      "source": mySound,
      "bufferSize": 512,
      "featureExtractors": ["rms", "zcr","spectralCentroid","amplitudeSpectrum"],
      "callback" : features => {
        //console.log(features);
        console.log(features.spectralCentroid);
        circleSize = features.rms*1000;
        //circleSize = Math.pow(features.rms*6, 13);
        circleColour  = features.zcr;
        spcenpos = map(features.spectralCentroid, 0, 256, 0, width);
        //console.log(features.amplitudeSpectrum.length);
      }
    });
  }

  // create and display radio selection
  //text('select sound :', 50, 180);
  radio = createRadio();
  radio.position(20,200);
  radio.option('Sound 1');
  //text(song1, 50, 210);
  radio.option('Sound 2');
  //text(song2, 50, 250);
  radio.option('Sound 3');
  //text(song3, 50, 290);
  radio.style('width', '60px');
  radio.selected('Sound 1');
}

function draw() {
  background(180, 100);

  fill(0);
  text('volume', 80,20);
  text('rate', 80,65);
  text('pan', 80,110);  
  
  let vol = Math.pow(sliderVolume.value(), 3);
  //console.log(vol);                  
  mySound.setVolume(vol);
  mySound.rate(sliderRate.value());
  mySound.pan(sliderPan.value());
    
  let spectrum = fft.analyze();
  //console.log(spectrum.length);
  
  push();
  translate(200,50);
  scale(0.45, 0.25);
  noStroke();
  fill(60);
  rect(0, 0, width, height);
  fill(255, 0, 0);
  for (let i = 0; i< spectrum.length; i++){
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, h);
  }
  // draw a yellow dot for spectural centroid
  // sc will be scaled
  fill(255, 255, 0);
  rect(spcenpos, height, 10, 10);
  pop();
    
  /* fill(30, 30, 255, 200);
  let treble = fft.getEnergy("treble");
  let lowMid = fft.getEnergy("lowMid");
  let mid = fft.getEnergy("mid");
  let highMid = fft.getEnergy("highMid");
  arc(200, 275, treble, treble, 0, HALF_PI);
  fill(100, 55, 255, 200);
  arc(200, 275, lowMid, lowMid, HALF_PI, PI);
  fill(55, 100, 255, 200);
  arc(200, 275, mid, mid, PI, PI+HALF_PI);
  fill(130, 130, 255, 200);
  arc(200, 275, highMid, highMid, PI+HALF_PI, 2*PI); */

  // daw a circle whose size depends on rms
  fill(circleColour, 30, 255);
  circle(200, 275, circleSize);

  // select sound to play
  //selectSong();
}

function jumpSong() {
  var dur = mySound.duration();
  var t = random(dur);
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

function selectSong() {
  // set mySound depending from radio value
  let val = radio.value();

  if (val == 'Sound 1') {
      //fileName = song1;
      mySound = mySound1;
  } else if (val == 'Sound 2') {
      //fileName = song2;
      mySound = mySound2;
  } else if (val == 'Sound 3') {
      //fileName = song3;
      mySound = mySound3;
  }
}