//create terrain object
function Terrain(size) {
  this.size =size+1;  // vertex is 2^n+1
  this.max = size;
  this.initial=3;
  this.map = new Float32Array((size+1)*(size+1));
}

//---------------------------------------------------------------
//terrian generation
Terrain.prototype.generate = function() {
  var it = this;
  it.setHeight(0, 0, it.initial);
  it.setHeight(it.max, 0, it.initial);
  it.setHeight(it.max, it.max, it.initial);
  it.setHeight(0, it.max, it.initial);
  diamond(0,0, it.max, it.max, it.initial,it);
}

//----------------------------------------------------------------------------------
//helper functions get the height of each vertex
Terrain.prototype.getHeight = function(x, y) {
  // if out of boundary set the height to be -1
  if (x < 0 || x > this.max || y < 0 || y > this.max) 
    return 0;
  return this.map[x + this.size * y];
}
//-------------------------------------------------------------------------------------
// set the height of each vertex
Terrain.prototype.setHeight = function(x, y, val) {
  this.map[x + this.size * y] = val;
}
//-----------------------------------------------------------------------------
//set height of vertex idf the vertex has not been set before
Terrain.prototype.setHeightguard= function(x,y,val){
  if (!this.getHeight(x,y)) {
    this.setHeight(x,y,val);
  }
}
//----------------------------------------------------------------------------
// recurion part of the generation function

function diamond(left, top, right, bottom, base_height,it) {
  //get centerpoint
  var centerx = Math.floor((left + right) / 2);
  var centery = Math.floor((top + bottom) / 2);
  //value is the average of four cornors
  var centerValue = (it.getHeight(left, top) +it.getHeight(right, top) +it.getHeight(left, bottom) +it.getHeight(right, bottom)) / 4- (Math.random() - 0.5) * base_height * 2;
  it.setHeight(centerx,centery,centerValue);

  //set the height of up down left right point
  it.setHeightguard(centerx, top,(it.getHeight(left,  top) + it.getHeight(right, top)+it.getHeight(centerx,centery))/ 3 + (Math.random() - 0.5) * base_height);
  it.setHeightguard(centerx, bottom,(it.getHeight(left,  bottom) + it.getHeight(right, bottom)+it.getHeight(centerx,centery))/ 3+ (Math.random() - 0.5) * base_height);
  it.setHeightguard(left, centery, (it.getHeight(left,  top) + it.getHeight(left,  bottom)+it.getHeight(centerx,centery))/ 3 + (Math.random() - 0.5) * base_height);
  it.setHeightguard(right,centery, (it.getHeight(right, top) + it.getHeight(right, bottom)+it.getHeight(centerx,centery))/ 3 + (Math.random() - 0.5) * base_height);
  
 
  //base case
  if (right - left> 2)
    base_height = base_height*Math.pow(2.0, -0.75);
  else
    return;

  // recurse
  diamond( left, top, centerx, centery, base_height ,it);
  diamond( centerx, top, right, centery, base_height ,it);
  diamond( left,centery, centerx, bottom, base_height,it );
  diamond( centerx, centery, right, bottom, base_height,it );

}
//---------------------------------------------------------------------------
//set  the normals for each vector 
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray)
{   
  var deltaX=(maxX-minX)/n;
  var deltaY=(maxY-minY)/n;
  var terrain = new Terrain(n);
  terrain.generate();

  for(var i=0;i<=n;i++)
    for(var j=0;j<=n;j++)
    {   
      var val=terrain.getHeight(j,i);
      vertexArray.push(minX+deltaX*j);
      vertexArray.push(minY+deltaY*i);
      vertexArray.push(-val);
    }
  var down=vec3.create();
  var up=vec3.create();
  var left=vec3.create();
  var right=vec3.create();
  var slef=vec3.create();

//compute the up down left point of each vertex and then computer four vectors and for each two vectors compute the normals fro all the faces that 
//contain that pont. the add then togetehr and normalize it and then push it to the normol array.
 for(var i=0;i<=n;i++)
  for(var j=0;j<=n;j++)
  {

    //get five points
    if(j!=0)
    {
      up[0] =vertexArray[((n+1)*(j-1)+i)*3];
      up[1] =vertexArray[((n+1)*(j-1)+i)*3+1];
      up[2] =vertexArray[((n+1)*(j-1)+i)*3+2];
    }
    if(j!=n)
    {
      down[0]=vertexArray[((n+1)*(j+1)+i)*3];
      down[1]=vertexArray[((n+1)*(j+1)+i)*3+1];
      down[2]=vertexArray[((n+1)*(j+1)+i)*3+2];
    }
    if(i!=0)
    {
      left[0]=vertexArray[((n+1)*j+i-1)*3];
      left[1] =vertexArray[((n+1)*j+i-1)*3+1];
      left[2] =vertexArray[((n+1)*j+i-1)*3+2];
    }
    if(i!=n)
    {
      right[0]=vertexArray[((n+1)*j+i+1)*3];
      right[1]=vertexArray[((n+1)*j+i+1)*3+1];
      right[2]=vertexArray[((n+1)*j+i)*3+2];
    }

    self[0]=vertexArray[((n+1)*j+i)*3];
    self[1]=vertexArray[((n+1)*j+i)*3+1];
    self[2]=vertexArray[((n+1)*j+i)*3+2];

    //get four vector
    var upvec=vec3.fromValues(up[0]-self[0], up[1]-self[1],up[2]-self[2]);
    var downvec=vec3.fromValues(down[0]-self[0], down[1]-self[1],down[2]-self[2]);
    var leftvec=vec3.fromValues(left[0]-self[0],left[1]-self[1],left[2]-left[2]);
    var rightvec=vec3.fromValues(right[0]-right[0],right[1]-right[1],right[2]-right[2]);

    //get four normals
    var nor1=vec3.create();
    var nor2=vec3.create();
    var nor3=vec3.create();
    var nor4=vec3.create();
    if(i!=0 && j!=0)
      vec3.cross(nor1, leftvec, upvec);
    if(i!=0 && j!=n)
      vec3.cross(nor2, downvec, leftvec);
    if(i!=n && j!=0)
      vec3.cross(nor3, upvec, rightvec);
    if(i!=n && j!=n)
      vec3.cross(nor4,rightvec, downvec);


    //add them together
    var nor=vec3.create();
    vec3.add(nor, nor, nor1);
    vec3.add(nor, nor, nor2);
    vec3.add(nor, nor, nor3);
    vec3.add(nor, nor, nor4);
    //normalization
    vec3.normalize(nor,nor);
    //push to normalarray
    normalArray.push(nor[0]);
    normalArray.push(nor[1]);
    normalArray.push(nor[2]);

  }


// built facearray
  var numT=0;
  for(var i=0;i<n;i++)
  for(var j=0;j<n;j++)
  {
   var vid = i*(n+1) + j;
   faceArray.push(vid);
   faceArray.push(vid+1);
   faceArray.push(vid+n+1);

   faceArray.push(vid+1);
   faceArray.push(vid+1+n+1);
   faceArray.push(vid+n+1);
   numT+=2;
  }
  return numT;
}
//-------------------------------------------------------------------------
function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
  numTris=faceArray.length/3;
  for(var f=0;f<numTris;f++)
  {
    var fid=f*3;
    lineArray.push(faceArray[fid]);
    lineArray.push(faceArray[fid+1]);

    lineArray.push(faceArray[fid+1]);
    lineArray.push(faceArray[fid+2]);

    lineArray.push(faceArray[fid+2]);
    lineArray.push(faceArray[fid]);
  }
}



