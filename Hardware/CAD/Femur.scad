include <Common.scad>

module Femur()
{
  dia = (SERVO_WIDTH + (5 * 2));
  rad = dia/2;


  leg_height = BOTTOM_SERVO_PAD + SERVO_HEIGHT + 25;
  
  translate([0-rad,0 - leg_height,0])
  {
    difference()
    {
      union()
      {
        translate([rad,leg_height,0])
        cylinder(h=SHEET_THICKNESS,r=rad,$fs=0.01,$fa = 0.1);
        servoHolder(SERVO_WIDTH,leg_height - 5);
      }

      translate([rad,leg_height,-1])
      cylinder(h=10,r=3,$fs=0.01);

    }
  }
}

//Femur();
