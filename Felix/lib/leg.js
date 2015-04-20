var vek = require('vektor').vector;

var Leg = function(felix,id){
  this.felix = felix;
  this.id = id;
  this.granularity = 10;
  this.trajectory = [];
  this.positions = [];
  this.positionIndex = 0;
  this.currentEndPoint = null;

  this.step = { 
                offset:new vek(0,118),
                size:new vek(30,20)
              };

  this.femur = { length:58,delta:0 };
  this.tibia = { length:75,delta:0 };

};

/**
 * Setup servos for this leg
 * 
 * @param {Object} five reference to Johnny-five instance
 * @param {Object} servos object 
 */
Leg.prototype.setServos = function(five,servos){

   this.femur.servo = new five.Servo({
                                          id:"Femur",
                                          pin: servos[0],
                                          controller:'PCA9685',
                                          address: 0x40,
                                          fps: 100,
                                          isInverted: false,
                                          range:[0,180],
                                          startAt:90,
                                          specs: { speed:five.Servo.Continuous.speeds["@5.0V"] }
                                     });

    this.tibia.servo = new five.Servo({
                                      id:"Tibia",
                                      pin: servos[1],
                                      controller:'PCA9685',
                                      address: 0x40,
                                      fps: 100,
                                      isInverted: false,
                                      range:[0,180],
                                      startAt:90,
                                      specs: { speed:five.Servo.Continuous.speeds["@5.0V"] }
                                    });
};

/**
 * Home method for moving the leg to it's ready position
 */
Leg.prototype.Home = function(){
  this.Step(6);
}

Leg.prototype.Straight = function(){
  var p = JSON.parse(JSON.stringify(this.currentEndPoint)); //deep copy 
  p.y = this.step.offset.y;

  var line = {a:this.currentEndPoint,b:p};
  var steps = this.LinearTrajectory(line,false);
  this.loadTrajectory(steps);
  this._intervalId = setInterval(this.Moving.bind(this),100/ this.felix.fps);
  this.currentEndPoint = line.b;
}

Leg.prototype.Duck = function(){

  var p = JSON.parse(JSON.stringify(this.currentEndPoint)); //deep copy 
  p.y -= this.felix.TILT;
  var line = {a:this.currentEndPoint,b:p};
  var steps = this.LinearTrajectory(line,false);
  this.loadTrajectory(steps);
  this._intervalId = setInterval(this.Moving.bind(this),100/ this.felix.fps);
  this.currentEndPoint = line.b;
}


Leg.prototype.Calibrate = function(){
  this.Hip(90);
  var k = 0;
  if(this.id == 'FR' || this.id == 'BL') k = 180;
  this.Knee(k);
}

Leg.prototype.Rotations = function(hip,knee)
{
  if(!this.femur.servo) return;
  this.Knee(knee);
  this.Hip(hip);
}
Leg.prototype.Hip = function(hip)
{
  var h = hip + this.femur.delta;
  this.femur.servo.to(h);
}

Leg.prototype.Knee = function(knee)
{
  var k = knee;
  if(this.shouldBreakClockwise()) k = 90 - (180 - knee);
  k = k + this.tibia.delta;

  this.tibia.servo.to(k);
}

Leg.prototype.Moving = function()
{
  var c = this.positions[this.positionIndex];
  this.Rotations(c.hip,c.knee);
  this.positionIndex++;

  if(this.positionIndex >= this.positions.length) 
  {
    clearInterval(this._intervalId);
    if(this.callback) this.callback();
  }
}

Leg.prototype.StepPose = function(pose,isOposite,callback)
{
  var pp = this.PosePosition(pose,isOposite);
  if(pose == ((this.felix.direction == 'forward')? 1 : 4) )
  {
    this.Pin(pp,callback);
    return;
  }
  this.Drag(pp,callback);
}

Leg.prototype.GaitPose = function(pose,callback)
{
  //this.Pin(this.PosePosition(pose,null),callback);
  this.Drag(this.PosePosition(pose,null),callback);
}

