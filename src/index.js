import {Main} from "./main.js";

let APP = null;

window.addEventListener('DOMContentLoaded', async () => {
	APP = new Main();
	await APP.Initialize();
});
