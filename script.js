/* Game opdracht
   Informatica - Emmauscollege Rotterdam
   Template voor een game in JavaScript met de p5 library

   Begin met dit template voor je game opdracht,
   voeg er je eigen code aan toe.
 */

/*
 * instellingen om foutcontrole van je code beter te maken 
 */
"use strict";

/* ********************************************* */
/* globale variabelen die je gebruikt in je game */
/* ********************************************* */
const SPELEN = 1;
const GAMEOVER = 2;
const UITLEG = 6;
var spelStatus = UITLEG;

// alle mogelijke actions van een speler
const idle = 0;
const PUNCH = 1;
const KICK = 2;
const HIGHKICK = 3;
var ryuAction = idle;
var kenAction = idle;

var spelerX = 250; // x-positie van speler Ryu
var spelerY = 600; // y-positie van speler Ryu
var vijandX = 1300; // x-positie van vijand Ken
var vijandY = 600; // y-positie van vijand Ken
var healthSpeler = 100;  // health van speler Ryu
var healthVijand = 100;  // health van vijand Ken
var hit;
var botsing;
var bg;

var ratio = 4; // vergrotings ratio van sprites
var gameFrame = 0; // Eerste frame van het spel
const staggerFrames = 30; // aantal frames om te vertragen
var actionFrameRyu = 0; // frame nummer op moment van actie van Ryu
var actionFrameKen = 0; // frame nummer op moment van actie van Ken

// Sprite objecten voor beide spelers met de locaties elke sprite in de sprite sheet per actie
const ryu =
{
    imagefilename: "ryu-spritesheet.png",
    idle: {
        loc: [
            { x: 7, y: 10, width: 60, height: 110 },
            { x: 94, y: 10, width: 60, height: 110 },
            { x: 184, y: 10, width: 60, height: 110 },
            { x: 280, y: 10, width: 60, height: 110 },
            { x: 367, y: 10, width: 60, height: 110 }
        ]
    },
    punch: {
        loc: [
            { x: 253, y: 269, width: 60, height: 94 },
            { x: 333, y: 268, width: 74, height: 95 },
            { x: 432, y: 268, width: 108, height: 94 }
        ]
    },
    kick: {
        loc: [
            { x: 12, y: 657, width: 60, height: 94 },
            { x: 95, y: 657, width: 48, height: 94 },
            { x: 167, y: 658, width: 80, height: 93 }
        ]
    },
    highkick: {
        loc: [
            { x: 600, y: 265, width: 90, height: 110 },
            { x: 680, y: 260, width: 90, height: 110 },
            { x: 775, y: 260, width: 120, height: 110 }
        ]
    }
}

const ken =
{
    imagefilename: "ken-spritesheet.png",
    idle: {
        loc: [
            { x: 1140, y: 20, width: 60, height: 100 },
            { x: 1206, y: 20, width: 60, height: 100 },
            { x: 1270, y: 20, width: 60, height: 100 },
            { x: 1335, y: 20, width: 60, height: 100 },
            { x: 1402, y: 20, width: 60, height: 100 },
            { x: 1470, y: 20, width: 60, height: 100 }
        ]
    },
    punch: {
        loc: [
            { x: 1268, y: 285, width: 95, height: 95 },
            { x: 1365, y: 285, width: 95, height: 95 }
        ]
    },
    kick: {
        loc: [
            { x: 1130, y: 420, width: 65, height: 95 },
            { x: 1200, y: 420, width: 65, height: 95 },
            { x: 1274, y: 420, width: 120, height: 95 },
            { x: 1395, y: 420, width: 70, height: 95 },
            { x: 1468, y: 420, width: 70, height: 95 }
        ]
    },
    highkick: {
        loc: [
            { x: 1130, y: 420, width: 65, height: 95 },
            { x: 1200, y: 420, width: 65, height: 95 },
            { x: 1274, y: 420, width: 120, height: 95 },
            { x: 1395, y: 420, width: 70, height: 95 },
            { x: 1468, y: 420, width: 70, height: 95 }
        ]
    }
}


/* ********************************************* */
/* functies die je gebruikt in je game           */
/* ********************************************* */

