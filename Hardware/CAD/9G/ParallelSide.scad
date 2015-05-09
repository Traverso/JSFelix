include <Common.scad>

module ParallelSide()
{

  difference()
  {
    union()
    {
      cube(size = [50,10,SHEET_THICKNESS]);
      translate([3,-7,0])
      cube(size = [44,20,SHEET_THICKNESS]);
    }

    union()
    {
      translate([(20 + 3) - 1.5,10,-0.5])
      cube(size = [3,10,10]);

      translate([(20 + 3) - 1.5,-10,-0.5])
      cube(size = [3,10,10]);
    }
  }
}

//ParallelSide();
