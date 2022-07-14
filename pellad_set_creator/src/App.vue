<template>
    <div class="main">
        <div class="manage">
            <div class="row" style="justify-content: space-around">
                <!-- manage songs button - shows or hides the collapse -->
                <button type="button" class="button" @click="toggleSongsManager()">Manage songs</button>
                <!-- clear setlist buttons -->
                <button type="button" class="button danger" @click="clearSetlist()">Clear setlist</button>
            </div>
            <!-- collapse section -->
            <div class="row">
                <div class="collapse" id="collapse">
                    <div class="collapse-content" id="collapse_content">
                        <!-- add song section - if you see some weird styling, it's just for mobile compatibility-->
                        <div class="add-song">
                            <label style="margin-left: 0.5rem">Add a new song</label>
                            <div class="row new-song">
                                <!-- all inputs are bound to their respective reactive properties with the v-model directive -->
                                <!-- this facilitates quite a lot adding a new song to the list of available songs -->
                                <div>
                                    <input type="text" class="input-textbox" placeholder="Song title" name="song_title" v-model="new_song_title" id="song_name">
                                </div>
                                <div class="row">
                                    <input type="text" class="input-textbox" placeholder="mm" style="width: 40px" name="song_mins" v-model="new_song_duration_mins" id="song_mins">
                                    <input type="text" class="input-textbox" placeholder="ss" style="width: 40px" name="song_secs" v-model="new_song_duration_secs" id="song_secs">
                                    <label for="song_is_cover">Cover</label>
                                    <input type="checkbox" name="song_is_cover" v-model="new_song_is_cover" id="song_is_cover">
                                </div>
                                <!-- add button -->
                                <div style="padding: 0.5rem; justify-content: center;">
                                    <button type="button" class="button" @click="addSong()">Add</button>
                                </div>
                            </div>
                        </div>
                        <!-- delete song section -->
                        <div class="delete-song" style="margin-top: 1rem">
                            <label style="margin-left: 0.5rem">Delete a song</label>
                            <div class="delete-song-content">
                                <!-- dropdown from which the user can select which song to delete -->
                                <div style="display: flex; flex: 1">
                                    <select name="delete_song_dropdown" class="input-textbox" id="delete_song_dropdown">
                                        <template v-for="song in songs" :key="song.id">
                                            <option :value="song.id">{{song.name}}</option>
                                        </template>
                                    </select>
                                </div>
                                <!-- delete button -->
                                <div class="delete-song-button">
                                    <button type="button" class="button danger" @click="deleteSong()">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="songs-picker">
            <!-- loop through each song -->
            <template v-for="song in songs" :key="song.id">
                <label :for="song.name" class="fake-checkbox noselect" @click="toggleSong(song)" :id="`${song.id}_label`">
                    {{song.name}}
                    <!-- add cover badge if the current song is a cover -->
                    <template v-if="song.isCover">
                        <span class="cover">cover</span>
                    </template>
                </label>
                <input type="checkbox" :name="song.name" :id="song.id" style="display: none">
            </template>
        </div>
        <div class="setlist-area">
            <template v-if="setlist.length > 0">
                <div class="setlist">
                    <!-- total time -->
                    <div class="row total-time">
                        <span>total time: {{totalTime}}</span>
                    </div>
                    <!-- song row -->
                    <template v-for="(song, idx) in setlist" :key="idx">
                        <div class="row">
                            <div class="track" draggable="true" :id="`${song.id}_track`">
                                <div>{{idx + 1}}</div>
                                <div style="display: flex; align-items: center">
                                    {{song.name}}
                                    <!-- add cover badge if the current song is a cover -->
                                    <template v-if="song.isCover">
                                        <span class="cover">cover</span>
                                    </template>
                                </div>
                                <div>{{song.duration}}</div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <!-- message to show in case of empty setlist -->
            <template v-else>
                <div class="row" style="justify-content: center">
                    <span style="text-align: center">setlist is empty. add a song by tapping on its title!</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            songs: [],
            setlist: [],
            totalTime: null,
            new_song_title: null,
            new_song_duration_mins: null,
            new_song_duration_secs: null,
            new_song_is_cover: false,
        }
    },
    mounted() {
        this.loadSongs();
    },
    methods: {
        loadSongs: function(){
            // HTTP GET the songs
            this.axios.get("https://texflip.altervista.org/pellad_set_creator/songGET.php")
                    .then(res => {
                        this.songs = []
                        for (let song of res.data) {
                            song["duration"] = this.format_seconds(song["duration"])
                            song["isCover"] = parseInt(song["isCover"]) ? true : false;
                            this.songs.push(song);
                        }
                    })
        },
        toggleSong: function(song) {
            const id = song.id
            const checkbox = document.getElementById(id)
            const label = document.getElementById(`${id}_label`)
            // declare variable that's going to hold the actual
            // html element of the song in the setlist
            let track = null

            // add song to the setlist array and add "checked" class to its label
            if(!checkbox.checked) {
                this.setlist.push(song)
                label.classList.add('checked')
                // the following code will be executed at the next page render,
                // since the html element of the song in the setlist hasn't been
                // rendered yet thus it's not present in the DOM
                this.$nextTick(() => {
                    // assign html element to the variable
                    track = document.getElementById(`${id}_track`)
                    // add drag & drop event listeners to the track element in the setlist
                    this.addEventListeners(track)
                })
            // remove song from the array and remove "checked" class from its label
            } else {
                // assign html element to the variable
                track = document.getElementById(`${id}_track`)
                label.classList.remove('checked')
                // remove drag & drop event listeners to the track element in the setlist
                this.removeEventListeners(track)
                this.setlist.splice(this.setlist.indexOf(song), 1)
            }

            // invert value of the checkbox
            checkbox.checked = !checkbox.checked
            // update total time value
            this.calculateTotalTime()
        },
        calculateTotalTime: function() {
            if(this.setlist.length > 0) {
                // creating a moment object with time 00:00
                // the actual duration time will be added later
                // this.totalTime = moment(0, 'mm:ss')
                let tot_time_in_sec = 0

                // sum duration of each song to the base moment object
                this.setlist.forEach(song => {
                    // split string to get minutes and seconds
                    let split_time = song.duration.split(':')
                    let minutes = parseInt(split_time[0])
                    let seconds = parseInt(split_time[1])

                    // add current song duration to the base moment object
                    // let tmp_time = moment.duration({ minutes: minutes, seconds: seconds })
                    // this.totalTime.add(tmp_time)
                    tot_time_in_sec += minutes * 60 + seconds
                })

                // assign the new total time to the reactive property
                // this.totalTime = this.totalTime.format('mm:ss')
                this.totalTime = this.format_seconds(tot_time_in_sec)
            
            } else {
                this.totalTime = null
            }
        },
        clearSetlist: function() {
            // uncheck every checkbox and remove "checked" class from its label
            this.songs.forEach(song => {
                document.getElementById(song.id).checked = false
                document.getElementById(`${song.id}_label`).classList.remove('checked')
            })
            // clear setlist array and total time
            this.setlist = []
            this.totalTime = null
        },
        toggleSongsManager: function() {
            const collapse = document.getElementById('collapse')
            const content = document.getElementById('collapse_content')

            if(collapse.classList.contains('open')) {
                collapse.classList.remove('open')
                // wait for css to complete the animation
                new Promise(resolve => setTimeout(() => resolve(), 150))
                    // hide collapse content
                    .then(() => content.style.display= 'none')
            } else {
                // open collapse and show its content
                collapse.classList.add('open')
                content.style.display = 'flex'
            }
        },
        addSong: function() {
            // making sure inputs are okay
            let min = parseInt(this.new_song_duration_mins);
            let sec = parseInt(this.new_song_duration_secs);
            if(this.new_song_title && isFinite(min) && isFinite(sec) && 
                min >= 0 && min <= 60 && sec >= 0 && sec <= 60
            ) {
                this.axios.post("https://texflip.altervista.org/pellad_set_creator/songPOST.php", {
                    type: "add",
                    name: this.new_song_title,
                    duration: min * 60 + sec,
                    isCover: this.new_song_is_cover ? 1 : 0
                }).then(res => {
                    console.log(res)
                    this.loadSongs();
                    // clear inputs
                    this.clearNewSongInputs()
                })
            } else {
                alert('nope! try again')
                this.clearNewSongInputs()
            }
        },
        deleteSong: function() {
            let songId = document.getElementById('delete_song_dropdown').value
            let index = this.getSongIndexById(songId)
            let name = this.songs[index]["name"];

            this.axios.post("https://texflip.altervista.org/pellad_set_creator/songPOST.php", {
                    type: "del",
                    name: name,
                }).then(res => {
                    console.log(res)
                    this.loadSongs();
                })
        },
        clearNewSongInputs: function() {
            this.new_song_title = null
            this.new_song_duration_mins = null
            this.new_song_duration_secs = null
            this.new_song_is_cover = false
        },
        addEventListeners: function(track) {
            track.addEventListener('dragstart', this.dragStart)
            track.addEventListener('dragover', (e) => {
                let bb = e.target.getBoundingClientRect();
                let center = (bb.top + bb.bottom)/2.;
                console.log(center-e.y); // relative position to element center
                e.preventDefault()
            })
            track.addEventListener('drop', (e)  => {

                console.log(e.target.id)
            })
        },
        dragStart: function() {
            console.log('yep')
        },
        swapSongs: function(id_s1, id_s2) {
            let index1 = this.setlist.map(item => item["id"]).indexOf(id_s1);
            let index2 = this.setlist.map(item => item["id"]).indexOf(id_s2);
            let temp = this.setlist[index1];
            this.setlist[index1] = this.setlist[index2];
            this.setlist[index2] = temp;
        },
        getSongIndexById: function(id){
            return this.songs.map(item => item["id"]).indexOf(id)
        },
        removeEventListeners: function(track) {
            track.removeEventListener('drag', this.dragStart())
        },
        format_seconds: function(time) {
            time = parseInt(time);
            let time_str = "";
            let hours = Math.floor(time / 3600);
            if (hours > 0){
                hours = hours > 9 ? String(hours) : "0" + hours;
                time = time - hours * 3600;
                time_str = hours + ":";
            }
            let min = Math.floor(time / 60);
            let sec = time - min * 60;

            min = min > 9 ? String(min) : "0" + min;
            sec = sec > 9 ? String(sec) : "0" + sec;
            
            time_str += min + ":" + sec;

            return time_str;
        }
    }
}
</script>