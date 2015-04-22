include <Common.scad>

module BottomPlate()
{
  translate([SHEET_THICKNESS,0,0])
  {
    union()
    {
      cube(size = [BELLY_WIDTH,(BELLY_DEPTH + (SHEET_THICKNESS * 2)),SHEET_THICKNESS]);
      translate([(0 - SHEET_THICKNESS),SHEET_THICKNESS,0])
      cube(size = [(BELLY_WIDTH +(SHEET_THICKNESS * 2)),BELLY_DEPTH,SHEET_THICKNESS]);
    }
  }
}

module BodyBottom()
{
  difference()
  {
    BottomPlate();
    translate([12.5,12.5,-1])
    ArduinoHoles();
  }
}

//BodyBottom();
