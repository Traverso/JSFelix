include <BodySide.scad>
include <BodyTop.scad>
include <BodyBottom.scad>
include <Femur.scad>
include <Shin.scad>


translate([ 0 -(BODY_RECTANGLE_WIDTH / 2),38,0])
{
  projection(cut=false) BodySide();

  translate([0,45,0])
  projection(cut=false) BodySide();

  translate([0,-75,0])
  projection(cut=false) BodyTop();

  translate([0,-150,0])
  projection(cut=false) BodyBottom();

  translate([-20,-45,0])
  projection(cut=false) Femur();

  translate([-57,-45,0])
  projection(cut=false) Femur();

  translate([92,-45,0])
  projection(cut=false) Femur();

  translate([130,-45,0])
  projection(cut=false) Femur();

  translate([-47,-140,0])
  rotate([0,0,65])
  projection(cut=false) Shin();

  translate([120,-140,0])
  rotate([0,0,-65])
  projection(cut=false) Shin();

  translate([90,100,0])
  rotate([0,0,38])
  projection(cut=false) Shin();

  translate([-15,100,0])
  rotate([0,0,-38])
  projection(cut=false) Shin();
}

translate([-111,-140,-8])
cube(size = [217,295,2]);
