BODY_RECTANGLE_WIDTH = 73.2;
BELLY_DEPTH = 65;
BELLY_WIDTH = 65;
SHEET_THICKNESS = 4;
SERVO_WIDTH = 20;
SERVO_HEIGHT = 40;
TOP_SLOT_WIDTH = 15;
BOTTOM_SERVO_PAD = 8;

//$fa = 0.1;
//$fs = 0.01;



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
  cylinder(h = thickness, r=1.5, $fs = 0.01);
}
module servoBlock(width=20,height=40,thickness=5,padding=4)
{
  translate([0,(0-padding),0])
  {
    translate([padding,0,0])
    servoScrew(thickness);

    translate([(width-padding),0,0])
    servoScrew(thickness);
  }

  translate([0,(height + padding),0])
  {
    translate([padding,0,0])
    servoScrew(thickness);

    translate([(width-padding),0,0])
    servoScrew(thickness);
  }

  cube(size = [width,height,thickness]);
}

module leftCornerCutter()
{
  translate([2,2,0])
  {
    rotate([0,0,180])
    {
      difference()
      {
        cube(size=[4,4],5);
        translate([0,0,-0.5])
        cylinder(h=6,r=2,$fs=0.01);
      }
    }
  }
}

module servoHolder(w=SERVO_WIDTH,h=80)
{
  difference()
  {
    servoCasing(w,h);
    translate([0,0,-0.5])
    leftCornerCutter();

    translate([30,0,-0.5])
    {
      mirror([1,0,0])
      leftCornerCutter();
    }
  }
}

module servoCasing(width=20,height=80,thickness=4,padding=5)
{
  difference()
  {
   cube(size = [(width + (padding * 2)),(height + padding),thickness]);
   translate([padding,BOTTOM_SERVO_PAD,-0.8])
   servoBlock(SERVO_WIDTH,SERVO_HEIGHT,(SHEET_THICKNESS + 1),SHEET_THICKNESS);
  }
}
