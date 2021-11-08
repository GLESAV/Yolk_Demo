let button;
let text_des;
var xpoints = [];
var ypoints = [];
var genpoints=[];
var lines=[];
var lines_b_1=[];
var med_lines=[];
var med_lines_b_1=[];
var mx,my;
var state=1;
var inCenter=[];
var radiusIC=[];
var yolk=[];
var max_dist=0;
var completed;
var is_drawn=false;
var run_once=false;


function setup() {
  background(100);
  createCanvas(400, 400);
  completed=0;
}

function instr_text(){
textSize(13);
  if (state===1)
    {
      text_des='Click on screen and draw points';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
  else if (state===0)
    {
      text_des='<-----Click again to start';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
    else if (state===-1)
    {
      text_des='Points cleared. ';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
  else if (state===2)
    {
      text_des='Extremal hyperplanes';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
   else if (state===3)
    {
      text_des='Extremal median hyperplanes B=2';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
    else if (state===4)
    {
      text_des='Arbitrary extremal hyperplanes B=1';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
      else if (state===5)
    {
      text_des='Arbitrary Extremal median hyperplanes B=1';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
        else if (state===6)
    {
      text_des='B=1 and B=2';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
          else if (state===7)
    {
      text_des='for each 3-tuple of EMH, find incenter';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
            else if (state===8)
    {
      text_des='Within this set there is the yolk center';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
            else if (state===9)
    {
      text_des='Yolk center is max dist between EMH and e in E';
      fill(50);
      noStroke();
      text(text_des,150,15);
    }
  
  
}

function startButton()
{
  button = createButton('State: '+state+' Next');
  button.position(0, 0);
  button.mousePressed(changeState);
}

function resetButton()
{
  resbutton = createButton('Reset');
  resbutton.position(300, 300);
  resbutton.mousePressed(resetState);
}
function resetState()
{
  clear();
  state=-1;
  background(100);
  createCanvas(400, 400);
  completed=0;
  xpoints = [];
  ypoints = [];
  genpoints=[];
  lines=[];
  lines_b_1=[];
  med_lines=[];
  med_lines_b_1=[];
inCenter=[];
  radiusIC=[];
  yolk=[];
  max_dist=0;
  button = createButton('State: '+state+' Next');
  button.position(0, 0);
  is_drawn=false;
  run_once=false;
  
}
function changeState()
{
  state+=1;
  clear();
  button = createButton('State: '+state+' Next');
  button.position(0, 0);
  is_drawn=false;
  run_once=false;
}

function mouseClicked() {
  if ((state===1)&&mouseY>30)
    {
      //collect points
      mx=mouseX;
      my=mouseY;
      xpoints.push(mx);
      ypoints.push(my);
      genpoints.push([mx,my]);
    }
}

function draw() {

  
    if (state<=7)
      {
        drawPoints();
      }
    if (state>=10)
      {
         strokeWeight(1);
        stroke('red');
        medHyp_b_1();
        medHype();
        draw_yolk();
      }
    if ((state===2)&&(run_once===false))
      {allHyp();
      run_once=true;}
    if ((state===3)&&(run_once===false))
      {
        medHype();
        run_once=true;
      }
    if ((state===4)&&(run_once===false))
      {
        allhyp_b_1();
        run_once=true;
      }
        if ((state===5)&&(run_once===false))
      {
        medHyp_b_1();
        run_once=true;
      }
          if ((state===6)&&(run_once===false))
      {
        medHyp_b_1();
        medHype();
        run_once=true;
      }
              if ((state===7)&&(run_once===false))
      {
        bf_findIncenters();
        state_seven();
        run_once=true;
      }
            if ((state===8)&&(run_once===false))
      {
        drawInCenters();
        strokeWeight(.5);
        stroke('red');
        medHype();
        run_once=true;
      }
              if ((state===9)&&(run_once===false))
      {
         find_furthest_e();
        draw_yolk();
        run_once=true;
      }
      //         if (state>=7)
      // {
      //    // bf_findIncenters();
      //   state_seven();
      //  // drawInCenters();
      //   // run_once=true;
      // }
 
 
  
    if (is_drawn===false)
    {

    startButton();
    resetButton();
    instr_text(); 
    is_drawn=true;
    }


}

function allhyp_b_1(){
    for (let i=0;i<xpoints.length;++i)
    {
      
      //a little bit higher
      for (let j=0; j<xpoints.length;++j)
        {
          if (i!=j){
          let x1=genpoints[i][0];
          let y1=genpoints[i][1];
          let x2=genpoints[j][0];
          let y2=genpoints[j][1]+50;
          let denom=(x2-x1);
          if (denom===0)
            {denom+=.00001};
          
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          strokeWeight(1);
          line (400,(400*slope)+b,0,b);
          lines_b_1.push([slope,b,i,j]);
            
            
          for (let q=2;q<5;++q)
            {
          y2=genpoints[j][1]+(50*q);
          slope= (y2-y1)/denom;
          b=y1-(slope*x1);
          strokeWeight(1);
          line (400,(400*slope)+b,0,b);
          lines_b_1.push([slope,b,i,j]);
            }
          }
        }
      
      
      //a little bit lower
      
      for (let j=0; j<xpoints.length;++j)
        {
          if (i!=j){
          let x1=genpoints[i][0];
          let y1=genpoints[i][1];
          let x2=genpoints[j][0];
          let y2=genpoints[j][1]-50;
          let denom=(x2-x1);
          if (denom===0)
            {denom+=.00001};
          
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          strokeWeight(1);
          line (400,(400*slope)+b,0,b);
          lines_b_1.push([slope,b,i,j]);
            
                        
          for (let q=2;q<5;++q)
            {
          y2=genpoints[j][1]-(50*q);
          slope= (y2-y1)/denom;
          b=y1-(slope*x1);
          strokeWeight(1);
          line (400,(400*slope)+b,0,b);
          lines_b_1.push([slope,b,i,j]);
            }
   
          }
        }            
    }
  
}

function medHyp_b_1(){
  for (let i=0;i<lines_b_1.length;++i)
    {
          //console.log("on iteration"+i);
          let above=1;
          let below=1;
          // console.log("length of points are: "+genpoints.length+"\n" );
          let threshold=ceil(genpoints.length/2);
          // console.log("the threshold is " +threshold);
          
      
      
      
      
      for (let q=0;q<genpoints.length;++q)
        {
          if (q!=lines_b_1[i][2])//not the points created
          {
            //console.log("this is the line: "+lines_b_1[i]);
            let x_test=genpoints[q][0];
            let y_test=genpoints[q][1];
            let y_line=(lines_b_1[i][0]*x_test)+lines_b_1[i][1];
            if (y_line<=y_test)//the point is above the line
              {
                above+=1;
              }
            else
              {below+=1;}
          }
          
        }
           if ((above>=threshold)&&(below>=threshold))
          {
            strokeWeight(1);
            line(400,(400*lines_b_1[i][0])+lines_b_1[i][1],0,lines_b_1[i][1]);
          med_lines_b_1.push(lines_b_1[i]);
          }
    }
}


//brute force finding med hyp
function allHyp(){
  for (let i=0;i<xpoints.length;++i)
    {
      for (let j=0; j<xpoints.length && i>j;++j)
        {
          let x1=genpoints[i][0];
          let y1=genpoints[i][1];
          let x2=genpoints[j][0];
          let y2=genpoints[j][1];
          let denom=(x2-x1);
          if (denom===0)
            {denom+=.00001};
          
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          strokeWeight(1);
          line (400,(400*slope)+b,0,b);
          lines.push([slope,b,i,j]);
        
        }
    }
  
}

//display only median hyperplanes b=2
function medHype(){
  for (let i=0;i<lines.length;++i)
    {
          //console.log("on iteration"+i);
          let above=2;
          let below=2;
          // console.log("length of points are: "+genpoints.length+"\n" );
          let threshold=ceil(genpoints.length/2);
          // console.log("the threshold is " +threshold);
          
      
      
      
      
      for (let q=0;q<genpoints.length;++q)
        {
          if ((q!=lines[i][2]) && (q!=lines[i][3]))//not the points created
          {
            //console.log("this is the line: "+lines[i]);
            let x_test=genpoints[q][0];
            let y_test=genpoints[q][1];
            let y_line=(lines[i][0]*x_test)+lines[i][1];
            if (y_line<=y_test)//the point is above the line
              {
                above+=1;
              }
            else
              {below+=1;}
          }
          
        }
           if ((above>=threshold)&&(below>=threshold))
          {
            strokeWeight(1);
            line(400,(400*lines[i][0])+lines[i][1],0,lines[i][1]);
          med_lines.push(lines[i]);
          }
    }
}
function inCenter_finder(point1, point2, point3){
  
  side1=distance(point1,point2);
  side2=distance(point1,point3);
  side3=distance(point2,point3);
  
  x_sum=(point3[0]*side1)+(point2[0]*side2)+(point1[0]*side3);  y_sum=(point3[1]*side1)+(point2[1]*side2)+(point1[1]*side3);
  let x_coord=x_sum/(side1+side2+side3);
  let y_coord=y_sum/(side1+side2+side3);
  
  radiusIC.push(distance_ICrad(point1,point2,[x_coord,y_coord]));
  inCenter.push([x_coord,y_coord]);
  
}
function bf_findIncenters(){
  
  
  // console.log("after =" +med_lines.length);
  
//   for (let i=0;i<med_lines_b_1.length;i++)
// {
//   med_lines.push(med_lines_b_1[i]);
// }
  //one big array



  
//              line(400,(400*med_lines[2][0])+med_lines[2][1],0,med_lines[2][1]);
  
  
  //all the 3 tuples of lines
  for (let i=0;i<med_lines.length;++i)
    {
      // console.log("this is i" +i);
      for (let h=i+1;(h<med_lines.length);++h)
        {
          // console.log("this is h" +h);
          
          for (let k=h+1;(k<med_lines.length );++k)
            {
                let point1=find_inter(med_lines[i],med_lines[h]);
                let point2=find_inter(med_lines[i],med_lines[k]);
                let point3=find_inter(med_lines[h],med_lines[k]);
                inCenter_finder(point1,point2,point3);
                
              
            }
            
        }
      
    }
}

function distance_ICrad(point1,point2,point3)
{
  let x1=point1[0];
  let y1=point1[1];
  let x2=point2[0];
  let y2=point2[1];
  
  let x0=point3[0];
  let y0=point3[1];
  
  let num= abs(     ((x2-x1)*(y1-y0)) -(x1-x0)*(y2-y1))
  let denom=Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2))   ;
  return num/denom;
  
}
function distance(point1,point2){
  
  let x=point1[0];
  let y=point1[1];
  let x2=point2[0];
  let y2=point2[1];
  
  let side1=x-x2;
  side1=side1*side1;
  let side2=y-y2;
  side2=side2*side2;
  
  let side3=side1+side2;
  side3=Math.sqrt(side3);
  return side3;
}
function find_inter(line1, line2){
  let a=line1[0]; //slope
  let b=line2[0];//
  let c=line1[1]; //inter
  let d=line2[1]; //
  let x=((d-c)/(a-b)).toFixed(50);
  let y=((d-c)/(a-b)).toFixed(50);
  console.log(a);
  console.log(b);
  console.log(c);
  console.log(d);
  y=a*y;
  y=y+c;
  return [x,y];
}


function drawPoints(){
  strokeWeight(5);
  stroke('red');
  for (let i=0;i<genpoints.length;++i)
    {
      // point(xpoints[i],ypoints[i]);
      point(genpoints[i][0],genpoints[i][1]);
    }
  
}

function state_seven(){
                  strokeWeight(1);
  stroke('red');
  
             line(400,(400*med_lines[0][0])+med_lines[0][1],0,med_lines[0][1]);
  
             line(400,(400*med_lines[1][0])+med_lines[1][1],0,med_lines[1][1]);
            
               line(400,(400*med_lines[2][0])+med_lines[2][1],0,med_lines[2][1]);
  
  strokeWeight(5);
  stroke('green');

      point(inCenter[0][0],inCenter[0][1]);
      strokeWeight(1)
      noFill();
      circle(inCenter[0][0],inCenter[0][1],radiusIC[0]*2)
  
  
}

function drawInCenters(){
  strokeWeight(5);
  stroke('green');
  for (let i=0;i<inCenter.length;++i)
    {
      // point(xpoints[i],ypoints[i]);
      // console.log("on interaction"+i+" we see point have x: "+ inCenter[i][0]+ "and have y of " + inCenter[i][1]);
      point(inCenter[i][0],inCenter[i][1]);

    }

}

function find_furthest_e(){

 for (let i=0; i<inCenter.length;i++)
   {
     for (let j=0; j<med_lines.length;++j)
       {
         let local_dist=dist_line_e(med_lines[j],inCenter[i]);
         
         
         
         if (local_dist>max_dist)
           {
             max_dist=local_dist;
             yolk=inCenter[i];
             console.log("SOMETHING: "+max_dist);
           }
       }
     
   }
  
  
  
  
}

function dist_line_e(line, point){
  let x0=point[0];
  let y0=point[1];
  let a=-1*line[0];
  let b= 1;
  let c=-1*line[1];
  
  let num=Math.abs((a*x0)+(b*y0)+c);
  let denom= Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
  return (num/denom);
  
}
function draw_yolk(){
  
      strokeWeight(7);
  stroke('green');
    point (yolk[0],yolk[1]);
  
      strokeWeight(5)
      point(yolk[0],yolk[1]);
      strokeWeight(1)
      noFill();

      circle(yolk[0],yolk[1],max_dist*2)
      console.log("WE IN IT");
    
}
