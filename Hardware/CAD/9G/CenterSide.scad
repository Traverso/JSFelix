include <Common.scad>
//include <BodySide.scad>

module BottomPlate()
{
  difference()
  {
    union()
    {
      cube(size = [60,69,SHEET_THICKNESS]);
      translate([0,-3,0])
      cube(size = [60,75,SHEET_THICKNESS]);
    }

  
    translate([30,-6,-1.5])
    cube(size = [10,6,10]);

    translate([30,69,-1.5])
    cube(size = [10,6,10]);


  }
  /*
  translate([SHEET_THICKNESS,0,0])
  {
    union()
    {
      cube(size = [BELLY_WIDTH,(BELLY_DEPTH + (SHEET_THICKNESS * 2)),SHEET_THICKNESS]);
      //translate([(0 - SHEET_THICKNESS),SHEET_THICKNESS,0])
      //cube(size = [(BELLY_WIDTH +(SHEET_THICKNESS * 2)),BELLY_DEPTH,SHEET_THICKNESS]);
    }
  }
  */
}

module CenterSide()
{
  difference()
  {
    BottomPlate();
    translate([12.5,9,-1])
    ArduinoTopSlideHoles();
  }
}

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
//translate([67,40,0])
//rotate([0,180,90])
//BodyBottom();
