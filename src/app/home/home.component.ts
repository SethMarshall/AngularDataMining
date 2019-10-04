import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Circle } from '../Circle';

const ITERATIONS: number = 4;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  KMeansCounter: number = 0;
  NumberOfPoints: number;
  NumberOfClusters: number = 4;

  startBtnEnabled: boolean = false;
  drawInitialPointCounter: number = 0;
  paintClusterCounter: number = 0;
  clusterPointsCounter: number = 0;
  calculatedClusterCount: number = 0;
  IsRefresh: boolean = false;

  refreshRate: number = 1000 / 60;
  radius: number = 4.2;

  circles: Circle[] = [];
  clusterCenters: Circle[] = [];

  Iteration: string = "";
  IterationCounter: number = 0;
  YellowCenterDisplayXValue: number = 0;
  YellowCenterDisplayYValue: number = 0;
  YellowClusterDisplay: string = "";
  GreenCenterDisplayXValue: number = 0;
  GreenCenterDisplayYValue: number = 0;
  GreenClusterDisplay: string = "";
  RedCenterDisplayXValue: number = 0;
  RedCenterDisplayYValue: number = 0;
  RedClusterDisplay: string = "";
  OrangeCenterDisplayXValue: number = 0;
  OrangeCenterDisplayYValue: number = 0;
  OrangeClusterDisplay: string = "";

  SSE: number = 0;
  InitialSSE: number = 0;
  IntialSSEDisplay: string = "";
  FinalSSE: number = 0;
  FinalSSEDisplay: string = "";


  slowCounter: number = 0;

  IterationsSoFar: number = 0;
  Status: string = "";
  currentPoint: string = "";

  constructor(route: ActivatedRoute, router: Router) {
    this.startBtnEnabled = true;
    this.Status = "(Waiting for button click)";
  }

  ngOnInit() {
  }

  async frameWait() {
    await this.frameSleep();
    window.requestAnimationFrame(() => this.generatePoint());
  }

  frameSleep() {
    return new Promise(resolve => setTimeout(resolve, 15));
  }

  async wait() {
    await this.sleep();
    this.findCluster();
  }
  sleep() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  newsleep() {
    return new Promise(resolve => setTimeout(resolve, 500));


  }
  newsleep2() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  newsleep3() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }

  async waitCluster() {
    await this.newsleep();

    //Needed??
    if (this.paintClusterCounter < this.NumberOfClusters)
      this.paintCluster();
  }

  async waitClusterPoints() {
    await this.newsleep();


    //if (this.paintClusterCounter < 3)
    this.clusterPoints();
  }

  async waitClusterCalculatedCenters() {
    await this.newsleep2();

    //Needed??
    // if (this.calculatedClusterCount < 3)
    this.paintCalculatedCenters();
  }


  async waitRepaint() {
    await this.newsleep3();


    //if (this.paintClusterCounter < 3)
    this.RePaint();
  }

  begin() {
    this.IsRefresh = true;
    this.KMeansCounter = 0;
    this.drawInitialPointCounter = 0;
    //  this.circles = [];
    this.clusterCenters = [];
    this.paintClusterCounter = 0;
    this.clusterPointsCounter = 0;
    //  this.calculatedClusterCount = 0;
    //  this.KMeansCounter = 0;
    // this.slowCounter = 0;

    this.YellowClusterDisplay = "";
    this.GreenClusterDisplay = "";
    this.RedClusterDisplay = "";
    this.IterationCounter = 1;
    this.Iteration = "";
    this.IntialSSEDisplay = "";
    this.FinalSSEDisplay = "";

    this.currentPoint = "";
    this.generatePoint();
  }

  generatePoint() {



    this.startBtnEnabled = false;
    this.NumberOfPoints = 250;

    this.Status = "Generating random points"

    var canvas = document.getElementById("screen") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    if (this.IsRefresh) {
      ctx.clearRect(0, 0, canvas.width, (canvas.height));
      console.log("REFRESH");
      this.IsRefresh = false;
    }

    console.log("GENERATE RANDOM POINTS");
    
    var circle: Circle = new Circle();
    circle.x = Math.random() * ((ctx.canvas.width - 10) - 10) + 10;
    circle.y = Math.random() * ((ctx.canvas.height - 10) - 10) + 10;

    this.currentPoint = "{x: " + parseFloat(circle.x.toString()).toPrecision(2) + ", y: "
      + parseFloat(circle.y.toString()).toPrecision(2) + "}";

    this.circles[this.drawInitialPointCounter] = circle;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.fill();

    this.drawInitialPointCounter++;

    if (this.drawInitialPointCounter < this.NumberOfPoints) {
      this.frameWait();
    }
    else {
      window.requestAnimationFrame(() => this.wait());
    }
  }

  private findCluster() {

    this.Status = "'Guessing' cluster centers";

    var canvas = document.getElementById("screen") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    for (let i = 0; i < this.NumberOfClusters; i++) {
      this.clusterCenters[i] = null;
    }
    //Randomly pick centers
    for (let s = 0; s < this.NumberOfClusters; s++) {
      this.clusterCenters[s] = this.PickCenter(this.circles);     
    }

    //Clusters must be unique
    for (let i = 0; i < this.NumberOfClusters; i++) {
      var randCenter: Circle = null;

      var index: number = 0;
      var index2: number = 0;

      do {

        for (let j = i + 1; j < i - 1; j++) {
          this.clusterCenters[j] = this.PickCenter(this.circles);

          for (let m = 0; m < j; m++) {
            if (m != j && this.clusterCenters[m] != null && this.clusterCenters[j] != null && this.clusterCenters[m].x === this.clusterCenters[j].x
              && this.clusterCenters[m].y === this.clusterCenters[j].y) {
              this.clusterCenters[j] = null;
              index = j;
            }
          }
        }

      } while (!this.clusterCenters[index] || !this.clusterCenters[index2])

      switch (i) {
        case (0):
          this.YellowCenterDisplayXValue = parseFloat(this.clusterCenters[i].x.toFixed(2));
          this.YellowCenterDisplayYValue = parseFloat(this.clusterCenters[i].y.toFixed(2));
          this.YellowClusterDisplay = "(" + this.YellowCenterDisplayXValue + ", " + this.YellowCenterDisplayYValue + ")";
        case (1):
          this.GreenCenterDisplayXValue = parseFloat(this.clusterCenters[i].x.toFixed(2));
          this.GreenCenterDisplayYValue = parseFloat(this.clusterCenters[i].y.toFixed(2));
          this.GreenClusterDisplay = "(" + this.GreenCenterDisplayXValue + ", " + this.GreenCenterDisplayYValue + ")";
        case (2):
          this.RedCenterDisplayXValue = parseFloat(this.clusterCenters[i].x.toFixed(2));
          this.RedCenterDisplayYValue = parseFloat(this.clusterCenters[i].y.toFixed(2));
          this.RedClusterDisplay = "(" + this.RedCenterDisplayXValue + ", " + this.RedCenterDisplayYValue + ")";
        case (3):
          this.OrangeCenterDisplayXValue = parseFloat(this.clusterCenters[i].x.toFixed(2));
          this.OrangeCenterDisplayYValue = parseFloat(this.clusterCenters[i].y.toFixed(2));
          this.OrangeClusterDisplay = "(" + this.OrangeCenterDisplayXValue + ", " + this.OrangeCenterDisplayYValue + ")";
      
     
        }
    }

    window.requestAnimationFrame(() => this.paintCluster())
  }

  private paintCluster() {

    this.currentPoint = "";
    this.Iteration = this.IterationCounter.toString();
    // console.log("Cluster counter: " + this.paintClusterCounter);

    var clusterColor: string;
    if (this.paintClusterCounter == 0)
      clusterColor = "yellow";
    else if (this.paintClusterCounter == 1)
      clusterColor = "green";
    else if (this.paintClusterCounter == 2)
      clusterColor = "red";
    else clusterColor = "orange";


    var canvas = document.getElementById("screen") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");
    
    this.clusterCenters[this.paintClusterCounter].color = clusterColor;
    
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(this.clusterCenters[this.paintClusterCounter].x, this.clusterCenters[this.paintClusterCounter].y, 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.clusterCenters[this.paintClusterCounter].color;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    this.paintClusterCounter++;   
    if (this.paintClusterCounter < this.NumberOfClusters) {
      window.requestAnimationFrame(() => this.waitCluster());      
    }
    else {
      this.waitClusterPoints();
    }

  }

  private clusterPoints() {

    this.Status = "Assigning points to nearest center";
    
    var canvas = document.getElementById("screen") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");
    
    var currentCircle = this.circles[this.clusterPointsCounter];

    this.currentPoint = "{x: " + parseFloat(currentCircle.x.toString()).toFixed(2) + ", y: "
      + parseFloat(currentCircle.y.toString()).toFixed(2) + "}";
    
    var smallestDistance: number;
    smallestDistance = 10000;
    var tempDistance: number;

    //find every point's nearest cluster 
    for (let k = 0; k < this.NumberOfClusters; k++) {

      var rCenter = this.clusterCenters[k] as Circle;
      // console.log("And here?");
      // console.log("Current Center " + rCenter);
      tempDistance = this.getDistance(currentCircle, rCenter);

      if (tempDistance < smallestDistance) {
        currentCircle.centerIndex = k;
        smallestDistance = tempDistance;
      }
    }

    this.SSE += smallestDistance;
    currentCircle.distToCenter = smallestDistance;


    rCenter = this.clusterCenters[currentCircle.centerIndex];

    this.circles[this.clusterPointsCounter].color = rCenter.color;
    //  this.circles[this.clusterPointsCounter].color = rCenter.color;
    //no need to compare a center to itself
    if (currentCircle.x != rCenter.x && currentCircle.y != rCenter.y) {

      var xDifference = currentCircle.x - rCenter.x;
      var yDifference = currentCircle.y - rCenter.y;

      var xNorm = this.GetXLine(xDifference, yDifference);
      var xLine = currentCircle.x + (this.radius * xNorm);

      var yNorm = this.GetYLine(xDifference, yDifference);
      var yLine = currentCircle.y + (this.radius * yNorm);




      var centerXLine = rCenter.x + (this.radius * xNorm);
      var centerYLine = rCenter.y + (this.radius * yNorm);

      ctx.globalCompositeOperation = 'destination-over';
      ctx.beginPath();
      ctx.moveTo(xLine, yLine);
      ctx.lineTo(centerXLine, centerYLine);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      ctx.beginPath();
      ctx.arc(this.circles[this.clusterPointsCounter].x, this.circles[this.clusterPointsCounter].y, this.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = this.circles[this.clusterPointsCounter].color;
      ctx.lineWidth = 2;
      ctx.fill();
    }


    this.clusterPointsCounter++;


    if (this.clusterPointsCounter < this.NumberOfPoints) {
      window.requestAnimationFrame(() => this.clusterPoints());
    }
    else {
      if (this.KMeansCounter < ITERATIONS) {

        if (this.IterationCounter == 1)
          this.InitialSSE = this.SSE;
        this.IntialSSEDisplay = parseFloat(this.InitialSSE.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.IterationCounter++;
        this.waitRepaint();
      }
      else {

        this.startBtnEnabled = true;
        this.FinalSSE = this.SSE;

        this.FinalSSEDisplay = parseFloat(this.FinalSSE.toFixed(2)).toString();
        this.FinalSSEDisplay = this.FinalSSEDisplay.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.currentPoint = "";
        this.Status = "Clustering completed"
        return;
      }
    }
  }




  //REPAINT POINTS AFTER CLUSTERS DRAWN
  public RePaint() {

    this.Iteration = this.IterationCounter.toString();

    this.currentPoint = "";

    var canvas = document.getElementById("screen") as HTMLCanvasElement;

    var ctx = canvas.getContext("2d");


    ctx.clearRect(0, 0, canvas.width, (canvas.height));

    //   var canvas = document.getElementById("screen") as HTMLCanvasElement;     

    for (let u = 0; u < this.NumberOfPoints; u++) {
      var rePaintCircle = this.circles[u];
      //console.log("REPAINT CIRCLE" + rePaintCircle.x);
      ctx.beginPath();
      ctx.arc(rePaintCircle.x, rePaintCircle.y, this.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.fill();
    }

    this.calculateCenters();    
  }
 

  public calculateCenters() {

    this.Status = "Updating cluster centers";

    //Resets this so calculateCenters in KMeans section can call each other n
    this.calculatedClusterCount = 0;

    var yellowCluster = this.circles.filter((point: Circle) => point.color === "yellow");
    //console.log("Size of Yello Cluster " + yellowCluster.length);
    var yellowSumDist = 0;
    var yellowSumXDist = 0;
    var yellowSumYDist = 0;
    var yellowAverageX = 0;
    var yellowAverageY = 0;

    var yellowAverage = 0;
    var tempDist = 0;
    var yellowSmallestDistToTempYellowCenter: number = Number.MAX_VALUE;
    var tempYellowCenter: Circle;
    var newYellowCenter: Circle;

    //YellowCLUSTER here refers to points that make up the cluster not the center
    for (let t = 0; t < yellowCluster.length; t++) {
      yellowSumXDist += yellowCluster[t].x;
      yellowSumYDist += yellowCluster[t].y;
    }

    //Average x and y distance of point in yellow cluster to yellow center
    yellowAverageX = yellowSumXDist / yellowCluster.length;
    yellowAverageY = yellowSumYDist / yellowCluster.length;
    yellowAverage = yellowSumDist / yellowCluster.length;

    tempYellowCenter = new Circle();
    tempYellowCenter.x = yellowAverageX;
    tempYellowCenter.y = yellowAverageY;
    tempYellowCenter.color = "yellow";

    newYellowCenter = tempYellowCenter;

    this.YellowCenterDisplayXValue = parseFloat(newYellowCenter.x.toFixed(2));
    this.YellowCenterDisplayYValue = parseFloat(newYellowCenter.y.toFixed(2));
    this.YellowClusterDisplay = "(" + this.YellowCenterDisplayXValue + ", " + this.YellowCenterDisplayYValue + ")";


    var greenCluster = this.circles.filter((point: Circle) => point.color === "green");
    var greenSumDist = 0;
    var greenSumXDist = 0;
    var greenSumYDist = 0;
    var greenAverageX = 0;
    var greenAverageY = 0;

    var greenAverage = 0;
    var tempDist = 0;
    var greenSmallestDistToTempYellowCenter: number = Number.MAX_VALUE;
    var tempGreenCenter: Circle;
    var newGreenCenter: Circle;

    for (let t = 0; t < greenCluster.length; t++) {
      // yellowSumDist += yellowCluster[t].distToCenter;
      greenSumXDist += greenCluster[t].x;
      greenSumYDist += greenCluster[t].y;
    }

    //Average x and y distance of point in yellow cluster to yellow center
    greenAverageX = greenSumXDist / greenCluster.length;
    greenAverageY = greenSumYDist / greenCluster.length;


    greenAverage = greenSumDist / greenCluster.length;

    tempGreenCenter = new Circle();
    tempGreenCenter.x = greenAverageX;
    tempGreenCenter.y = greenAverageY;
    tempGreenCenter.color = "green";


    newGreenCenter = tempGreenCenter;

    this.GreenCenterDisplayXValue = parseFloat(newGreenCenter.x.toFixed(2));
    this.GreenCenterDisplayYValue = parseFloat(newGreenCenter.y.toFixed(2));
    this.GreenClusterDisplay = "(" + this.GreenCenterDisplayXValue + ", " + this.GreenCenterDisplayYValue + ")";

    var redCluster = this.circles.filter((point: Circle) => point.color === "red");
    var redSumDist = 0;
    var redSumXDist = 0;
    var redSumYDist = 0;
    var redAverageX = 0;
    var redAverageY = 0;

    var redAverage = 0;
    var tempDist = 0;
    var redSmallestDistToTempYellowCenter: number = Number.MAX_VALUE;
    var tempRedCenter: Circle;
    var newRedCenter: Circle;


    for (let t = 0; t < redCluster.length; t++) {
      // yellowSumDist += yellowCluster[t].distToCenter;
      redSumXDist += redCluster[t].x;
      redSumYDist += redCluster[t].y;
    }

    //Average x and y distance of point in yellow cluster to yellow center
    redAverageX = redSumXDist / redCluster.length;
    redAverageY = redSumYDist / redCluster.length;


    redAverage = redSumDist / redCluster.length;

    tempRedCenter = new Circle();
    tempRedCenter.x = redAverageX;
    tempRedCenter.y = redAverageY;
    tempRedCenter.color = "red";

    newRedCenter = tempRedCenter;
    this.RedCenterDisplayXValue = parseFloat(newRedCenter.x.toFixed(2));
    this.RedCenterDisplayYValue = parseFloat(newRedCenter.y.toFixed(2));
    this.RedClusterDisplay = "(" + this.RedCenterDisplayXValue + ", " + this.RedCenterDisplayYValue + ")";
    console.log("NEW RED CENTER: " + this.RedClusterDisplay);

    var orangeCluster = this.circles.filter((point: Circle) => point.color === "orange");
    var orangeSumDist = 0;
    var orangeSumXDist = 0;
    var orangeSumYDist = 0;
    var orangeAverageX = 0;
    var orangeAverageY = 0;

    var orangeAverage = 0;
    var tempDist = 0;
    var orangeSmallestDistToTempYellowCenter: number = Number.MAX_VALUE;
    var temporangeCenter: Circle;
    var neworangeCenter: Circle;

    for (let t = 0; t < orangeCluster.length; t++) {     
      orangeSumXDist += orangeCluster[t].x;
      orangeSumYDist += orangeCluster[t].y;
    }

    //Average x and y distance of point in yellow cluster to yellow center
    orangeAverageX = orangeSumXDist / orangeCluster.length;
    orangeAverageY = orangeSumYDist / orangeCluster.length;

    orangeAverage = orangeSumDist / orangeCluster.length;

    temporangeCenter = new Circle();
    temporangeCenter.x = orangeAverageX;
    temporangeCenter.y = orangeAverageY;
    temporangeCenter.color = "orange";

    this.OrangeCenterDisplayXValue = parseFloat(newRedCenter.x.toFixed(2));
    this.OrangeCenterDisplayYValue = parseFloat(newRedCenter.y.toFixed(2));
    this.OrangeClusterDisplay = "(" + this.RedCenterDisplayXValue + ", " + this.RedCenterDisplayYValue + ")";

    neworangeCenter = temporangeCenter;

    console.log("NEW ORANGE CENTER: " + this.OrangeClusterDisplay);

    this.clusterCenters = [];
    this.clusterCenters.push(newYellowCenter);
    this.clusterCenters.push(newGreenCenter);
    this.clusterCenters.push(newRedCenter);
    this.clusterCenters.push(neworangeCenter);
    window.requestAnimationFrame(() => this.waitClusterCalculatedCenters());

    this.KMeansCounter++;
    this.SSE = 0;
  }


  public paintCalculatedCenters() {

    var canvas = document.getElementById("screen") as HTMLCanvasElement;
    var ctx = canvas.getContext("2d");

    //ESSENTIAL TO REFRESH      

    var center = this.clusterCenters[this.calculatedClusterCount];

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = center.color;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    this.calculatedClusterCount++;

    if (this.calculatedClusterCount < this.NumberOfClusters) {
      window.requestAnimationFrame(() => this.waitClusterCalculatedCenters());
    }
    else {
      this.clusterPointsCounter = 0;
      window.requestAnimationFrame(() => this.waitClusterPoints())
    }
  }

  public getDistance(point: Circle, center: Circle): number {
    var a = point.x - center.x;
    var b = point.y - center.y;
    return Math.sqrt(a * a + b * b);
  }

  public PickCenter(points: Circle[]): Circle {
    var centerIndex = Math.floor(Math.random() * (this.NumberOfPoints - 2 + 1)) + 1;
    var randomCenter = points[centerIndex];
    return randomCenter;
  }

  public GetXLine(xDiff: number, yDiff: number): number {
    var lineLength = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    var xNormalized = xDiff /= lineLength;
    return xNormalized;
  }

  public GetYLine(xDiff: number, yDiff: number): number {
    var lineLength = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    var yNormalized = yDiff /= lineLength;
    return yNormalized;
  }
}
