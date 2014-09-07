var game = {};

game.sounds =  {};
game.sounds.bip = new Audio("sounds/bip.wav");
game.sounds.boom = new Audio("sounds/boom.wav");

game.width = 6;
game.height = 6;
game.bombSize = 70;
game.bombsSelected = 0;
game.bombsToRemove = new Array();

game.score = 0;
game.timer = 30;

game.bombsRemaining = 0;

game.scores = {};

//
// A number bomb
//
function NumberBomb(number,x,y){
    this.number = number;
    this.selected = false;
    this.removeCounter = 0;
    
    var sprite = new createjs.Sprite(game.spriteSheet, this.number-1);
         
    // Set position of instance.
    sprite.x = game.bombSize + x * game.bombSize;
    sprite.y = game.bombSize + y * game.bombSize;
    sprite.bomb = this;
      
    //Add instance to stage display list.
    game.stage.addChild(sprite);
    sprite.gotoAndStop(this.number-1);
      
    // Add click listener
    sprite.addEventListener("click", game.bombSelectionListener );
      
    this.sprite = sprite;
}

game.getPlayerName = function(){
     return document.getElementById("name").value.toUpperCase();
}

game.bombSelectionListener = function(event){
    var sprite = event.target;
    var bomb = sprite.bomb;
    
    if (bomb.selected){
        bomb.selected = false;
        sprite.gotoAndStop(bomb.number-1);
        game.bombsSelected--;
    } else {
        if (game.bombsSelected < 2){
           bomb.selected = true;
           sprite.gotoAndStop(bomb.number+8);
           game.bombsSelected++;
           game.checkBoom();
        }
    }
    game.stage.update();
}

//
// Check if the selected bombs make a number bond (add up to 10)
//
game.checkBoom = function(){
  var selectedBombs = new Array();
  for (var y = 0;y < game.height;y++){
    var row = new Array();
    for (var x = 0;x < game.width;x++){
       var numberBomb = game.getNumberBomb(x,y);
       if (numberBomb.selected) selectedBombs.push(numberBomb);
    }
  }

  if (selectedBombs.length === 2){
      if (selectedBombs[0].number + selectedBombs[1].number == 10){
        game.boom(selectedBombs);
      }
  }
}

//
// Detonate the two selected bombs
//
game.boom = function(bombs){
  game.score++;
  document.getElementById("score").innerHTML = game.score;
  
  // Explode bombs
  bombs[0].sprite.gotoAndPlay("explode");
  bombs[0].removeCounter = 4;
  game.bombsToRemove.push(bombs[0]);
  bombs[0].selected = false;
  
  bombs[1].sprite.gotoAndPlay("explode");
  bombs[1].removeCounter = 4;
  game.bombsToRemove.push(bombs[1]);
  bombs[1].selected = false;
  
  game.bombsSelected = 0;
  
  game.sounds.boom.play();
  
  // TODO Drop next row
}

//
// Initialise the game - setup sprites and canvas
//
game.init = function(){

   //
   // Load sprites
   //
   var bombs = {
     images: ["img/bombs.png"],
     frames: {width:60, height:60},
     animations:{
       explode: [18,22,,4]
     }
   };
   game.spriteSheet = new createjs.SpriteSheet(bombs);
   
   
   //
   // Create the stage
   //
   game.setupStage();
   
}

//
// Game over
//
game.end = function(){

  //
  // Stop the game loop
  //
  createjs.Ticker.removeEventListener("tick", game.update);
  
  //
  // Clear the grid
  //
  game.stage.removeAllChildren();
  game.stage.update();
  
  //
  // Stop and Hide the timer
  //
  window.clearTimeout(game.countdown);
  document.getElementById("timer").style.display="none";
  
   //
   // Show the start button
   //
   document.getElementById("start").style.display="block";
   
   //
   // Add current score to leaderboard
   //
   game.scores[game.getPlayerName()] = game.score;
   game.showLeaderboard();

}

