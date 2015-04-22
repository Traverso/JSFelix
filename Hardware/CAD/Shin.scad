include <Common.scad>

module Shin()
{
  dia = (SERVO_WIDTH + (5 * 2));
  rad = dia/2;


  leg_height = BOTTOM_SERVO_PAD + SERVO_HEIGHT + 25;

  difference()
  {
    hull()
    {
      cylinder(h=SHEET_THICKNESS,r=rad,$fs=0.01,$fa=0.1);
      translate([0,0-leg_height,0])
      cylinder(h=SHEET_THICKNESS,r=6,$fs=0.01,$fa=0.1);
      }

    translate([0,0,-1])
    cylinder(h=10,r=3,$fs=0.01);
  }

}

//Shin();
