// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	cosx = Math.cos(rotationX)
	sinx = Math.sin(rotationX)
	cosy = Math.cos(rotationY)
	siny = Math.sin(rotationY)

	var trans = [
		cosy, siny * sinx, siny * cosx, 0,
		0, cosx, -sinx, 0,
	    -siny, cosy * sinx, cosy * cosx, 0,
		translationX, translationY, translationZ, 1
	];
	
	var mvp = MatrixMult( projectionMatrix, trans);
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.gl = gl;
		const VSsource = ` 
			attribute vec3 pos; 
			attribute vec2 texCoord; 

			uniform mat4 mvp; 
			uniform bool yzSwap;

			varying vec2 v_texCoord; 

			void main()
			{
				vec4 position = vec4(pos.x, pos.y, pos.z, 1.0);
				if (yzSwap) {
					position.y = pos.z;
					position.z = pos.y;
				}

                gl_Position = mvp * position;
                v_texCoord = texCoord; 
		}`;


		const FSsource = `
            precision mediump float;

            uniform sampler2D u_texture;  
            uniform bool u_useTexture;     

            varying vec2 v_texCoord;       

            void main() {
                if (u_useTexture) {
                    gl_FragColor = texture2D(u_texture, v_texCoord);
                } else {
                    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                }
            }
		`;
	
		const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vs, VSsource);
		this.gl.compileShader(vs); 

        const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fs, FSsource); // Imposta il codice del fragment shader
        this.gl.compileShader(fs); // Compila il fragment shader

        // Crea il programma e allega gli shader
        this.program = gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error("Program link error: " + this.gl.getProgramInfoLog(this.program));
		}

        // Usa il programma
        this.gl.useProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error("Program not linked properly.");
		}

		// Ottieni la location degli uniformi e degli attributi
		this.posAttribLocation = this.gl.getAttribLocation(this.program, "pos");
		this.texCoordAttribLocation = this.gl.getAttribLocation(this.program, "texCoord");
		this.mvpUniformLocation = this.gl.getUniformLocation(this.program, "mvp");
		this.swapYZUniformLocation = this.gl.getUniformLocation(this.program, "yzSwap");
		this.textureUniformLocation = this.gl.getUniformLocation(this.program, "u_texture");
		this.useTextureUniformLocation = this.gl.getUniformLocation(this.program, "u_useTexture");

		// Buffer per le posizioni e le coordinate di texture
		this.positionBuffer = this.gl.createBuffer();
		this.texCoordBuffer = this.gl.createBuffer();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertPos), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		this.gl.useProgram(this.program);
        this.gl.uniform1i(this.swapYZUniformLocation, swap ? 1 : 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		this.gl.useProgram(this.program);
		this.gl.uniformMatrix4fv(this.mvpUniformLocation, false, new Float32Array(trans));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.posAttribLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.posAttribLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(this.texCoordAttribLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.texCoordAttribLocation);

		this.gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
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

        // Imposta il texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.textureUniformLocation, 0);

        // Abilita l'uso della texture
        this.gl.uniform1i(this.useTextureUniformLocation, true);
		// You can set the texture image data using the following command.
		//gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
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
	
}

