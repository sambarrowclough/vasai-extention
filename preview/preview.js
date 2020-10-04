
var app = "https://vasai.app"
// var app = "https://evening-plains-55074.herokuapp.com"
// var app = "http://localhost:4000"
var video = document.querySelector('video');
var input = document.querySelector('input');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
var fduration = document.querySelector('#file-duration');
var fresolutions = document.querySelector('#file-resolutions');
var header = document.querySelector('header');
var header = document.querySelector('header');
var result = document.querySelector('#result');
var l = console.log
var browserCache = document.querySelector('#browser-cache');
let vc = document.querySelector("#vc")
let v = document.querySelector("#v")
let bg = document.querySelector("#bg")
var b = document.querySelector("button")
let w,h,x,y
let ovw
var cr = document.querySelector("#cr")
var head = document.querySelector("#head")
var remote = document.querySelector("#remote")
var play = document.querySelector("#play")
var pause = document.querySelector("#pause")

var cp = document.querySelector("#cp")
var dl = document.querySelector("#dl")
var cpi = document.getElementById("cpi");
var cpt = document.getElementById("cpt");
var dot = document.querySelector('.dot-windmill')
cpv = ""
var detect = ""

var playing=false
video.addEventListener('click', (e)=> {
	if (playing){
		video.pause()
		playing=false
	} else {
		video.play()
		playing=true
	}
})

var btnRecordingsListDropDown = document.querySelector('#btn-recordings-list-dropdown');
// document.querySelector('#btn-recordings-list').onclick = function(e) {
//     e.stopPropagation();

//     if (btnRecordingsListDropDown.className === 'visible') {
//         btnRecordingsListDropDown.className = '';
//         btnRecordingsListDropDown.innerHTML = '';
//     } else {
//         btnRecordingsListDropDown.className = 'visible';

//         btnRecordingsListDropDown.innerHTML = '';
//         DiskStorage.GetFilesList(function(list) {
//             if (!list.length) {
//                 btnRecordingsListDropDown.className = '';
//                 alert('You have no recordings.');
//                 return;
//             }

//             list.forEach(function(item) {
//                 var div = document.createElement('div');
//                 div.innerHTML = '<img src="images/cross-icon.png" class="cross-icon"><img src="images/edit-icon.png" class="edit-icon">' + item.display;
//                 btnRecordingsListDropDown.appendChild(div);

//                 div.querySelector('.cross-icon').onclick = function(e) {
//                     e.preventDefault();
//                     e.stopPropagation();

//                     if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
//                         return;
//                     }

//                     function afterDelete() {
//                         if (div.previousSibling) {
//                             div.previousSibling.click();
//                         } else if (div.nextSibling) {
//                             div.nextSibling.click();
//                         } else {
//                             location.reload();
//                         }

//                         div.parentNode.removeChild(div);
//                     }

//                     DiskStorage.RemoveFile(item.name, function() {
//                         if(!item.php || !item.php.length) {
//                             afterDelete();
//                             return;
//                         }

//                         deleteFromPHPServer(item.name, afterDelete);
//                     });
//                 };

//                 div.querySelector('.edit-icon').onclick = function(e) {
//                     e.preventDefault();
//                     e.stopPropagation();

//                     var newFileName = prompt('Please enter new file name', item.display) || item.display;

//                     DiskStorage.UpdateFileInfo(item.name, {
//                         display: newFileName
//                     }, function() {
//                         item.display = newFileName;

//                         onGettingFile(file, item);
//                         document.body.onclick();
//                     });
//                 };

//                 div.onclick = function(e) {
//                     e.preventDefault();
//                     e.stopPropagation();

//                     DiskStorage.Fetch(item.name, function(file) {
//                         onGettingFile(file, item);
//                     });

//                     document.body.onclick();
//                 };

//                 if (file && file.item && file.item.name === item.name) {
//                     div.className = 'btn-upload-dropdown-selected';
//                 }
//             });
//         });
//     }
// };

