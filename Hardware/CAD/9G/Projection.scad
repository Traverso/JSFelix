include <BodySide.scad>
include <CenterSide.scad>
include <ParallelSide.scad>
include <Femur.scad>
include <Shin.scad>

//$fa = 0.1;

module shins()
{
  translate([-10,-90,0])
  rotate([0,0,100])
  projection(cut=false) Shin();

  translate([23,-105,0])
  rotate([0,0,-80])
  projection(cut=false) Shin();

}

translate([ 0 -(BODY_RECTANGLE_WIDTH / 2),38,0])
{
  projection(cut=false) BodySide();


  translate([BODY_RECTANGLE_WIDTH,55,0])
  rotate([0,0,180])
  projection(cut=false) BodySide();


  translate([12,-14,0])
  projection(cut=false) Femur();
  
  translate([15,70,0])
  rotate([0,0,90])
  projection(cut=false) Femur();

  translate([52,-14,0])
  projection(cut=false) Femur();

  //rotate([0,0,180])
  translate([125,80,0])
  projection(cut=false) Femur();
  

  translate([165,96,0])
  rotate([0,0,-45])
  shins();

  translate([164,165,0])
  //rotate([0,0,45])
  shins();

}

translate([110,70,0])
projection(cut=false) ParallelSide();

translate([40,-8,0])
projection(cut=false) ParallelSide();

translate([105,-12,0])
projection(cut=false) CenterSide();

/*
translate([-111,-140,-8])
cube(size = [217,295,2]);
*/
