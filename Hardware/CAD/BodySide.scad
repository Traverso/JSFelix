include <Common.scad>



module leftHolder()
{
  rotate([0,0,45])
  servoHolder();
}

module rightHolder()
{
  mirror([1,0,0])
  leftHolder();
}

module holders()
{
  translate([-75.5,0,0])
  rightHolder();

  translate([75.5,0,0])
  leftHolder();
}

module bodyPlate()
{
  translate([0,-1.4,0])

  union()
  {
    translate([36.6,-37.5,0])
    holders();
    
    //main body rectangle
    translate([0,1.4,0])
    cube(size = [BODY_RECTANGLE_WIDTH,42.4,4]); 
  }
}

module bodyBottomHole()
{
    translate([4.1,4,-0.5])
    cube(size = [65,4,5]);
}

module bodyTopHoles()
{
    //left slot
    translate([4.1,38.4,-0.5])
    cube(size = [TOP_SLOT_WIDTH,5,5]);

    //right slot
    translate([(BODY_RECTANGLE_WIDTH - 15 - 4.1),38.4,-0.5])
    cube(size = [TOP_SLOT_WIDTH,5,5]);
}

module BodySide()
{
  difference()
  {
    bodyPlate();
    bodyBottomHole();
    bodyTopHoles();
  }
}

//BodySide();
