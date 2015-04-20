var leg = require('./leg.js');
var temporal = require("temporal");

var Felix = function(five){
  this.fps = 4;
  this.stepDelay = 0;
  this.direction = 'forward';
  this.updated = false;
  this.five = five;
  this.TILT = 10;

  this.FR = new leg.Leg(this,'FR'); //front right
  this.BR = new leg.Leg(this,'BR'); //back right
  this.FL = new leg.Leg(this,'FL'); //front left
  this.BL = new leg.Leg(this,'BL'); //back left

  this.legs = [this.FR,this.BR,this.FL,this.BL];

  //calibration values to compensate for small servo drift
  this.FR.femur.delta = -4; 
  this.BR.femur.delta = -5;
  this.BL.femur.delta = -6;
  this.FL.femur.delta = -4;

  this.FL.tibia.delta = 8;
  this.BL.tibia.delta = -4;
  this.FR.tibia.delta = -4;
  this.BR.tibia.delta = -3;

 
  /*
   *     4       3       2        1
   *     *-------*-------*--------*
   *      
   *     Each frame of a gait described the start position for each leg
   *     The position can be one of four. Transitions from 1 to 4 are drags
   *     Transition from 4 to 1 is a pin
   *     The Leg order is FR->BR->FL->BL 
   */
  this.gaits = {
                'creep':[
                          [ {leg:'FR',pose:2},{leg:'BR',pose:3},{leg:'FL',pose:4},{leg:'BL',pose:1} ],
                          [ {leg:'FR',pose:3},{leg:'BR',pose:4},{leg:'FL',pose:1},{leg:'BL',pose:2} ],
                          [ {leg:'FR',pose:4},{leg:'BR',pose:1},{leg:'FL',pose:2},{leg:'BL',pose:3} ],
                          [ {leg:'FR',pose:1},{leg:'BR',pose:2},{leg:'FL',pose:3},{leg:'BL',pose:4} ]
                        ]
               };
}

/**
 *  SetServos sets the servo pins and initialize the leg servos
 *
 *  @param {Object} servos is an object holding the servo pin id for each leg
 */
Felix.prototype.SetServos = function(servos)
{
  for(var i=0;i < this.legs.length;i++)
  {
    this.legs[i].setServos(this.five, servos[this.legs[i].id]);
  }

  for(var i=0;i < this.legs.length;i++)
  {
    this.legs[i].Home();
  }

  //get ready to walk
  this.Stoped = true;
  this.CurrentGait = 'creep';
  this.poseReady = 0;
  this.PoseIndex = 0;
  this.StepCounter = 0;

  //get the first frame
  this.GaitPose(this.gaits[this.CurrentGait][0],null);
}

/**
 * GaitPose initialize a the movement towards the first pose of the gait
 *
 * @param {Object} pose
 * A pose structure, typically the first in the current gait
 *
 * @param {Callback} callback
 * Method to call when the pose is completed
 *
 */
Felix.prototype.GaitPose = function(pose,callback)
{
  this.GaitPoseCallback = callback;
  this.CurrentPose = JSON.parse(JSON.stringify(pose)); //deep copy 
  this.GaitPosing();
}

/**
 * GaitPosing is the recurring method that goes trough each leg 
 * to complete the pose
 *
 * @param {Callback} callback
 * Method to call the the posing leg is completed
 *
 */
Felix.prototype.GaitPosing = function(callback)
{
  if(this.CurrentPose.length == 0)
  {
    if(this.GaitPoseCallback) this.GaitPoseCallback();
    return;
  }
  var p = this.CurrentPose.shift();
  this[p.leg].GaitPose(p.pose,this.GaitPosing.bind(this));
}

/**
 *  Walk gets Felix moving, the parameters the direction and speed
 *
 *  @param {Number} x 
 *  This can be a number between -10 and +10
 *  With a value of 0 Felix will try to walk straight.
 *  Values above 0 make Felix walk to the right.
 *  Values below 0 make him walk to the left.
 *  Values longer from 0 result in a sharper turn
 *
 *  @param {Number} y
 *  This can be a number between -10 and +10
 *  With a value of 0 Felix will step on the spot
 *  Values above 0 make Felix walk forward
 *  Values below 0 makes him walk backward.
 *  Values longer from 0 result in increased step size/speed 
 */
