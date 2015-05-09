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
    union()
    {
      translate([-56,0,0])
      rightHolder();

      translate([56.05,0,0])
      leftHolder();
    }
}

module bodyPlate()
{
  translate([0,-1.4,0])

  union()
  {
    //translate([36.6,-37.5,0])
    translate([BODY_RECTANGLE_WIDTH/2,-27.75,0])
    holders();
    
    //main body rectangle
    translate([0,1.4,0])
    cube(size = [BODY_RECTANGLE_WIDTH,26,3]); 
    
    /*
    translate([32,-25.5,0])
    rotate([0,0,45])
    cube(size = [38,38,3]); 
    */
  }
}

module holder()
{
  difference()
  {
    union()
    {
      translate([-5,0,0])
      cube(size = [10,30,3]); 
      cylinder(h=3,r=5,$fs=0.01);
    }
    translate([0,0,-0.5])
    cylinder(h=10,r=1.5,$fs=0.01);
  }
}

module BodySide()
{
  difference()
  {

    union()
    {
      bodyPlate();

      //translate([BODY_RECTANGLE_WIDTH/2,-15,0])
      //holder();
    }

    /*
    union()
    {
      translate([1.5,22,-0.5])
      cylinder(h=10,r=1.5,$fs=0.01);

      translate([BODY_RECTANGLE_WIDTH - 1.5,22,-0.5])
      cylinder(h=10,r=1.5,$fs=0.01);
    }
    */

    union()
    {
      translate([-5,5,-0.5])
      cube(size=[3,10,10]);

      translate([-9.5,10,-0.5])
      cylinder(h=10,r=1.5,$fs=0.01);

      translate([BODY_RECTANGLE_WIDTH + (5 - 3),5,-0.5])
      cube(size=[3,10,10]);

      //translate([-9.5,10,-0.5])
      translate([BODY_RECTANGLE_WIDTH + (5 - 3) + 7,10,-0.5])
      cylinder(h=10,r=1.5,$fs=0.01);
    }
  }
}

//BodySide();


//servoHolder();
