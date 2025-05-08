var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;


// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;

	for ( int i=0; i<NUM_SPHERES; ++i ) {
		Sphere sphere = spheres[i];

		// TO-DO: Test for ray-sphere intersection
		vec3 d = ray.pos - sphere.center;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(d, ray.dir);
		float c = dot(d, d) - sphere.radius * sphere.radius;
		float delta = b * b - 4.0 * a * c; 

		if(delta >= 0.0){ // hit found

			// find the t value of closet ray-sphere intersection
			float t0 = (-b - sqrt(delta)) / (2.0 * a);

			// TO-DO: If intersection is found, update the given HitInfo
			if( t0 > 0.0 && t0 <= hit.t){
				foundHit = true;
				hit.t = t0; 
				hit.position = ray.pos + (ray.dir * t0) ; 
				hit.normal = normalize(hit.position - sphere.center); 
				hit.mtl = sphere.mtl;
			}	
	
		}
		
	}
	return foundHit;
}

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 ambientComponent = mtl.k_d * 0.05;
	vec3 color;

	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		
		// TO-DO: Check for shadows
		Ray rayshadow; 
		rayshadow.dir = normalize(lights[i].position - position);
		rayshadow.pos = position + (rayshadow.dir) * 0.003;

		bool inShadow = false;

		for (int j = 0; j < NUM_SPHERES; ++j) {
			Sphere shadowsphere = spheres[j];
			vec3 d = rayshadow.pos - shadowsphere.center;
			float a = dot(rayshadow.dir, rayshadow.dir);
			float b = 2.0 * dot(d, rayshadow.dir);
			float c = dot(d, d) - shadowsphere.radius * shadowsphere.radius;
			float delta = b * b - 4.0 * a * c;

			if (delta > 0.0) {
				float t = (-b - sqrt(delta)) / (2.0 * a);
				if (t > 0.0) {
					inShadow = true;
					break;
				}
			}
		}

		if( inShadow ){
			color += ambientComponent;
		}else{
			// TO-DO: If not shadowed, perform shading using the Blinn model
			vec3 lightDir = normalize((lights[i].position - position));
			float cosTheta = dot(normal, lightDir);
			vec3 diffuseComponent = mtl.k_d * lights[i].intensity * max(0.0, cosTheta); 
			
			vec3 halfAngle = normalize(view + lightDir);
			vec3 specularComponent = mtl.k_s * lights[i].intensity * pow(max(0.0, dot(normal, halfAngle)),mtl.n); 
			
			color += ambientComponent + diffuseComponent + specularComponent;	// change this line	
		}
	}
	return color;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.dir = reflect(ray.dir, hit.normal);
			r.pos = hit.position + r.dir * 0.0001;

			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				// clr += vec3(h.normal); // Test reflection intersections
				// clr += vec3(1.0, 0.0, 0.0);
				clr += Shade(h.mtl, h.position, h.normal, view);
				// TO-DO: Update the loop variables for tracing the next reflection ray
				hit = h;
				ray = r;					
			} else {
				// The reflection ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 1.0 );	// return the environment color
	}
}
`;