var recentFile = localStorage.getItem('selected-file');
DiskStorage.GetLastSelectedFile(recentFile, function(file) {
	if (!file) {
		onGettingFile(file);
		return;
	}

	DiskStorage.GetFilesList(function(list) {
		if (!recentFile) {
			onGettingFile(file, list[0]);
			return;
		}

		var found;
		list.forEach(function(item) {
			if (typeof item === 'string') {
				if (item === recentFile) {
					found = {
						name: item,
						display: item,
						php: '',
						youtube: ''
					};
				}
			} else if (item.name === recentFile) {
				found = item;
			}
		});

		if (!found) {
			onGettingFile(file, list[0]);
			return;
		}

		onGettingFile(file, found);
	});
});

dot.style.display="block"
function onGettingFile(f, item) {
	file = f;
	l(f)

	if (!file) {
		if (item && item.name) {
			header.querySelector('p').innerHTML = item.display + ' has no video data.';
			header.querySelector('span').innerHTML = '';
		} else {
			header.querySelector('p').innerHTML = 'You did NOT record anything yet.';
			header.querySelector('span').innerHTML = '';
		}
		return;
	}

	file.item = item;

	if(!file.url || file.url.toString().toLowerCase().indexOf('youtube') !== -1) {
		file.url = URL.createObjectURL(file);
	}

	// Shae file
	fetch(file.url)
		.then(r => r.blob())
		.then(b => {
			l(b)
			var fd = new FormData()
			fd.append("upl", b, "input.webm")
			fetch(app + "/share", {
				method:'post',
				body:fd
			})
				.then(r => r.json())
				.then(b => {
					let { id } = b
					/* Get the text field */
					if (detect) {
						cpv = app + "/" + id + "?detect="+detect
					} else {
						cpv = app+ "/" + id
					}

					cpt.value = cpv
					cpt.focus()
					cpt.select()
					input.classList.remove("animate")
					cpb.classList.remove("disabled")
				})
		})

	var urlParams = new URLSearchParams(window.location.search);
	detect = urlParams.get("detect")

	if (detect) {
		console.log(detect)
		video.src = file.url;
		video.currentTime = 9999999999;
		video.onloadedmetadata = function() {
			// video.onloadedmetadata = null;

			// seek back to the beginning
			// video.currentTime = 0;
			[w,h,x,y] = detect?.split(":")
			let vw = parseInt(document.querySelector("#v").videoWidth)
			ovh = parseInt(document.querySelector("#v").videoHeight)
			ovw = vw
			vc.style.maxWidth = "1200px"
			// vc.style.maxHeight = ovh
			// vc.style.clip = `rect(${parseInt(y)}, ${vw - parseInt(x)}, ${parseInt(ovh) - parseInt(y)}, ${x})`

			video.style.width="100%"

			var rvw = parseInt(v.offsetWidth)
			var rvh = parseInt(v.offsetHeight)
			var ncw = Math.round(rvw / ovw * w)
			var ncx = Math.round(rvw / ovw * x)
			var nch = Math.round(rvh / ovh * h)
			var ncy = Math.round(rvh / ovh * y)

			vc.style.clip = `rect(${parseInt(ncy)}, ${parseInt(ncw + ncx)}, ${parseInt(nch) + parseInt(ncy)}, ${ncx})`
			//vc.style.clipPath = `inset(${parseInt(ncy)}px ${ncx}px ${parseInt(ncy)}px ${ncx}px round 1%)`

			// vc.style.top = -parseInt(ncy) + parseInt(head.offsetHeight) + 150
			vc.style.top = (parseInt(window.innerHeight) / 2) - parseInt(head.offsetHeight)

			var voh = v.offsetHeight
			var vt = Math.round(parseInt(voh) * 1.2 - voh) / 2

			bg.style.height = window.innnerHeight

			console.log(voh)
			v.play()

			dot.style.display="none"
		};

		// video.src = window.URL.createObjectURL(b);
	} else {
		// Get cropdetect params
		fetch(file.url)
			.then(r => r.blob())
			.then(b => {
				l(b)
				var fd = new FormData()
				fd.append("upl", b, "input.webm")
				fetch(app + "/detect", {
					method:'post',
					body:fd
				})
					.then(r => r.json())
					.then(r => {
						console.log(r.detect)
						video.src = file.url;
						video.currentTime = 9999999999;
						video.onloadedmetadata = function() {
							// video.onloadedmetadata = null;

							// seek back to the beginning
							// video.currentTime = 0;
							[w,h,x,y] = r?.detect?.split(":")
							let vw = parseInt(document.querySelector("#v").videoWidth)
							ovh = parseInt(document.querySelector("#v").videoHeight)
							ovw = vw
							vc.style.maxWidth = "1200px"
							// vc.style.maxHeight = ovh
							// vc.style.clip = `rect(${parseInt(y)}, ${vw - parseInt(x)}, ${parseInt(ovh) - parseInt(y)}, ${x})`

							video.style.width="100%"

							var rvw = parseInt(v.offsetWidth)
							var rvh = parseInt(v.offsetHeight)
							var ncw = Math.round(rvw / ovw * w)
							var ncx = Math.round(rvw / ovw * x)
							var nch = Math.round(rvh / ovh * h)
							var ncy = Math.round(rvh / ovh * y)

							vc.style.clip = `rect(${parseInt(ncy)}, ${parseInt(ncw + ncx)}, ${parseInt(nch) + parseInt(ncy)}, ${ncx})`
							//vc.style.clipPath = `inset(${parseInt(ncy)}px ${ncx}px ${parseInt(ncy)}px ${ncx}px round 1%)`

							// vc.style.top = -parseInt(ncy) + parseInt(head.offsetHeight) + 150
							vc.style.top = (parseInt(window.innerHeight) / 2) - parseInt(head.offsetHeight)

							var voh = v.offsetHeight
							var vt = Math.round(parseInt(voh) * 1.2 - voh) / 2

							bg.style.height = window.innnerHeight

							console.log(voh)
							v.play()

							dot.style.display="none"
						};

						// video.src = window.URL.createObjectURL(b);
					})
			}).then(console.log)

	}


	if(file.name && (file.name.indexOf('.mp3') !== -1 || file.name.indexOf('.wav') !== -1 || file.name.indexOf('.ogg') !== -1)) {
		video.style.background = 'url(images/no-video.png) no-repeat center center';
		video.currentTime = 0;
	}
	else {
		video.style.background = '';
	}

	// fname.innerHTML = item.display;
	// fsize.innerHTML = bytesToSize(file.size);


	play = false
	video.onclick = function() {
		if (play) {
			play=false
			video.pause()
		} else {
			play = true
			video.play()
		}
		// video.style.cursor = '';
		// video.play();
	};

	var html = 'This file is in your browser cache. Click <a href="' + file.url + '" download="' + file.name + '">here</a> to download.';
	if (item.php && item.youtube) {
		html = 'Click to download file from <a href="' + item.php + '" target="_blank">Private Server</a> <img src="images/cross-icon.png" class="cross-icon" title="Delete from server"> or <a href="' + item.youtube + '" target="_blank">YouTube</a>';
	} else if (item.php) {
		html = 'Click to download file from: <a href="' + item.php + '" target="_blank">' + item.php + '</a> <img src="images/cross-icon.png" class="cross-icon" title="Delete from server">';
	} else if (item.youtube) {
		html = 'Click to download file from: <a href="' + item.youtube + '" target="_blank">' + item.youtube + '</a>';
	}

	localStorage.setItem('selected-file', file.name);
}

var cpb = document.querySelector("#cpb")
cpb.onclick = async function retry() {
	/* Select the text field */
	cpt.select();
	cpt.setSelectionRange(0, 99999); /*For mobile devices*/

	document.execCommand("copy");
}

window.onresize = function(e) {
    if (true) {
        var rvw = parseInt(v.offsetWidth)
            var rvh = parseInt(v.offsetHeight)
            var ncw = Math.round(rvw / ovw * w)
            var ncx = Math.round(rvw / ovw * x)
            var nch = Math.round(rvh / ovh * h)
            var ncy = Math.round(rvh / ovh * y)

			vc.style.clip = `rect(${parseInt(ncy)}, ${parseInt(ncw + ncx)}, ${parseInt(nch) + parseInt(ncy)}, ${ncx})`
            
			//vc.style.clipPath = `inset(${parseInt(ncy)}px ${ncx}px ${parseInt(ncy)}px ${ncx}px round 1%)`
            vc.style.top = (parseInt(window.innerHeight) / 2) - parseInt(head.offsetHeight)
    }


    var voh = v.offsetHeight
    var vt = Math.round(parseInt(voh) * 1.2 - voh) / 2
    //vc.style.top = vt

    bg.style.height = window.innnerHeight
}
