// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale)
{
	let rot = (rotation * Math.PI) / 180; //transformation from degrees to radiants
	let sin = Math.sin(rot);
	let cos = Math.cos(rot);
	let sx = scale * cos;
	let sy = scale * sin;
	return Array( sx, sy, 0, -sy, sx, 0, positionX, positionY, 1 );
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
    let trans = new Array(9); 
	trans[0] = trans1[0] * trans2[0] + trans1[1] * trans2[3] + trans1[2] * trans2[6];  
    trans[1] = trans1[0] * trans2[1] + trans1[1] * trans2[4] + trans1[2] * trans2[7];  
    trans[2] = trans1[0] * trans2[2] + trans1[1] * trans2[5] + trans1[2] * trans2[8];  

    trans[3] = trans1[3] * trans2[0] + trans1[4] * trans2[3] + trans1[5] * trans2[6];  
    trans[4] = trans1[3] * trans2[1] + trans1[4] * trans2[4] + trans1[5] * trans2[7];  
    trans[5] = trans1[3] * trans2[2] + trans1[4] * trans2[5] + trans1[5] * trans2[8];  

    trans[6] = trans1[6] * trans2[0] + trans1[7] * trans2[3] + trans1[8] * trans2[6];  
    trans[7] = trans1[6] * trans2[1] + trans1[7] * trans2[4] + trans1[8] * trans2[7];  
    trans[8] = trans1[6] * trans2[2] + trans1[7] * trans2[5] + trans1[8] * trans2[8]; 
	return trans;
}
