let url = 'http://localhost:8080';
let browser = (window.browser) ? window.browser : window.chrome;
//let uid = null; 

async function registerNew(name, token) {
	console.log("reging");
	try {
		const resp = await fetch(
			url + "/register?name="+name+"&token="+token,
			{ method:"POST" }
		);
		let uidresp = resp.json();
		uidresp.then(function (uidc) {
			console.log(uidc);
			if (uidc['type'] == "success") {
				browser.storage.local.set(
					{uid:uidc["data"], name:name}
				)
				updateRegs();
			}
		});
	} catch (error) {
		console.error(error.message);
	}

}
async function listRooms() {
	if (uid === null) {
		console.log("no uid");
		return;
	}
	try {
		const resp = await fetch(
			url + "/rooms"
		);
		let rooms_c = await resp.json();
		if (rooms_c['type'] == 'success') {
			let rooms = rooms_c["data"];
		} else {
			console.log("no ROOMS!");
			return;
		}
		document.getElementById("rooms").textContent = rooms_c["data"];
	} catch (error) {
		console.error(error.message);
	}
}

async function joinRoom() {
	let room = document.getElementById('room-input').value;
	/*if (uid === null) {
		console.log("no uid");
		return;
	}*/
	try {
		const resp = await fetch(
			url + "/join?room="+room,
			{ method:"POST" }
		);
		let respc = await resp.json();
		console.log(respc);
	} catch (error) {
		console.error(error.message);
	}
}

async function leaveRoom() {
	let room = document.getElementById('room-input').value;
	if (uid === null) {
		console.log("no uid");
		return;
	}
	try {
		const resp = await fetch(
			url + "/leave?room="+room,
			{ method:"POST" }
		);
		let respc = await resp.json();
		console.log(respc);
	} catch (error) {
		console.error(error.message);
	}
}

function onError(error) {
	console.log(error);
}

function onGot(item) {
	console.log(item);
	if ('uid' in item && 'name' in item) {
		console.log('exists');
		console.log(item.uid);
	} else {
		let name = document.getElementById("name-input").value;
		let token = document.getElementById("token-input").value;
		registerNew(name, token);
	}
}


function register() {
	browser.storage.local
		.get("uid")
		.then(onGot,onError);
}

function updateRegs() {
	browser.storage.local
		.get(["uid","name", "server"])
		.then(function (item) {
			if ("server" in item) {
				document.getElementById("server-input").value = item.server;
				url = item.server;
			}

			if ('uid' in item && 'name' in item) {
				uid = item.uid;
				document.getElementById("reg-status").textContent = "Registered: name is " + item.name;
				document.getElementById("reg-form").style.display = "none";
			}
		},
		function (error) {}
	);
}
function updateServer() {
	let nurl = document.getElementById("server-input").value;
	if (nurl == "clear") {
		browser.storage.local.clear();
		return;
	}
	if (nurl.endsWith("/")) {
		nurl = nurl.substr(0,nurl.length-1);
	}
	url = nurl
	browser.storage.local.set({server: url});
}

if (document.getElementById("regbtn")) {
	document.getElementById("regbtn").addEventListener("click", register);
	document.getElementById("joinbtn").addEventListener("click", joinRoom);
	document.getElementById("leavebtn").addEventListener("click", leaveRoom);
	document.getElementById("listbtn").addEventListener("click", listRooms);
	document.getElementById("server-btn").addEventListener("click", updateServer);
	updateRegs();
}
