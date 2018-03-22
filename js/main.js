let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgb(200, 0, 0)';
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

// Draw a grid
let quad_width = Math.pow(2,4),
  canvas_width = this.props.width,
  canvas_height = this.props.height;

ctx.beginPath()
for(let x=0; x<canvas_width; x+=quad_width){
  ctx.moveTo(x,0);
  ctx.lineTo(x, 512);
  ctx.stroke()
}
for(let y=0; y<canvas_height; y+=quad_width){
  ctx.moveTo(0,y);
  ctx.lineTo(512, y);
  ctx.stroke()
}
ctx.closePath()

canvas.addEventListener('click', (evt)=>{
  let x = evt.offsetX;
  let y = evt.offsetY;
  // Translate pixel offset to a quadrant offset
  // (ie, top-left quadrant is at 0,0, the one next to it is 1,0, the one below that is 1,1)
  let quad_offset_x = Math.floor(x/quad_width);
  let quad_offset_y = Math.floor(y/quad_width);
  // Calculate the upper-left pixel of the quadrant that was clicked
  let upper_left_x = quad_offset_x * quad_width;
  let upper_left_y = quad_offset_y * quad_width;
  // Fill in the quarant, not erasing the border
  ctx.fillRect(upper_left_x+1, upper_left_y+1, quad_width-1, quad_width-1);
});

