// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	cosx = Math.cos(rotationX)
	sinx = Math.sin(rotationX)
	cosy = Math.cos(rotationY)
	siny = Math.sin(rotationY)
	var Rx = [
        1,    0,     0,    0,
        0, cosx, sinx, 0,
        0, -sinx, cosx, 0,
        0,    0,     0,    1
    ];
    var Ry = [
        cosy, 0, -siny, 0,
           0, 1,    0,  0,
        siny, 0,  cosy, 0,
           0, 0,    0,  1
    ];
	var T = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];
	var R = MatrixMult(Ry, Rx);   
    var mv = MatrixMult(T, R); 
	return mv;
}



// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.gl = gl;
		 
		const VSsource = ` 
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 norm;

			uniform mat4 mvp; 
			uniform mat4 mv;
			uniform mat3 mvnorm;
			uniform bool yzSwap;

			varying vec2 v_texCoord;
			varying vec3 v_normal;
			varying vec3 v_viewFragPos;

			void main()
			{
				vec4 position = vec4(pos.x, pos.y, pos.z, 1.0);
				if (yzSwap) {
					position.y = pos.z;
					position.z = pos.y;
				}

                gl_Position = mvp * position;
                v_texCoord = texCoord; 
				v_normal = mvnorm * norm;
				v_viewFragPos = (mv * position).xyz;
			
			}
		`;

		const FSsource = `
            precision mediump float;

            uniform sampler2D u_texture;  
            uniform bool u_useTexture; 
			uniform vec3 lightdir;
			uniform float shininess;
			const vec3 lightColor = vec3(1.0, 1.0, 1.0);
			const float lightIntensity = 1.0; 
			const vec3 specColor = vec3(1.0, 1.0, 1.0); 

            varying vec2 v_texCoord;  
			varying vec3 v_normal;
			varying vec3 v_viewFragPos;     

            void main() {
				vec3 baseColor;
                if (u_useTexture) {
                    baseColor = texture2D(u_texture, v_texCoord).rgb;
                }else {
					baseColor = vec3(1.0, 1.0, 1.0);
				}
				vec3 N = normalize(v_normal);
				vec3 L = normalize(lightdir);
				vec3 V = normalize(-v_viewFragPos);
				vec3 H = normalize(L + V);
				vec3 diffuse = max(dot(N, L), 0.0) * lightColor;
				vec3 specular = pow(max(dot(N, H), 0.0), shininess) * specColor;
				vec3 color = lightIntensity * (baseColor * diffuse + specular);
        		gl_FragColor = vec4(color, 1.0);
            }
		`;


		const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vs, VSsource);
		this.gl.compileShader(vs); 

        const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fs, FSsource); 
        this.gl.compileShader(fs); 

        this.program = gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
		this.posAttribLocation = this.gl.getAttribLocation(this.program, "pos");
		this.texCoordAttribLocation = this.gl.getAttribLocation(this.program, "texCoord");
		this.normAttribLocation = this.gl.getAttribLocation(this.program, "norm");

		this.mvpUniformLocation = this.gl.getUniformLocation(this.program, "mvp");
		this.mvUniformLocation = this.gl.getUniformLocation(this.program, "mv");
		this.mvnormUniformLocation = this.gl.getUniformLocation(this.program, "mvnorm");
		this.swapYZUniformLocation = this.gl.getUniformLocation(this.program, "yzSwap");
		
		this.textureUniformLocation = this.gl.getUniformLocation(this.program, "u_texture");
		this.useTextureUniformLocation = this.gl.getUniformLocation(this.program, "u_useTexture");
		this.lightDir = this.gl.getUniformLocation(this.program, "lightdir");
		this.shininess = this.gl.getUniformLocation(this.program, "shininess");

		this.positionBuffer = this.gl.createBuffer();
		this.texCoordBuffer = this.gl.createBuffer();
		this.normalsBuffer = this.gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertPos), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that ssindicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		this.gl.useProgram(this.program);
        this.gl.uniform1i(this.swapYZUniformLocation, swap ? 1 : 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		this.gl.useProgram(this.program);
		this.gl.uniformMatrix4fv(this.mvpUniformLocation, false, new Float32Array(matrixMVP));
		this.gl.uniformMatrix4fv(this.mvUniformLocation, false, new Float32Array(matrixMV));
		this.gl.uniformMatrix3fv(this.mvnormUniformLocation, false, new Float32Array(matrixNormal));

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.posAttribLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.posAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(this.texCoordAttribLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.texCoordAttribLocation);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
		this.gl.vertexAttribPointer(this.normAttribLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.normAttribLocation);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		this.gl.useProgram(this.program)
		const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    	this.gl.activeTexture(this.gl.TEXTURE0);
        
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		this.gl.uniform1i(this.textureUniformLocation, 0);
        this.gl.uniform1i(this.useTextureUniformLocation, true);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		this.gl.useProgram(this.program);
		this.gl.uniform1i(this.useTextureUniformLocation, show ? 1 : 0);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		this.gl.useProgram(this.program);
		this.gl.uniform3f(this.lightDir, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		this.gl.useProgram(this.program);
		this.gl.uniform1f(this.shininess, shininess);
	}
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ); // The total for per particle

	// [TO-DO] Compute the total force of each particle
    for (let i = 0; i < forces.length; i++) {
        forces[i] = new Vec3(0, 0, 0);
    }
	
	for (let i = 0; i < springs.length; i++){
		let x0 = positions[springs[i].p0];
		let v0 = velocities[springs[i].p0];
		let x1 = positions[springs[i].p1];
		let v1 = velocities[springs[i].p1];
		let r = springs[i].rest;
		let l = x1.sub(x0).len();
		let d = x1.sub(x0).div(l);
		let fspring = d.mul(stiffness * (l - r));
		let lv = v1.sub(v0).dot(d);
		let fdamp = d.mul(lv).mul(damping);
        let f = fspring.add(fdamp);
		forces[springs[i].p0].inc(f);
		forces[springs[i].p1].dec(f);
	}

	// [TO-DO] Update positions and velocities
	for (let i = 0; i < positions.length; i++){
		let fgravity = gravity.mul(particleMass);
		forces[i].inc(fgravity);
		let acc = forces[i].div(particleMass);
		velocities[i].inc(acc.mul(dt));
		positions[i].inc(velocities[i].mul(dt));
	}
	
	// [TO-DO] Handle collisions
	for(let i = 0; i < positions.length; i++){
		
		let down = new Vec3(-1.0,-1.0,-1.0); 
		let up  = new Vec3(1.0,1.0,1.0); 
		
		if(positions[i].x < down.x){
			let h = Math.abs(positions[i].x) - Math.abs(down.x); 
			positions[i].x += (h * restitution);
			velocities[i].x = velocities[i].x*(-1.0 * restitution);
		}
	    	if(positions[i].y < down.y){
			let h = Math.abs(positions[i].y) - Math.abs(down.y); 
			positions[i].y += (h * restitution);
			velocities[i].y = velocities[i].y*(-1.0 * restitution);
		}
		if(positions[i].z < down.z){
			let h = Math.abs(positions[i].z) - Math.abs(down.z); 
			positions[i].z += (h * restitution);
			velocities[i].z = velocities[i].z*(-1.0 * restitution);
		}

		if(positions[i].x > up.x){
			let h = Math.abs(positions[i].x) - Math.abs(up.x); 
			positions[i].x -= (h * restitution);
			velocities[i].x = velocities[i].x*(-1.0 * restitution);
		}
		if(positions[i].y > up.y){
			let h = Math.abs(positions[i].y) - Math.abs(up.y); 
			positions[i].y -= (h * restitution);
			velocities[i].y = velocities[i].y*(-1.0 * restitution);
		}
		if(positions[i].z > up.z){
			let h = Math.abs(positions[i].z) - Math.abs(up.z); 
			positions[i].z -= (h * restitution);
			velocities[i].z = velocities[i].z*(-1.0 * restitution);
		}


	}
}