//Originally designed to run once all the way through
//Needs to be improved such that you can go back and forth and not eat up memory (bc it re does whole routine each time its run)
var state = 1;
var lastState=1;
var lines = [];
var radiusIC = [];
var inCenter = [];
var medLines = [];
var linesAb = [];
var medLinesAb = [];
var dPoints = [];
var maxDist=0;
var yolk;
var instrText;
var rButton, nButton, bButton;
var isDrawn = false;
var VSIZE = 500;
var HSIZE = 500;
var BKGRND = 100;
var TEXTSIZE = 13;


function setup() {
  background(BKGRND);
  createCanvas(HSIZE, VSIZE);
}
function draw() {
  textSize(TEXTSIZE);  
  stroke("red");
    switch(state) {
        case -1:
          //do nothing
          break;
        case 0:
          instrText="Data points cleared."
          resetState();
          changeState();
          break;
      case 1:
          drawPoints();
          instrText="Click on screen and draw at least 3 points";
          break;
      case 2:
          drawPoints();
          allHype();
          instrText="Extremal hyperplanes B=2";
          state=-1;
          break;
      case 3:
          drawPoints();
          medHype();
          instrText="Extremal MEDIAN hyperplanes B=2";
          state=-1;
          break;
      case 4:
          drawPoints();
          allAbHype();
          instrText="Arbitrary extremal hyperplanes B=1";
          state=-1;
          break;
      case 5:
          drawPoints();
          medAbHype();
          instrText="Arbitrary extremal MEDIAN hyperplanes B=1";
          state=-1;
          break;  
      case 6:
          instrText="EMH B=1 in red and B=2 in blue"
          stroke("red");
          medAbHype();
          stroke("blue");
          medHype();
          stroke("black");
          drawPoints();
          state=-1;
          break;  
      case 7:
          instrText="For each 3-tuple of EMH, find incenter"
          drawPoints();
          findInCenters();
          displaySingleInCenter();
          state=-1;
          break;
      case 8:
          instrText="Within this set is the yolk center";
          drawPoints();
          strokeWeight(0.5);
          stroke('red');
          medHype();
          drawInCenters();
          state=-1;
          break;
      case 9:
          instrText="Yolk center is max distance between EMH and e in E"
          drawPoints();
          findFurthestE();
          medHype();
          strokeWeight(3);
          drawYolk();
          state=-1;
          break;
      case 10:
          instrText="Click Next or Reset to retry"
          drawPoints();
          strokeWeight(1);
          stroke('red');
          medAbHype();
          medHype();
          strokeWeight(3);
          drawYolk();
          state=-1;
          break;  
      default:
          instrTest= "Unknown error. Reset. Notify me at gs3018@nyu.edu if you'd like"
          break;
  }
    resetButton();
    nextButton();
    backButton();
    drawText(instrText);
}
function drawText(textIn){
  fill("white");
  noStroke();
  rect (90,0,330,30)
  noStroke();
  fill(50);
  text(textIn,100,15);
}
function drawPoints(){
  strokeWeight(5);
    for (let i=0;i<dPoints.length;i++){
      point(dPoints[i][0],dPoints[i][1]);
    }
}
function nextButton(){
  nButton=createButton("Next");
  nButton.position(0,0);
  nButton.mousePressed(changeState);
}
function backButton(){
  bButton=createButton("Back");
  bButton.position(HSIZE-50,0);
  bButton.mousePressed(backState);
}
function resetButton(){
  rButton=createButton("Reset");
  rButton.position(HSIZE-50,VSIZE-50);
  rButton.mousePressed(resetState);
}
function resetState(){
  clear();
  state = 0;
  lastState=0;
  setup();
  isDrawn = false;
  lines = [];
  radiusIC = [];
  inCenter = [];
  medLines = [];
  linesAb = [];
  medLinesAb = [];
  dPoints = [];
  maxDist=0;
}
function backState(){
  if (lastState>=0){
  clear();
  lastState-=1;
  state=lastState;
  isDrawn=false;
  }
}
function changeState(){
  if((lastState === 1)&&(dPoints.length<3)){
    return;
  }
  clear();
  lastState+=1;
  state=lastState;
  if (lastState>=11){
    resetState();
  }
  isDrawn=false;
  runOnce=false;
}
function mouseClicked(){
  if ( (state === 1) && (mouseY>30 ) && (mouseY<(VSIZE-70))){
    dPoints.push([mouseX,mouseY]);
  }
  runOnce=false;
}
function allHype(){
    lines=[];
    for (let i=0;i<dPoints.length;i++){
        for (let j=0;j<dPoints.length &&i>j;j++){
          let x1=dPoints[i][0];
          let y1=dPoints[i][1];
          let x2=dPoints[j][0];
          let y2=dPoints[j][1];
          let denom=(x2-x1);
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          if (denom===0){denom+=0.00001;}
          strokeWeight(1);
          line (HSIZE,(HSIZE*slope)+b,0,b);
          lines.push([slope,b,i,j]);
        }
      }
}
function medHype(){
  //clear each time.
  medLines=[];
  for (let i=0;i<lines.length;i++){
    let above=2;
    let below=2;
    let threshold=ceil(dPoints.length/2);
    for (let q=0;q<dPoints.length;++q){
        if ((q!=lines[i][2]) && (q!=lines[i][3])){ //if not the points created
          let xTest=dPoints[q][0];
          let yTest=dPoints[q][1];
          let yLine=(lines[i][0]*xTest)+lines[i][1];
          if (yLine<=yTest){
            above+=1;//point above line
            }
          else{
            below+=1;}
        }
    }
    if ((above>=threshold)&&(below>=threshold)){
        strokeWeight(1);
        line(HSIZE,(HSIZE*lines[i][0])+lines[i][1],0,lines[i][1]);
        medLines.push(lines[i]);
        }
  }
}
function allAbHype(){
  linesAb=[];
  for (let i=0;i<dPoints.length;i++){    
       for (let j=0; j<dPoints.length;++j){ //a little higher
          if (i!=j){
          let x1=dPoints[i][0];
          let y1=dPoints[i][1];
          let x2=dPoints[j][0];
          let y2=dPoints[j][1]+50;
          let denom=(x2-x1);
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          if (denom===0)
          {denom+=0.00001;}
          strokeWeight(1);
          line (HSIZE,(HSIZE*slope)+b,0,b);
          linesAb.push([slope,b,i,j]);         
          for (let q=2;q<5;++q){
            y2=dPoints[j][1]+(50*q);
            slope= (y2-y1)/denom;
            b=y1-(slope*x1);
            strokeWeight(1);
            line (HSIZE,(HSIZE*slope)+b,0,b);
            linesAb.push([slope,b,i,j]);
          }
          }
                  
     }
    
      for (let j=0; j<dPoints.length;++j){ //a little lower
          if (i!=j){
          let x1=dPoints[i][0];
          let y1=dPoints[i][1];
          let x2=dPoints[j][0];
          let y2=dPoints[j][1]-50;
          let denom=(x2-x1);
          let slope= (y2-y1)/denom;
          let b=y1-(slope*x1);
          if (denom===0)
          {denom+=0.00001;}
          strokeWeight(1);
          line (HSIZE,(HSIZE*slope)+b,0,b);
          linesAb.push([slope,b,i,j]);         
          for (let q=2;q<5;++q){
            y2=dPoints[j][1]-(50*q);
            slope= (y2-y1)/denom;
            b=y1-(slope*x1);
            strokeWeight(1);
            line (HSIZE,(HSIZE*slope)+b,0,b);
            linesAb.push([slope,b,i,j]);
          }
          }
      }            
     }

}
function medAbHype(){
  medLinesAb=[];
  for (let i=0;i<linesAb.length;++i){
          let above=1;
          let below=1;
          let threshold=ceil(dPoints.length/2);
      for (let q=0;q<dPoints.length;++q){
          if (q!=linesAb[i][2]){
            let xTest=dPoints[q][0];
            let yTest=dPoints[q][1];
            let yLine=(linesAb[i][0]*xTest)+linesAb[i][1];
            if (yLine<=yTest){ //point is above
                above+=1;
            }
            else{
              below+=1;}
          }
      }
      if ((above>=threshold)&&(below>=threshold)){
        strokeWeight(1);
        line(HSIZE,(HSIZE*linesAb[i][0])+linesAb[i][1],0,linesAb[i][1]);
        medLinesAb.push(linesAb[i]);
      }
    }
}
function findInCenters(){
  radiusIC=[];
  inCenter=[];
  let count=0;
    for (let i=0;i<medLines.length-2;i++){
      for (let h=i+1;(h<medLines.length);h++){
          for (let k=h+1;(k<medLines.length );k++){
            count+=1;
            if (count>50000){//controls runaway memory
              //console.log("S*** Sandwich")
              return;
            }
              let point1=findInter(medLines[i],medLines[h]);
              let point2=findInter(medLines[i],medLines[k]);
              let point3=findInter(medLines[h],medLines[k]);
            inCenterSub(point1,point2,point3);
          }
        } 
    }
}
function findInter(line1 , line2){
  let a=line1[0]; //slope
  let b=line2[0];
  let c=line1[1]; //inter
  let d=line2[1]; //
  if ((a-b) === 0)
    {
      a+=0.0000001;
    }
  let x=((d-c)/(a-b)).toFixed(8);
  let y=((d-c)/(a-b)).toFixed(8);
  y=a*y;
  y=y+c;
  return [x,y];
}
function inCenterSub(point1, point2, point3){
  side1=distance(point1,point2);
  side2=distance(point1,point3);
  side3=distance(point2,point3);
  xSum=(point3[0]*side1)+(point2[0]*side2)+(point1[0]*side3);
  ySum=(point3[1]*side1)+(point2[1]*side2)+(point1[1]*side3);
  let xCoord=xSum/(side1+side2+side3);
  let yCoord=ySum/(side1+side2+side3);
  let distanceCal=distanceICR(point1,point2,[xCoord,yCoord]);
  if (distanceCal>0){//bug with calculating intersections
  radiusIC.push(distanceCal);
  inCenter.push([xCoord,yCoord]);  
  }
  
}
function displaySingleInCenter(){
  strokeWeight(1);
  stroke('red');
  line(HSIZE,(HSIZE*medLines[0][0])+medLines[0][1],0,medLines[0][1]);
  line(HSIZE,(HSIZE*medLines[1][0])+medLines[1][1],0,medLines[1][1]);          
  line(HSIZE,(HSIZE*medLines[2][0])+medLines[2][1],0,medLines[2][1]);
  strokeWeight(5);
  stroke('green');
  point(inCenter[0][0],inCenter[0][1]);
  strokeWeight(1);
  stroke('green');
  noFill();
  circle(inCenter[0][0],inCenter[0][1],radiusIC[0]*2)
}
function distance(point1, point2){
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
function distanceICR(point1, point2, point3){
  let x1=point1[0];
  let y1=point1[1];
  let x2=point2[0];
  let y2=point2[1];
  let x0=point3[0];
  let y0=point3[1];
  let num= abs(((x2-x1)*(y1-y0)) -(x1-x0)*(y2-y1))
  let denom=Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2));
  if (denom===0){
    denom+=0.000000001;
  }
  return num/denom;
}
function drawInCenters(){
  strokeWeight(5);
  stroke('green');
  for (let i=0;i<inCenter.length;++i){
      point(inCenter[i][0],inCenter[i][1]);
    }
}
function findFurthestE(){
 for (let i=0; i<inCenter.length;i++){
     for (let j=0; j<medLines.length;++j){
         let localDist=distLineE(medLines[j],inCenter[i]);
         if (localDist>maxDist)
           {
             maxDist=localDist;
             yolk=inCenter[i];
           }
       }

   }
}
function distLineE(line, point){
  let x0=point[0];
  let y0=point[1];
  let a=-1*line[0];
  let b= 1;
  let c=-1*line[1];
  let num=Math.abs((a*x0)+(b*y0)+c);
  let denom= Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
  return (num/denom);
}
function drawYolk(){
      stroke('green');
      point(yolk[0], yolk[1]);
      noFill();
      circle(yolk[0], yolk[1], maxDist*2)
}
