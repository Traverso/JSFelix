include <BodySide.scad>
include <BodyTop.scad>
include <BodyBottom.scad>
include <Femur.scad>
include <Shin.scad>

module BodyRightSide()
{
  translate([0,SHEET_THICKNESS,(0 - SHEET_THICKNESS)])
  rotate([90,0,0])
  BodySide();
}

module Leg(shin_rotations=45)
{
  rotate([90,0,0])
  Femur();

  translate([0,-6,-55])
  rotate([90,shin_rotations,0])
  Shin();
}

module BackRightLeg()
{
  translate([-22,-2,-10])
  rotate([0,-25,0])
  Leg();
}

module FrontRightLeg()
{
  translate([110,-2,-20])
  rotate([0,25,0])
  Leg(-45);
}

module RightSideLegs()
{
  BackRightLeg();
  FrontRightLeg();
}

BodyBottom();
BodyRightSide();

translate([0,BELLY_DEPTH + SHEET_THICKNESS,0])
BodyRightSide();


RightSideLegs();

rotate([0,0,180])
translate([-74,(0 -BELLY_DEPTH - 8),0])
RightSideLegs();