Felix.prototype.Walk = function(x,y)
{
  console.log("-----------WALK----------");
  console.log("X:"+ x +" Y:"+ y);

  //update the step size and direction based on the parameters
  if(typeof y != 'undefined')
  {
    var xa = Math.abs(y).map(0,10,1,35);
    var sp = Math.abs(y).map(0,10,4,7);
    

    var turn_left = 0;
    var turn_right = 0;

    if(typeof x != 'undefined')
    {
      x = x.map(-10,10,-15,15);

      if(x > 0) //turn right
      {
        console.log('-> TURN RIGHT ->');
        turn_right = x * -1;
        turn_left = x;
      }
      if(x < 0) //turn left
      {
        console.log('<- TURN LEFT <-');
        turn_left = x;
        turn_right = Math.abs(x);
      }
    }
    
    this.fps = sp;
    this.direction = (y < 0)? 'backward':'forward';

    var step = {
                BR:(xa + turn_right),FR:(xa + turn_right),
                BL:(xa + turn_left),FL:(xa + turn_left)
               };

    this.BR.step.size.x = step.BR;
    this.FR.step.size.x = step.FR;

    this.BL.step.size.x = step.BL;
    this.FL.step.size.x = step.FL;

    console.log('Direction:'+ (y < 0)? 'backward':'forward');
    console.log('STEP FR:'+ step.FR +' BR:'+ step.BR +' FL:'+ step.FL +' BL:'+ step.BL);
    console.log('Speed:'+ sp);
    console.log('-----------------');
  }

  if(this.Stoped)
  {
    this.Stoped = false;
    this.Step();
  }
  
}

/**
 * Stop halt the Felix's movements
 */
Felix.prototype.Stop = function()
{
  console.log('Stopping...');
  this.Stoped = true;
}

/**
 * UpdatePoseIndex, based on Felix direction this method increase
 * or decreases the PoseIndex property
 */
Felix.prototype.UpdatePoseIndex = function()
{
  this.PoseIndex = (this.direction == 'forward')? this.PoseIndex + 1: this.PoseIndex - 1;
  if(this.PoseIndex >= this.gaits[this.CurrentGait].length) this.PoseIndex = 0;
  if(this.PoseIndex < 0) this.PoseIndex = this.gaits[this.CurrentGait].length - 1;
}

/**
 * FindLiftingLegInPose finds out, depending on the direction,
 * wich leg in the pose is the next one to be lifted
 *
 * @param {Object} pose, list of objects with a leg id and a pose index  
 */
Felix.prototype.FindLiftingLegInPose = function(pose)
{
  for(var i=0;i < pose.length;i++)
  {
    if(pose[i].pose == ((this.direction=='forward')? 1 : 4)) return pose[i].leg;
  }
}

/**
 * Step initiates a new step sequence
 */
Felix.prototype.Step = function()
{
  if(this.Stoped) return;

  this.StepCounter++;
  this.LegCompleteStep = 0;

  this.UpdatePoseIndex();

  var pose = this.gaits[this.CurrentGait][this.PoseIndex];
  var lifting_left = this.FindLiftingLegInPose(pose);

  for(var i=0;i < pose.length;i++)
  {
    //is this leg on the oposite side of the lifting leg
    var isOpositeLeg = (lifting_left.substr(1) != pose[i].leg.substr(1));
    this[pose[i].leg].StepPose(pose[i].pose,isOpositeLeg,this.StepCompleted.bind(this));
  }
}

/**
 * StepCompleted is called by each leg when they complete a step cycle
 * When all four legs have reported back a new step is initiated
 */
Felix.prototype.StepCompleted = function()
{
  this.LegCompleteStep++;
  if(this.LegCompleteStep == 4){
      temporal.delay(this.stepDelay,this.Step.bind(this));
      //this.Step();
  }
}

/**
 * Calibrate utility method to check the aligment/position of the servos
 */
Felix.prototype.Calibrate = function()
{
  for(var i=0;i < this.legs.length;i++)
  {
    this.legs[i].Calibrate();
  }
}

/**
 * Utility method to map a range of values into another range
 */
Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

exports.Felix = Felix;
