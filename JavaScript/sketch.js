var Engine = Matter.Engine,
    // Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

var engine;
var world;
var boxes = [];

var center;
var ball;
var gravityPull = 0.000012;
var sketchSize = window.innerWidth * window.innerHeight / 12;
var currentDay = 0;

function setup() {
    createCanvas(window.innerWidth - 2, window.innerHeight - 4);
    engine = Engine.create();

    world = engine.world;

    world.gravity.x = 0;
    world.gravity.y = 0;
    world.gravity.isPoint = true;


    var options = {
        isStatic: true,
        friction: 1,
        restitution: 0,
        width: width,
        height: height
    };
    // center = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2, 100, 100, options);

    // World.add(world, center);
}

var weights = [0.01, 0.015, 0.06, 0.1, 0.15, 0.05, 0.06, 0.02, 0.01, 0.075]
var words = ["JavaScript", "EinSehrLangesWort", "Marburg", "Waoh", "Jakob", "Sonne", "Studium", "Hallo", "Python"]
var weightCounter = 0
var wordCounter = 0

function mousePressed() {
    boxes.push(new Word(mouseX, mouseY, words[wordCounter], weights[weightCounter]));
    weightCounter = (weightCounter + 1) % weights.length;
    wordCounter = (wordCounter + 1) % words.length;
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        boxes[0].increaseWeight(0.02);
    }
    else if (keyCode === DOWN_ARROW) {
        boxes[0].decreaseWeight(0.02);
    }
    // k
    else if (keyCode == 75) {
        console.log(data['days'][0]);
        var words = data['days'][0]['words'];
        var weights = data['days'][0]['weights'];
        createWords(words, weights, mouseX, mouseY);
    }
    // l
    else if (keyCode == 76) {
        const index = 0;
        boxes[index].deleteWord();
        boxes.splice(0, 1);
    }
    // n
    else if (keyCode == 78) {
        currentDay = (currentDay + 1)
        skipToDay(currentDay);
    }
}

function preload() {
    data = loadJSON("visual_data.json");
}

function draw() {
    // Hintergrund füllen
    background(29);

    Engine.update(engine);

    for (var i = 0; i < boxes.length; i++) {
        Body.applyForce(boxes[i].body, boxes[i].body.position, {
            x: (window.innerWidth / 2 - boxes[i].body.position.x) * gravityPull,
            y: (window.innerHeight / 2 - boxes[i].body.position.y) * gravityPull
        });
        boxes[i].show();
    }
}

function skipToDay(day) {
    newData = data[day]
    currentWords = new Array(boxes.length);

    // fill word array
    for (var j = 0; j < boxes.length; j++) {
        currentWords[j] = boxes[j].t
    }

    console.log(newData)
    // iterate  current boxes
    for (var j = 0; j < boxes.length; j++) {
        
        // if the word is already present in the word cloud -> ignore
        console.log(newData['words'].includes(boxes[j].t))
        if (newData['words'].includes(boxes[j].t)) {
            continue
        }
        
        // if the word is in boxes array but not in newData
        // -> Remove word from boxes
        else {
            // Remove physics
            boxes[j].deleteWord();
            // Remove redering
            boxes.splice(j, 1);
            // Remove from currentWords
            currentWords.splice(j, 1);
            // adjust pointer
            j -= 1;
        }
    }
    // iterate words
    for (var i = 0; i < newData['words'].length; i++) {

        // only add new word, if its not already present
        // otherwise update the weight
        if (currentWords.indexOf(newData['words'][i]) >= 0) {
            boxes[currentWords.indexOf(newData['words'][i])].updateWeight(newData['weights'][i]);
        } else {
            let r = 375
            let phi = random(0,2*Math.PI)
            console.log(phi)
            x = window.innerWidth/2 - 1.5 * r * cos(phi)
            y = window.innerHeight/2 + 1 * r * sin(phi)
            boxes.push(new Word(x, y, newData['words'][i], newData['weights'][i]));
        }
    }
}

async function createWords(words, weights, posX, posY) {
    for (var i = 0; i < words.length; i++) {
        boxes.push(new Word(mouseX, mouseY, words[i], weights[i]));
        await sleep(300);
    }
}

// Sleep Function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}