Leg.prototype.PosePosition = function(pose,isOposite)
{
  var y = this.step.offset.y;
  if(isOposite) y -= this.felix.TILT;

  if(pose == 4) return { x:(this.step.size.x / 2) * -1, y:y };
  if(pose == 1) return {x:(this.step.size.x / 2), y:y };

  var half_segment = this.PoseSegmentSize() / 2; 

  if(pose == 3) return {x:(half_segment * -1), y:y };
  if(pose == 2) return {x:half_segment,y:y};
}

Leg.prototype.PoseSegmentSize = function()
{
  return this.step.size.x / 3;
}

/**
 * Pin lift the leg from the current position and pin it down at the requested position
 * calculate the trajectory and start a moving timout
 * when the trajectory is done clear the timeout and return the callback
 *
 * @param {Object} p is a point with an x and y value
 * @param {Callback} callback
 */
Leg.prototype.Pin = function(p,callback)
{
  if(this.currentEndPoint == null) this.Home();

  if(this.id == 'FL' || this.id == 'BL') p.x = p.x * -1; //mirrow the requested x for the left side

  //find the arc from the current position to the new position 
  var radX= radiusX(this.currentEndPoint.x,p.x);
  var cx = midPointX(radX,this.currentEndPoint.x,p.x); 
  var origin = new vek(cx,p.y);

  var arc =  {
                origin:origin,
                radius:new vek(radX,this.step.size.y),
                start_angle:360, 
                end_angle:180
             };
  
   var steps = this.EllipticalTrajectory(arc,false);
   if(p.x < this.currentEndPoint.x) steps.reverse();

   this.trajectory = steps;
   this.positionIndex = 0;
   this.positions = [];
   for(var i = 0; i < this.trajectory.length;i++)
   {
      var rot = this.Rot(this.trajectory[i]);
      this.positions.push(rot);
   }
   this.callback = callback;
   this._intervalId = setInterval(this.Moving.bind(this),100/ this.felix.fps);
   this.currentEndPoint = p;
}

/**
 * Drag
 * If the leg is lifted first pin it down
 * Calculate the linear trajectory from the current x to the requested position
 * start a moving timeout
 * when the trajectory is done clear the timeout and return the callback
 *
 * @param {Object} p is a point with an x and y value
 * @param {Callback} callback
 */
Leg.prototype.Drag = function(p,callback)
{
  if(this.currentEndPoint == null) this.Home();

  if(this.id == 'FL' || this.id == 'BL') p.x = p.x * -1; //mirrow the requested x for the left side

  var line = {a:new vek(this.currentEndPoint.x,p.y),b:new vek(p.x,p.y)};
  var steps = this.LinearTrajectory(line,false);

  if(p.x < this.currentEndPoint.x) steps.reverse();
  
  this.loadTrajectory(steps);
  this.callback = callback;
  this._intervalId = setInterval(this.Moving.bind(this),100/ this.felix.fps);
  this.currentEndPoint = line.b;
}

Leg.prototype.loadTrajectory = function(steps)
{
  this.trajectory = steps;
  this.positionIndex = 0;
  this.positions = [];
  for(var i = 0; i < this.trajectory.length;i++)
  {
      var rot = this.Rot(this.trajectory[i]);
      this.positions.push(rot);
  }
}

Leg.prototype.Step = function(idx)
{
  //  6 step 
  //           |  3  |
  //       2            4 
  //     |                 |
  //   |                     |
  //  1---------- 6 ----------5
  if(idx < 1) idx = 1;
  if(idx > 6) idx = 6;

  this.step.idx = idx;
  this.currentEndPoint = this.pointForStep(idx);
  var rot = this.IK(new vek(0,0),this.currentEndPoint,
                    this.femur.length,this.tibia.length,
                    this.shouldBreakClockwise());
  this.Rotations(rot.hip,rot.knee);
}

