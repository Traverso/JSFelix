include <Common.scad>

module Femur()
{
  dia = (SERVO_WIDTH + (5 * 2));
  rad = dia/2;


  leg_height = BOTTOM_SERVO_PAD + SERVO_HEIGHT + 20;

  difference()
  {
  
    translate([0-rad,0 - leg_height,0])
    {
      difference()
      {
        union()
        {
          translate([rad,leg_height,0])
          //cylinder(h=SHEET_THICKNESS,r=rad,$fs=0.01,$fa = 0.1);

          difference()
          {
            cylinder(h=SHEET_THICKNESS,r=rad,$fs=0.01,$fa=0.1);
            translate([0 - rad,0-rad,-0.5])
            cube(size=[rad * 2,rad, SHEET_THICKNESS + 2]);
          }
          servoHolder(SERVO_WIDTH,leg_height - 5,1);
        }

        translate([rad,leg_height,-1])
        cylinder(h=10,r=3.5,$fs=0.01);

      }
    }

    rotate([0,00,-30])
    translate([0,-10.6,-0.5]) //-10.6
    cylinder(h=10,r=0.5,$fs=0.01);
  }
}
//Femur();

