let canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgb(200, 0, 0)';
ctx.canvas.width = 512;
ctx.canvas.height = 512;

let quad_width = 16,
    quad_height = 16,
    canvas_width = 512,
    canvas_height = 512,
    grid,
    firstTurn;

function generateBoard(){
  firstTurn = true;
  // Clear the board
  grid = {};
  // Initialize grid data structure. Add random mine locations
  for(let x=0; x<canvas_width; x+=quad_width){
    for(let y=0; y<canvas_height; y+=quad_height){
      // Translate pixel offset to a quadrant offset
      // (ie, top-left quadrant is at 0,0, the one next to it is 1,0, the one below that is 1,1)
      let quad_offset_x = Math.floor(x/quad_width);
      let quad_offset_y = Math.floor(y/quad_width);
      // Calculate the upper-left pixel of the quadrant that was clicked
      let upper_left_x = quad_offset_x * quad_width;
      let upper_left_y = quad_offset_y * quad_width;
      // Chance of mines, watch yr step
      let contains_mine = (Math.floor(Math.random()*100) <= 50) ? true : false;
      // update grid
      grid[`${quad_offset_x}_${quad_offset_y}`] = {
        grid_x: quad_offset_x,
        grid_y: quad_offset_y,
        canvas_upper_left_x: upper_left_x,
        canvas_upper_left_y: upper_left_y,
        flagged: false,
        contains_mine
      };
      if(contains_mine && partyMode){
        ctx.fillRect(upper_left_x+1, upper_left_y+1, quad_width-1, quad_width-1);
      }
      ctx.font = "6px Arial";
    }
  }
}

function clickHandler(evt){
  evt.preventDefault();
  let x = evt.offsetX;
  let y = evt.offsetY;
  // Translate pixel offset to a quadrant offset
  // (ie, top-left quadrant is at 0,0, the one next to it is 1,0, the one below that is 1,1)
  let quad_offset_x = Math.floor(x/quad_width);
  let quad_offset_y = Math.floor(y/quad_width);
  let grid_key = `${quad_offset_x}_${quad_offset_y}`;

  // First move freebie: clear any mine, otherwise things get frustrating with 50% of the board full of mines
  if(firstTurn){
    firstTurn = false;
    grid[grid_key].contains_mine = false;
  }

  if(grid[grid_key].contains_mine){
    alert('boom');
    drawGrid();
    generateBoard();
  }else{
    // no mine
    // flood fill to the edges
    floodFill(grid_key);
  }
}

function rightClickHandler(evt){
  evt.preventDefault();
  let x = evt.offsetX;
  let y = evt.offsetY;
  // Translate pixel offset to a quadrant offset
  // (ie, top-left quadrant is at 0,0, the one next to it is 1,0, the one below that is 1,1)
  let quad_offset_x = Math.floor(x/quad_width);
  let quad_offset_y = Math.floor(y/quad_width);
  let grid_key = `${quad_offset_x}_${quad_offset_y}`;
  let node = grid[grid_key];
  let { canvas_upper_left_x, canvas_upper_left_y } = node;

  // Toggle flag
  // grid[grid_key].flagged = !grid[grid_key].flagged
  // Draw flag
  node.flagged = !node.flagged;
  if(node.flagged){
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.font = "12px Arial";
    ctx.fillText('X',canvas_upper_left_x + 4,canvas_upper_left_y + 12);
  }else{
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(canvas_upper_left_x+1, canvas_upper_left_y+1, quad_width-2, quad_width-2);
  }

  // Prevent victory if it's incorrectly flagged
  // if(!grid[grid_key].contains_mine){
  //   alert('boom');
  //   drawGrid();
  //   generateBoard();
  // }else{
  //   // no mine
  //   // flood fill to the edges
  //   floodFill(grid_key);
  // }
}

function floodFill(grid_key){
  let {
    contains_mine,
    grid_x,
    grid_y,
    visited,
    canvas_upper_left_x,
    canvas_upper_left_y
  } = grid[grid_key];

  let left_key = `${grid_x-1}_${grid_y}`,
      right_key = `${grid_x+1}_${grid_y}`,
      up_key = `${grid_x}_${grid_y+1}`,
      down_key = `${grid_x}_${grid_y-1}`;

  let left = grid[left_key],
      right = grid[right_key],
      up = grid[up_key],
      down = grid[down_key];

  // if the node has a mine or has already been visited, return
  if (contains_mine || visited){
    return;
  }
  // Mark as visited
  grid[grid_key].visited = true;
  // otherwise, count the number of mines next to the node and set the number
  let adjacent_mines = 0;
  adjacent_mines += ( left && left.contains_mine ? 1 : 0 );
  adjacent_mines += ( right && right.contains_mine ? 1 : 0 );
  adjacent_mines += ( up && up.contains_mine ? 1 : 0 );
  adjacent_mines += ( down && down.contains_mine ? 1 : 0 );
  if(adjacent_mines != 0){
    ctx.font = "12px Arial";
    ctx.fillStyle = 'rgb(0, 0, 0, 1)';
    ctx.fillText(adjacent_mines,canvas_upper_left_x + 4,canvas_upper_left_y + 12);
    // ctx.fillText(`${grid_x},${grid_y}`,canvas_upper_left_x,canvas_upper_left_y + 12);
  }

  // then flood south, north, east, and west if those are valid grid points
  left && floodFill(left_key);
  right && floodFill(right_key);
  up && floodFill(up_key);
  down && floodFill(down_key);
}

function drawGrid(){
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  // Draw a grid
  ctx.beginPath()
  for(let x=0; x<=canvas_width; x+=quad_width){
    ctx.moveTo(x,0);
    ctx.lineTo(x, 512);
    ctx.stroke()
  }
  for(let y=0; y<=canvas_height; y+=quad_height){
    ctx.moveTo(0,y);
    ctx.lineTo(512, y);
    ctx.stroke()
  }
  ctx.closePath()

  canvas.removeEventListener('click', clickHandler);
  canvas.addEventListener('click', clickHandler);
  canvas.removeEventListener('contextmenu', rightClickHandler);
  canvas.addEventListener('contextmenu', rightClickHandler);
}

let partyMode = false;
function bindPartyButton(){
  let btn = document.getElementById('party-mode');
  btn.addEventListener('click', (evt)=>{
    partyMode = !partyMode;
  });
  window.setInterval(()=>{
    if(partyMode){
      drawGrid();
      generateBoard();
    }
  }, 500);
}

drawGrid();
generateBoard();
bindPartyButton();
// ctx.fillRect(10, 10, 50, 50);

// ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
// ctx.fillRect(30, 30, 50, 50);
// ctx.fillRect(25, 25, 100, 100);
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

// Draw a sin wave
// for(let x=0; x<150; x++){
//   let y_new=Math.sin(x) + 20;
//   ctx.fillRect(x,y_new,1,1);
// }

// Draw a triangle
// ctx.beginPath();
// ctx.moveTo(75, 50);
// ctx.lineTo(100, 75);
// ctx.lineTo(100, 25);
// ctx.fill();

// Path2D objects are reusable but non-modifiable(?) shapes
// let rectangle = new Path2D();
// rectangle.rect(10, 10, 50, 50);
// let circle = new Path2D();
// circle.moveTo(125, 35);
// circle.arc(100, 35, 25, 0, 2 * Math.PI);
// ctx.stroke(rectangle);
// ctx.fill(circle);

// They call also accept SVG paths
// let p = new Path2D('M100 100 h 80 v 80 h -80 Z');
// ctx.stroke(p);