Leg.prototype.Rot = function(point)
{
  return this.IK(new vek(0,0),point,this.femur.length,this.tibia.length,this.shouldBreakClockwise());
}

Leg.prototype.shouldBreakClockwise = function()
{
  if(this.id =='FR') return false;
  if(this.id =='BR') return true;
  false;
}

Leg.prototype.pointForStep = function(idx)
{
  var v = new vek(this.step.offset.x,this.step.offset.y);
  if(idx == 6) return v;
  if(idx == 5) 
  {
      v.x = v.x + (this.step.size.x / 2);
      return v;
  }

  if(idx == 4) 
  {
      v.x = v.x + ((this.step.size.x / 2) - (this.step.size.x / 4));
      v.y = v.y - (this.step.size.y / 2);
      return v;
  }

  if(idx == 3) 
  {
      v.y = v.y - this.step.size.y;
      return v;
  }

  if(idx == 2) 
  {
      v.x = v.x - ( this.step.size.x / 4);
      v.y = v.y - (this.step.size.y / 2);
      return v;
  }
  if(idx == 1)
  {
      v.x = v.x - (this.step.size.x / 2);
      return v;
  }
}

Leg.prototype.EllipticalTrajectory = function(arc,skip_start_point)
{
      var steps = [];

      //divide the angles int the required number of points
      //decrease the granularity one step to be able to include the end point
      var skip = (skip_start_point)? 0:1;
      var step_size = (arc.end_angle - arc.start_angle) / (this.granularity - skip);
      var c_angle = arc.start_angle;
      
      if(skip_start_point) c_angle+= step_size;
      
      for(var i=0;i < this.granularity;i++)
      {
        var x = arc.origin.x + arc.radius.x * Math.cos(Math.radians(c_angle));
        var y = arc.origin.y + arc.radius.y * Math.sin(Math.radians(c_angle));

        steps.push(new vek(x,y));
        c_angle+= step_size;
      }
      //if(this.id == 'FR' || this.id == 'BR') steps.reverse();
      steps.reverse();
      return steps;
}

Leg.prototype.LinearTrajectory = function(line,skip_start_point)
{
    var steps = [];
    var granularity = this.granularity;

    //find the slope/delta
    var delta_x = line.b.x - line.a.x;
    var delta_y = line.b.y - line.a.y;

    //calculate the distance between the two points
    var distance = Math.sqrt( ((delta_x) * (delta_x)) + ((delta_y) * (delta_y)) );

    //divide the line int the required number of points
    //decrease the granularity one step to be able to include the end point
    var skip = (skip_start_point)? 0:1;

    //var step_size = distance / (this.granularity  - skip);
    var step_size = distance / (granularity - skip);
    var c_step = (skip_start_point)? step_size:0;

    for(var i=0;i < granularity;i++)
    {
        var inc = c_step / distance;
        var x = line.a.x + (inc * delta_x);
        var y = line.a.y + (inc * delta_y);

        steps.push(new vek(x,y));
        c_step+= step_size;
     }
     //if(this.id == 'FR' || this.id == 'BR') steps.reverse();
     //steps.reverse();
     return steps; 
}

