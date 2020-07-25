const {
  Engine,
  Render,
  Bodies,
  Runner,
  World,
  MouseConstraint,
  Mouse,
} = Matter;
const width = 800;
const height = 600;
const engine = Engine.create();
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

World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

//Walls
const walls = [
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  Bodies.rectangle(0, 300, 40, 800, { isStatic: true }),
  Bodies.rectangle(800, 300, 40, 800, { isStatic: true }),
];
World.add(world, walls);

for (let i = 0; i < 20; i++) {
  World.add(
    world,
    Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
  );
}

for (let i = 0; i < 10; i++) {
  World.add(
    world,
    Bodies.circle(Math.random() * width, Math.random() * height, 30, {
      render: {
        fillStyle: "green",
      },
    })
  );
}
//world variable contains all the shapes

//algo for maze
// divide the entire maze into cells (rectangular)
// create an array of cells (2d)
// pick a random cells
// for that cell, build a randomly-ordered list of neighbours
// if a neighbour has been visited before, remove it from the list
// for each remaning neighbour, move to it and remove the wall between those cells
// repeat for this new neighbour