//
// Sorts the scores out and prints a leaderboard table
//
game.showLeaderboard = function(){
   var sortedScores = game.util.sortObj(game.scores,'value');

   document.getElementById("leaderboard").style.display="block";
   var scoreinfo = "<table>";
   for (score in sortedScores){
    scoreinfo += "<tr><td class='score_name'>"+score;
    scoreinfo += "</td> <td class='score_value'>"; 
    scoreinfo += sortedScores[score]+"</td></tr>"; 
   }
   document.getElementById("leaderboard").innerHTML = scoreinfo +"</table>";
   
}

game.start = function(){

   //
   // Hide the start button
   //
   document.getElementById("start").style.display="none";

   //
   // Create the grid
   //
   game.createGrid();
   
   //
   // Clear and show the score
   //
   game.score = 0;
   document.getElementById("score").style.display="block";
   document.getElementById("score").innerHTML = game.score;
   
   //
   // Start the timer
   //
   game.timer = 30;
   document.getElementById("timer").style.display="block";
   document.getElementById("timer").innerHTML = game.timer;
   window.setTimeout(game.countdown, 1000);
   
   // Start ticking
   createjs.Ticker.addEventListener("tick", game.update);
}

//
// Game countdown loop
//
game.countdown = function(){
   game.timer--;
   game.sounds.bip.play();
   document.getElementById("timer").innerHTML = game.timer;
   if (game.timer == 0) {
     window.clearTimeout(game.countdown);
     game.end();
   } else {  
     window.setTimeout(game.countdown, 1000);
   }
}

//
// Main animation loop
//
game.update = function(){
   //
   // Any bombs to remove?
   //
   var bombsToRemove = new Array();
   for (var i = 0;i < game.bombsToRemove.length; i++){
     var bomb = game.bombsToRemove[i];
     bomb.removeCounter--;
     if (bomb.removeCounter <= 0){
       game.removeBomb(bomb);
       game.bombsRemaining--;
       if (game.bombsRemaining == 0) game.end();
     } else {
       bombsToRemove.push(bomb);
     }
   }
   game.bombsToRemove = bombsToRemove;

   game.stage.update();
}

game.removeBomb = function(bomb){
  game.stage.removeChild(bomb.sprite);
  bomb.sprite = null;
  bomb = null;
}

//
// Create a grid of numberbombs, height x width
//
game.createGrid = function(){
 
   //
   // get some numbers
   //
   numbers = game.createBombs();
   
   game.rows = new Array();
   for (var y = 0;y < game.height;y++){
    var row = new Array();
    for (var x = 0;x < game.width;x++){
      var numberBomb = new NumberBomb(numbers.pop(),x,y);
      row.push(numberBomb);
      game.bombsRemaining++;
    }
    game.rows.push(row);
   }
}

game.getNumberBomb = function(x,y){
 if (x >= game.width || y >= game.hieght || x < 0 || y < 0) return null;
 var row = game.rows[y];
 var numberBomb = row[x];
 return numberBomb;
}

//
// Create the game stage
//
game.setupStage = function(){
    game.stage = new createjs.Stage("canvas");
}


//
// Create enough pairs of number bonds to fill the grid
//
game.createBombs = function(){
  var numbers = new Array();
  
  for (var i = 0; i < ((game.height * game.width) / 2); i++){
    var number = Math.floor(Math.random()*9)+1;
    var otherNumber = 10-number;
    numbers.push(number);
    numbers.push(otherNumber);
  }
  return game.util.shuffle(numbers);
}

//
// Utility methods
//

game.util = {};

//
// Shuffles an array of numbers
//
game.util.shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


game.util.sortObj = function(obj, type, caseSensitive) {
  var temp_array = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!caseSensitive) {
        key = (key['toUpperCase'] ? key.toUpperCase() : key);
      }
      temp_array.push(key);
    }
  }
  if (typeof type === 'function') {
    temp_array.sort(type);
  } else if (type === 'value') {
    temp_array.sort(function(a,b) {
      var x = obj[a];
      var y = obj[b];
      if (!caseSensitive) {
        x = (x['toUpperCase'] ? x.toUpperCase() : x);
        y = (y['toUpperCase'] ? y.toUpperCase() : y);
      }
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  } else {
    temp_array.sort();
  }
  var temp_obj = {};
  for (var i=0; i<temp_array.length; i++) {
    temp_obj[temp_array[i]] = obj[temp_array[i]];
  }
  return temp_obj;
};