Leg.prototype.IK = function(P1,P2,L1,L2, break_clockwise)
{
   //console.log('P1:'+ P1 +',P2:'+ P2 +',L1:'+ L1 +',L2:'+ L2 +',break:'+ break_clockwise);

   var H1 = Math.abs(P2.x - P1.x);
   var H2 = Math.abs(P2.y - P1.y);

   //console.log('H1:'+ H1 +',H2:'+ H2);

   var K = Math.sqrt(Math.pow(H1,2) + Math.pow(H2,2));

   //console.log('K:'+ K);

   if( K > (L1 + L2 )) K = L1 + L2;

   //console.log('K:'+ K);
  
   var L2POW = Math.pow(L2,2);
   var L1POW = Math.pow(L1,2);
   var KPOW = Math.pow(K,2);

   var A1_a = L2POW + L1POW - KPOW; 
   var A1_b = 2 * L1 * L2;
   var A1_c = A1_a / A1_b;
   var A1 = Math.acos(rounded(A1_c)); 

   //console.log('A1:'+ Math.degrees(A1));
   
   //var A1 = Math.acos(( L2POW + L1POW - KPOW ) / (2 * L1 * L2) );

   var A2_a = KPOW + L1POW - L2POW;
   var A2_b = 2 * K * L1;
   var A2_c = A2_a / A2_b;
   var A2 = Math.acos(rounded(A2_c));

   //console.log('A2:'+ Math.degrees(A2));

   //var A2 = Math.acos(( Math.pow(K,2) + Math.pow(L1,2) - Math.pow(L2,2)) / (2 * K * L1) );
   var A3 = Math.atan(H1/H2);

   //console.log('A3:'+ Math.degrees(A3));

   var A4 = 0;

   if(P2.x >= P1.x) //the endpoint is to the right of the origin 
   {
      //console.log('Endpoint to the right of the origin');

      if(break_clockwise)
      {
        //console.log('Break clockwise');
        A4 = (Math.PI/2) - (A2 + A3);
        //A1 = (Math.PI - A1) + A4; //translate knee rotation, so 0 begins at 3 o'clock
        A1 = ((Math.PI * 2) - (Math.PI/2)) - A1; // 270 - A1
      }
      else
      {
        //console.log('Break counterclockwise');
        A4 = Math.PI - (((Math.PI/2) - A2) + A3);
        
        if(this.id == 'BR' || this.id == 'FL')
        {
            A4 = (Math.PI/2) - (A2 + A3);
            A1 = Math.PI - A1;
        }

        //console.log('A4:'+ Math.degrees(A4));
        //console.log('A2:'+ Math.degrees(A2) +',A3:'+ Math.degrees(A3));

      }
   }
   else
   {
      //console.log('Endpoint to the left of the origin');
      //console.log('A2:'+ Math.degrees(A2) +',A3:'+ Math.degrees(A3));

      if(break_clockwise)
      {
        //console.log('Break clockwise');
        A4 = (Math.PI/2) - (A2 - A3);
        //A1 = (Math.PI - A1) + A4; //translate knee rotation, so 0 begins at 3 o'clock
        A1 = ((Math.PI * 2) - (Math.PI/2)) - A1; // 270 - A1
      }
      else
      {
        //console.log('Break counterclockwise');
        A4 = Math.PI - (A2 + A3);
        //console.log('A2:'+ Math.degrees(A2) +',A3:'+ Math.degrees(A3));

        if(this.id =='BR' || this.id == 'FL') 
        {
          A4 = (Math.PI/2) - (A2 - A3);
          A1 = Math.PI - A1;
        }

        if(this.id == 'BL' || this.id == 'FR')
        {
          A4 = (Math.PI/2) + (A2 + A3);
        }

        ///A1 = A1 - (Math.PI/2); //translate knee rotation, so 0 begins at 3 o'clock
        //A1 = A1 + Math.radians(20); //translate knee rotation, so 0 begins at 1 o'clock

      }
   }

   var knee = Math.degrees(A1);
   var hip = Math.degrees(A4);
   return {'hip':Math.round(hip),'knee':Math.round(knee)};
}

Math.degrees = function(rad)
{
 return rad*(180/Math.PI);
}
 
Math.radians = function(deg)
{
 return deg * (Math.PI/180);
}

function rounded(x)
{
    return Math.round(x * 100)/100;
}

function radiusX(x1,x2)
{
  var cx = (x1 > x2)? x1 - x2: x2 - x1;
  cx = cx  / 2;
  return cx;
}

function midPointX(cx,x1,x2)
{
  var dx = (x1 > x2)? x2 + cx: x1 + cx;
  return dx;
}

exports.Leg = Leg;