// Animeer Sprite functie: img is spritesheet, sprite_name is naam uit dx en dy is doelpositie, sw en sh is breedte en hoogte enkele sprite uit source image, n is aantal sprites in reeks, ratio is vergrotingsfactor van sprites
function animeer_sprite(img, sprite_name, sprite_action, dx, dy, ratio) {
    let maxframes = eval(sprite_name + '.' + sprite_action + '.loc.length') // length is het totaal aantal frames van een sprite action
    let frame = Math.floor(gameFrame / staggerFrames) % maxframes; // bepaal frame nummer met vertragingsfactor

    // eval wordt gebruikt om de samengestelde naam van het object bestaande uit de functie parameters sprite_name en sprite_action te evalueren. Zonder eval zal JavaScript niet weten wat de waarde van het object is.
    // Voorbeeld object: ken.punch.loc[0].x geeft de x coordinaat van sprite Ken met action punch van de eerste frame (0).
    let sx = eval(sprite_name + '.' + sprite_action + '.loc[frame].x'); // x-positie van frame
    let sy = eval(sprite_name + '.' + sprite_action + '.loc[frame].y'); // y-positie van frame
    let sw = eval(sprite_name + '.' + sprite_action + '.loc[frame].width'); // width van frame
    let sh = eval(sprite_name + '.' + sprite_action + '.loc[frame].height'); // height van frame
    image(img, dx, dy, sw * ratio, sh * ratio, sx, sy, sw, sh);
    gameFrame++; // verhoog gameFrame met 1
}

/**
 * Updatet globale variabelen met posities van speler, vijanden en kogels
 */
let snelheid_spelers = 5;
var beweegAlles = function() {
    // speler
    if (keyIsDown(65)) { // Left key A
        spelerX = spelerX - snelheid_spelers;
    }

    if (keyIsDown(68) && botsing === false) { // Right key D. Alleen lopen als er geen botsing is
        spelerX = spelerX + snelheid_spelers;
    }

    // vijand 
    if (keyIsDown(37) && botsing === false) { // Left arrow key. Alleen lopen als er geen botsing is
        vijandX = vijandX - snelheid_spelers;
    }

    if (keyIsDown(39)) { // Right arrow key
        vijandX = vijandX + snelheid_spelers;
    }

    // Ryu punch
    if (keyIsDown(81)) { // key Q
        ryuAction = PUNCH;
        actionFrameRyu = gameFrame;
    }

    // Ryu highkick
    if (keyIsDown(69)) { // key E
        ryuAction = HIGHKICK;
        actionFrameRyu = gameFrame;
    }

    // Ken punch
    if (keyIsDown(80)) { // key P
        kenAction = PUNCH;
        actionFrameKen = gameFrame;
    }

    // Ken highkick
    if (keyIsDown(79)) { // key O
        kenAction = HIGHKICK;
        actionFrameKen = gameFrame;
    }

    /*
    // Ryu en Ken niet laten lopen tijdens het aanvallen
    if (ryuAction != idle || kenAction != idle) {
        snelheid_spelers = 0;
    } else{
        snelheid_spelers = 5;
    } 
    */
};

/**
 * Checkt hits
 * Updatet globale variabelen punten en health
 */
var verwerkHits = function() {
    // Hits Ryu en Ken voor punch of highkick
    if (ryuAction === PUNCH && vijandX - spelerX < 350) {
        hit = true;
        healthVijand = healthVijand - 10; // Ken 10 damage als Ryu puncht
    } else if (ryuAction === HIGHKICK && vijandX - spelerX < 370) {
        hit = true;
        healthVijand = healthVijand - 20; // Ken 20 damage als Ryu highkickt
    } else if (kenAction === PUNCH && vijandX - spelerX < 350) {
        hit = true;
        healthSpeler = healthSpeler - 10; // Ryu 10 damage als Ken puncht
    } else if (kenAction === HIGHKICK && vijandX - spelerX < 370) {
        hit = true;
        healthSpeler = healthSpeler - 20; // Ryu 20 damage als Ken highkickt
    } else {
        hit = false;
    }

    if (hit === true) {
        spelerX = spelerX - 100;
        vijandX = vijandX + 100;
    }
};

/**
 * Checkt botsing tussen beide spelers
 */
var verwerkBotsing = function() {
    if (vijandX - spelerX < 250) {
        botsing = true;
    } else {
        botsing = false;
    }
};

/**
 * Tekent spelscherm
 */
