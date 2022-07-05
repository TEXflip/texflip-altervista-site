function songCURD(type, songname, time){
	const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
		if (type=="add"){
        	setlist.addSong(songname, time);
        }
        else{
        	setlist.delRow(songname);
        }
    }
    xhttp.open("POST", "songCURD.php", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    let data = {"songname":songname, "duration": time, "type": type};
    xhttp.send(JSON.stringify(data));
}

class SetList{
    constructor(){
        this.songtable = document.getElementById("songtable");
        this.songDict = {}; // {song: time} dictionary
        this.tottime = 0.0; // total time in seconds
        this.tottime_el = document.getElementById("tottime")
        this.tottime_el.innerHTML = "00:00"
    }

    addSong(song, time){
        this.generateRow(song, time)
        this.songDict[song] = time
    }
    
    delRow(song){
    	let children = this.songtable.children;
        for (let i = 0; i < children.length; i++) {
            let el = children[i];
            if (el.getAttribute("value") == song){
                el.remove();
                if (el.checked)
                       this.tottime -= this.songDict[song];
            }
        } 
        delete this.songDict[song];
    }
    
    generateRow(songname, time){
        let songname_el = document.createElement("div")
        let time_el = document.createElement("div")
        
        let checkbox = document.createElement("input")
        checkbox.setAttribute("type", "checkbox")
        let _this = this
        checkbox.addEventListener("change", function (el){
            if (this.checked) 
                _this.tottime += _this.songDict[this.value];
            else
                _this.tottime -= _this.songDict[this.value];
            _this.tottime_el.innerHTML = _this.time_format(_this.tottime)
        })
        songname_el.setAttribute("value", songname);
        time_el.setAttribute("value", songname);
        checkbox.setAttribute("value", songname);
        
        songname_el.innerHTML = songname
        time_el.innerHTML = this.time_format(time)
        
        this.songtable.appendChild(songname_el)
        this.songtable.appendChild(time_el)
        this.songtable.appendChild(checkbox)
    }

    time_format(time) {
        var sec_num = time;
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    }
}
var setlist = null;

window.onload = function(){
    document.getElementById("addsong_btn").addEventListener("click", function (el){
        let songname = document.getElementById("addsong_name").value;
        let duration = document.getElementById("addsong_time").value;
        songCURD("add", songname, duration);
    })
    document.getElementById("delsong_btn").addEventListener("click", function (el){
        let songname = document.getElementById("addsong_name").value;
        songCURD("del", songname, "");
    })
    setlist = new SetList()
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
    	let songs = JSON.parse(this.responseText)
        for (s of songs)
        	setlist.addSong(s["songname"], parseInt(s["duration"]))
    }
    xhttp.open("GET", "loadSongs.php", true);
    xhttp.send();
}