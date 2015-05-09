BODY_RECTANGLE_WIDTH = 64;
BELLY_DEPTH = 65;
BELLY_WIDTH = 65;
SHEET_THICKNESS = 3;
SERVO_WIDTH = 12;
SERVO_HEIGHT = 22.7;
TOP_SLOT_WIDTH = 15;
BOTTOM_SERVO_PAD = 5;

//$fa = 0.1;
//$fs = 0.01;


module ArduinoTopSlideHoles(height=10)
{
  union()
  {
    rotate([0,0,90])
    translate([-1.5,0,0])
    cube(size=[3,25,10]);
    cylinder(h=height,r=1.5,$fs=0.01);
  }

  union()
  {
    translate([1.7,48.5 - 1.5,0])
    rotate([0,0,90])
    cube(size=[3,25,10]);
    translate([1.7,48.5,0])
    cylinder(h=height,r=1.5,$fs=0.01);
  }
}


module ArduinoHoles(height=10)
{
  cylinder(h=height,r=1.5,$fs=0.01);

  translate([1.7,48.5,0])
  cylinder(h=height,r=1.5,$fs=0.01);

  translate([51.9,4.9,0])
  cylinder(h=height,r=1.5,$fs=0.01);

  translate([51.9,33,0])
  cylinder(h=height,r=1.5,$fs=0.01);
}

module servoScrew(thickness=5)
{
  cylinder(h = thickness, r=0.8, $fs = 0.01);
}
module servoBlock(width=20,height=40,thickness=5,padding=4,isFemur=0)
{
  translate([0,-2.5,0])
  {
    translate([SERVO_WIDTH / 2,0,0])
    servoScrew(thickness);
  }

  translate([0,(height + 3.5),0])
  {
    translate([SERVO_WIDTH/2,0,0])
    servoScrew(thickness);

  }
  
  //if(isFemur == 1)
  //{
    translate([6,6,0])
    cylinder(h=5,r=5.8,$fs=0.01);

    translate([3,7.5,0])
    union()
    {
      cube(size=[6,5,10]);
      translate([3,5,0])
      cylinder(h=5,r=3,$fs=0.01);
    }
  //}
  //if(isFemur == 0) cube(size = [width,height,thickness]);
  //cube(size = [width,height,thickness]);
}

module leftCornerCutter()
{
  translate([22,2,0])
  {
    rotate([0,0,180])
    {
      difference()
      {
        cube(size=[22,22,5]);
        translate([0,0,-0.5])
        cylinder(h=6,r=11,$fs=0.01);
      }
    }
  }
}

module servoHolder(w=SERVO_WIDTH,h=51,isFemur=0)
{
  servoCasing(w,h,3,5,isFemur);
  /*
  difference()
  {
    servoCasing(w,h,3,5,isFemur);
    translate([0,0,-0.5])
    leftCornerCutter();

    translate([22,0,-0.5])
    {
      mirror([1,0,0])
      leftCornerCutter();
    }
  }
  */
}

module servoCasing(width=20,height=80,thickness=3,padding=5,isFemur=0)
{
  difference()
  {
    union()
    {
       translate([0,(padding * 2),0])
       cube(size = [(width + (padding * 2)),(height - padding),thickness]);
       translate([11,11,0])
       cylinder(h=thickness,r=11,$fs=0.01,$fa=0.1);
    }

   translate([padding,BOTTOM_SERVO_PAD,-0.8])
   servoBlock(SERVO_WIDTH,SERVO_HEIGHT,(SHEET_THICKNESS + 1),SHEET_THICKNESS,isFemur);
  }
}
