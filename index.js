const { Engine, Render, Bodies, Runner, World, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 8;
const cellsVertical = 6;
const unitLengthWidth = width / cellsHorizontal;
const unitLengthHeight = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, width, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, width, { isStatic: true }),
];
World.add(world, walls);

//maze generation
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    //swap
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

//world variable contains all the shapes

//algo for maze
// divide the entire maze into cells (rectangular)
// create an array of cells (2d)
// pick a random cells
// for that cell, build a randomly-ordered list of neighbours
// if a neighbour has been visited before, remove it from the list
// for each remaning neighbour, move to it and remove the wall between those cells
// repeat for this new neighbour

//grid array

// const grid = [];
// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid.push(false);
//   }
// }
//use map instead of for loops

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThrouughCell = (row, column) => {
  //if i have visited the cell at [row,column] , then return
  if (grid[row][column]) {
    return;
  }
  //mark the cells as being visited
  grid[row][column] = true;
  //assemble randomly ordered list of neighbours
  //neighbours : (r-1,c), (r+1,c), (r,c-1), (r,c+1)
  const neighbours = shuffle([
    //order should be random
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  //for each neighbour
  for (let neighbour of neighbours) {
    //see if that neighbour is out of bounds
    const [nextRow, nextColumn, direction] = neighbour;
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      //skip this iteration of the loop
      continue;
    }
    //if we have visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    //remove the wall from horizontal or vertical array
    //decide whether to go up or down left or right
    //add a third element to neighbours array to determine their orientation relative to the current array
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    } else {
      console.log("wrong direction");
    }
    //visit that next cell
    stepThrouughCell(nextRow, nextColumn);
  }
};
//creat g  rid
stepThrouughCell(startRow, startColumn);
// console.log(grid);

//draw maze
//iterate horizontals
horizontals.forEach((row, rowIndex) => {
  //as horizotnals is 2d array we will get inner most array
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthWidth + unitLengthWidth / 2,
      rowIndex * unitLengthHeight + unitLengthHeight,
      unitLengthWidth,
      5,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    ); //x,y,width,height
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthWidth + unitLengthWidth,
      columnIndex * unitLengthHeight + unitLengthHeight / 2,
      5,
      unitLengthHeight,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    );
    World.add(world, wall);
  });
});

//goal
const goal = Bodies.rectangle(
  width - unitLengthWidth / 2,
  height - unitLengthHeight / 2,
  unitLengthWidth * 0.7,
  unitLengthHeight * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "green",
    },
  }
);
World.add(world, goal);

//ball
const ballRadius = Math.min(unitLengthWidth, unitLengthHeight) / 4;
const ball = Bodies.circle(
  unitLengthWidth / 2,
  unitLengthHeight / 2,
  ballRadius,
  {
    isStatic: false,
    label: "ball",
    render: {
      fillStyle: "blue",
    },
  }
);
World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;

  if (event.key === "w") {
    Body.setVelocity(ball, { x: x, y: y - 5 });
  }
  if (event.key === "s") {
    Body.setVelocity(ball, { x: x, y: y + 5 });
  }
  if (event.key === "a") {
    Body.setVelocity(ball, { x: x - 5, y: y });
  }
  if (event.key === "d") {
    Body.setVelocity(ball, { x: x + 5, y: y });
  }
});

//win condition

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    // if(bodyA.label === 'ball', bodyB.label === 'goal')
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
