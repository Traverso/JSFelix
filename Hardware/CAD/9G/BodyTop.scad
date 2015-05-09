include <Common.scad>

module TopPlate()
{
  union()
  {
    translate([0,SHEET_THICKNESS,0])
    cube(size = [BODY_RECTANGLE_WIDTH,BELLY_DEPTH,SHEET_THICKNESS]);

    translate([SHEET_THICKNESS,0,0])
    cube(size = [TOP_SLOT_WIDTH,(BELLY_DEPTH + ( SHEET_THICKNESS * 2)),SHEET_THICKNESS]);

    translate([(BODY_RECTANGLE_WIDTH - SHEET_THICKNESS - TOP_SLOT_WIDTH),0,0])
    cube(size = [TOP_SLOT_WIDTH,(BELLY_DEPTH + ( SHEET_THICKNESS * 2)),SHEET_THICKNESS]);
  }
}

module BodyTop()
{
  difference()
  {
    TopPlate();
    translate([12.5,12.5,-1])
    ArduinoHoles();
  }
}
