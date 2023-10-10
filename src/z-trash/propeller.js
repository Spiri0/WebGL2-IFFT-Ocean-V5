

function Propeller(Da, Di, N, phi, rho){

	const PI = Math.PI;
 
	//Da outer propeller diameter 
	//Di inner propeller diameter
	//N rpm of the propeller
	//phi propeller angle at tips
	//rho air density

	let A = (Da*Da - Di*Di) * PI/4;   
	let n = N/30 * PI;

	//A work area of the propeller 
	//n radians-speed

	//effective A 
	let A_eta = 0.9;

	A = A * A_eta;
	//velocity of propeller air stream
	let v = n * Math.tan(phi/180 * PI);

	//effictive v
	let v_eta = 0.9;

	v = v * v_eta;

	let dV = A * v;     //m³/s
	let dm = dV * rho;  //kg/s

	let F = rho * A * v ** 2;   //N
	let P = rho * A * v ** 3;   //W

	//F thrust
	//P neccessary power

	P = P/1000; //kW

	F = Math.round(F);
	P = Math.round(P);

  
	return {F, P};   
}

let result = Propeller(3.4, 0.5, 2000, 15, 1.25);

console.log(result);