var tekenAlles = function() {
    // achtergrond weergeven en verversen
    image(img_bg, 0, 0);

    // Animeer Ryu
    if (ryuAction === HIGHKICK) {
        animeer_sprite(img_speler, "ryu", "highkick", spelerX, spelerY, ratio) // animeer highkick frame
        if (gameFrame >= actionFrameRyu + ryu.highkick.loc.length * staggerFrames) { // alle frames zijn geweest, reset gameFrame
            ryuAction = idle;
        }
    } else if (ryuAction === PUNCH) {
        animeer_sprite(img_speler, "ryu", "punch", spelerX, spelerY, ratio) // animeer highkick frame
        if (gameFrame >= actionFrameRyu + ryu.punch.loc.length * staggerFrames) { // alle frames  geweest, reset gameFrame
            ryuAction = idle;
        }
    } else {
        animeer_sprite(img_speler, "ryu", "idle", spelerX, spelerY, ratio) // Ryu
    }
    
    // Animeer Ken
    if (kenAction === HIGHKICK) {
        animeer_sprite(img_vijand, "ken", "highkick", vijandX, vijandY, ratio) // Ken
        if (gameFrame >= actionFrameKen + ken.highkick.loc.length * staggerFrames) { // alle frames geweest,                 reset gameFrame
            kenAction = idle;
        }
    } else if (kenAction === PUNCH) {
        animeer_sprite(img_vijand, "ken", "punch", vijandX, vijandY, ratio) // Ken
        if (gameFrame >= actionFrameKen + ken.highkick.loc.length * staggerFrames) { // alle frames geweest, reset gameFrame
            kenAction = idle;
        }
    } else {
        animeer_sprite(img_vijand, "ken", "idle", vijandX, vijandY, ratio) // Ken
    }
    
    // punten en health
    if (healthSpeler <= 0 || healthVijand <= 0) {
        spelStatus = GAMEOVER;
    }

    // Achtergrond bar Ryu
    fill('black');
    rect(95, 195, 610, 70);

    // Achtergrond bar Ken
    fill('black');
    rect(1195, 195, 610, 70);

    // health bar Ryu
    var health_bar_width_ryu = healthSpeler * 6; // De grote van de balk is 600, omdat health = 100
    fill('red');
    rect(100, 200, health_bar_width_ryu, 60);

    // health bar Ken
    var health_bar_width_ken = healthVijand * 6; // De grote van de balk is 600, omdat health = 100
    fill('red');
    rect(1200, 200, health_bar_width_ken, 60);

};

var checkGameover = function() {
    // Check of HP 0 is
    return false;
}

/* ********************************************* */
/* setup() en draw() functies / hoofdprogramma   */
/* ********************************************* */

// Preload code in deze functie wordt één keer uitgevoerd voordat setup start
let img_bg;
let img_speler;
let img_vijand;
function preload() {
    img_bg = loadImage('arena.jpeg');
    img_speler = loadImage(ryu.imagefilename);
    img_vijand = loadImage(ken.imagefilename);
}

/**
 * setup
 * de code in deze functie wordt één keer uitgevoerd door
 * de p5 library, zodra het spel geladen is in de browser
 */
function setup() {
    frameRate(60);
    // Maak een canvas (rechthoek) waarin je je speelveld kunt tekenen
    createCanvas(1920, 1040);
    background('blue');
    image(img_bg, 0, 0); // Geef achtergrond weer
}

/**
 * draw
 * de code in deze functie wordt 50 keer per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */

function draw() {
    if (spelStatus === SPELEN) {
        beweegAlles();
        verwerkHits();
        verwerkBotsing();
        tekenAlles();
    }
    if (spelStatus === GAMEOVER) {
        // teken game-over scherm
        fill('#009966');
        textSize(120);
        if
        text('KNOCK OUT!', 560, 120);

        fill('#cadafb');
        textSize(80);
        text('PRESS SPACE TO START', 440, 480);
        if (keyIsDown(32)) {  // key SPATIE
            spelStatus = UITLEG;
        }
    }

    if (spelStatus === UITLEG) {
        // teken uitleg scherm
        image(img_bg, 0, 0, 1920, 1040);
        animeer_sprite(img_speler, "ryu", "idle", spelerX, spelerY, ratio) // Ryu
        animeer_sprite(img_vijand, "ken", "idle", vijandX, vijandY, ratio) // ken
        textSize(64);
        fill('yellow');
        text('PRESS V TO PLAY', 700, 80);

        fill('skyblue');
        textSize(40);
        text('Ryu: A=left and D=right', 240, 160);
        text('Ryu: Q=Punch and E=Highkick', 300, 240);
        text('Ken: Arrow left=left and Arrow right=right', 1140, 160);
        text('Ken: O=Punch and P=Highkick', 1080, 240);

        if (keyIsDown(86)) {  // key V
            spelerX = 250;
            vijandX = 1300;
            spelStatus = SPELEN;
            healthSpeler = 100;
            healthVijand = 100;
            gameFrame = 0;
            actionFrameKen = 0;
            actionFrameRyu = 0;
        }
    }
}                         