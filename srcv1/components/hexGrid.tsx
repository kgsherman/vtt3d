import { defineHex, Grid, spiral } from "honeycomb-grid";

export const hex = defineHex({
  dimensions: { xRadius: 0.5, yRadius: 0.5 },
});
export const grid = new Grid(hex, spiral({ radius: 100}));
console.log(grid.toArray()[0].corners)