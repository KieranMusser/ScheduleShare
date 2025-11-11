
function extractCourseNumbers() {
	let courseTable = document.getElementsByClassName("schedule-courses");
	
	if (courseTable.length == 0) {
		console.log("No course table!");
		return;
	}

	let courseBtns = courseTable[0].getElementsByClassName("action-view-section");
	let courses = [];

	for (let i=0; i<courseBtns.length; i+=1) {
		let el = courseBtns[i];
		let section = el.textContent;
		let curl = el.href.split("/");
		let dept = curl[5];
		let course = curl[6];
		courses.push([dept, course, section]);
	}
	return courses;
}

function extractScaling() {
	let itinDays = document.getElementsByClassName('itin-day');
	let timeline = itinDays[0].getElementsByClassName("timeline")[0];
	let dayStart = timeline.children[0];
	let nextTime = timeline.children[1];

	let initialTime = dayStart.getAttribute("data-seconds");
	console.log(dayStart);
	console.log(nextTime);
	
	let timeDelta = nextTime.getAttribute("data-seconds") - initialTime;
	let pageDelta = nextTime.offsetTop;

	return [initialTime, timeDelta, pageDelta];
}

function extractCourseTimes() {
	let itinDays = document.getElementsByClassName('itin-day');

	const [initialTime, timeDelta, pageDelta] = extractScaling();

	let courseTables = [];
	console.log(itinDays);
	for (let i=0; i<itinDays.length; i+=1) {
		let day = itinDays[i];
		let blocks = day.getElementsByClassName("itinblock");
		let courses = [];
		for (let j=0; j<blocks.length; j+=1) {
			let el = blocks[j];
			let title = el.firstChild.title;
			let titleSp = title.split(" ");
			let dept = titleSp[0];
			let course = titleSp[1];
			let pos = el.offsetTop;
			let time = (pos-0.0) * (timeDelta-0.0) / (pageDelta-0);

			let height = el.firstChild.style.height;

			console.log("_____");
			console.log(el);
			console.log(pos);
			console.log(time);
			console.log(timeDelta / pageDelta);
			courses.push(
				[dept,course,pos,time - (0-initialTime),
				height]
			);
		}
		courseTables.push(courses);
	}
	return courseTables;
}

function extractCourses() {
	let times = extractCourseTimes();
	let nums = extractCourseNumbers();
	for (let i=0; i<times.length; ++i) {
		let d = times[i][0];
		let c = times[i][1];
		for (let j=0; j<nums.length; ++j) {
			if (nums[j][0] == d && nums[j][1] == c) {
				times[i].push(nums[j][2]);
				break;
			}
		}
	}
	return times;
}

function clearSched() {
	let km = document.getElementsByClassName("sched-ext");
	for (let i=km.length-1; i>=0; --i) {
		km[i].remove();
	}
}


function makeItinBlock(name, top, height, mess) {
	let bl = document.createElement("div");
	bl.className = "itinblock sched-ext";
	bl.style.top = top + 'px';
	bl.style.pointerEvents= 'none';
	//bl.textContent = mess;

	let inner = document.createElement("div");
	inner.className = "itinblock-bg";
	inner.style.backgroundColor = "rgb(0,91,163)";
	inner.style.opacity = "0.7";
	inner.style.height = height;
	bl.appendChild(inner);

	let label = document.createElement("div");
	label.className = "itinblock-label";
	label.style.color = "rgb(255, 255, 255)";
	label.setAttribute("unselectable", 'on');
	label.textContent = mess + '\n' + name;
	inner.appendChild(label);

	return bl;
}

function loadSchedule(name, schedule) {
	clearSched();
	let days = document.getElementsByClassName("itin-day");
	const [initialTime, timeDelta, pageDelta] = extractScaling();
	console.log(days);
	console.log(schedule);
	for (let i=0; i<days.length; ++i) {
		let d = days[i].getAttribute("data-day") - 1;
		let day = schedule[d];
		console.log(days[i]);
		console.log(day);
		for (let j=0; j<day.length; ++j) {
			let bl = makeItinBlock(
				name,
				day[j][2],
				day[j][4],
				day[j][0]+' '+day[j][1]
			);
			days[i].appendChild(bl);
		}
	}
}


function makeSelect(users) {
	let header = document.getElementsByClassName("panel-heading");
	if (header.length == 0) {
		console.log("No panel heading!");
		return;
	}
	header = header[0];

	let select = document.createElement("select");
	select.id = "sched-select";
	select.className = "btn";
	select.style.borderWidth = "1px";
	select.style.borderColor = "#204d74";
	select.onchange = loadS;

	let opt = document.createElement("option");
	opt.value = "";
	opt.textContent = "--";
	select.appendChild(opt);

	for (let i=0; i<users.length; ++i) {
		let opt = document.createElement("option");
		opt.value = users[i];
		opt.textContent = users[i];
		select.appendChild(opt);
	}
	header.appendChild(select);
}

function addShareButton() {
	let header = document.getElementsByClassName("panel-heading");
	if (header.length == 0) {
		console.log("No panel heading!");
		return;
	}
	header = header[0];

	let btn = document.createElement("button");
	btn.className = "btn btn-primary";
	btn.textContent = "Share Schedule";
	btn.addEventListener("click", shareSchedule);
	header.appendChild(btn);


	/*let loadbtn = document.createElement("button");
	loadbtn.className = "btn btn-primary";
	loadbtn.textContent = "Load";
	loadbtn.addEventListener("click", loadS);
	header.appendChild(loadbtn);*/

	/*let clearbtn = document.createElement("button");
	clearbtn.className = "btn btn-primary";
	clearbtn.textContent = "Clear";
	clearbtn.addEventListener("click", clearSched);
	header.appendChild(clearbtn);*/

	/*let inp = document.createElement("input");
	inp.id = "room-input";
	header.appendChild(inp);

	let loadrooms = document.createElement("button");
	loadrooms.textContent = "go";
	loadrooms.addEventListener("click", loadRoom);
	header.appendChild(loadrooms);*/
}



let server_url = 'http://localhost:8080';
let room = "test-world";
let uid = '';
let name = '';

async function loadS() {
	let sel = document.getElementById("sched-select");
	let hisname = sel.options[sel.selectedIndex].value;
	if (hisname == "") return;

	try {
		const resp = await fetch(
			server_url+"/get?uid="+uid+"&name="+hisname
		);
		let sched = await resp.json();
		if (sched['type'] == "success") {
			console.log(sched);
			let data = sched["data"];
			loadSchedule(data[0], data[2]);
		}
	} catch (error) {
		console.error(error.message);
	}
}

async function loadRoom() {
	//let room = document.getElementById("room-input").value;

	let rooms = [];
	try {
		const resp = await fetch(
			server_url+"/rooms?uid="+uid,
			{credentials:"include"}
		);
		let rooms_c = await resp.json();
		if (rooms_c['type'] == "success") {
			rooms = rooms_c["data"];
		} else {
			console.error("bad bad bad");
			return;
		}
	} catch (error) {
		console.error(error.message);
		return;
	}

	let users = [];

	for (let i=0; i<rooms.length; ++i) {
		let room = rooms[i];
		try {
			const resp = await fetch(
				server_url+"/list?uid="+uid+"&room="+room,
				{credentials:"include"}
			);
			let rooms_c = await resp.json();
			if (rooms_c['type'] == "success") {
				let us = rooms_c["data"];
				for (let j=0; j<us.length; ++j) {
					if (!users.includes(us[j])){ 
						users.push(us[j]);
					}
				}
			}
		} catch (error) {
			console.error(error.message);
			return;
		}
	}
	makeSelect(users);
}
async function shareSchedule() {
	let cs = extractCourses();
	try {
		const resp = await fetch(
			server_url+"/share?uid="+uid,
			{
			method:"POST",
			body:JSON.stringify([name,uid,cs])
			}
		);
		console.log(resp);
	} catch (error) {
		console.error(error.message);
	}
}

async function auth(uid) {
	try {
		const resp = await fetch(
			server_url+"/auth",
			{
			method:"POST",
			body:JSON.stringify({"uid":uid})
			}
		);
	} catch (error) {
		console.error(error.message);
	}
}

async function setup() {
	let items = await browser.storage.local.get(["uid","name", "server"]);
	if ('uid' in items && 'name' in items && 'server' in items) {
		server_url = items.server;
		uid = items.uid;
		auth(uid);
		name = items.name;
		addShareButton();
		loadRoom();
	} else {
		// Prompt user to do something
		alert("not registered");
	}
}




function waitSetup(mlist, ob) {
	for (let i=0; i<mlist.length; ++i) {
		let m = mlist[i];
		if (m.type == "childList") {
			if (m.target.classList.contains("itin-day")) {
				setup();
				ob.disconnect();
				return;
			}
		}
	}
} 

const ob = new MutationObserver(waitSetup);
ob.observe(
	document.getElementsByTagName("body")[0],
	{subtree:true, childList:true}
);
