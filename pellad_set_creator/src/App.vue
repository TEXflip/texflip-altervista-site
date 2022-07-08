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
                <label :for="song.name" class="fake-checkbox" @click="toggleSong(song)" :id="`${song.id}_label`">
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
                            <div class="track">
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
import moment from 'moment'

export default {
    data() {
        return {
            songs: [
                {
                    "id": "cookies",
                    "name": "Cookies In The Dark",
                    "duration": "06:11", 
                    "isCover": false
                },
                {
                    "id": "wintersun",
                    "name": "Winter Sun",
                    "duration": "05:56", 
                    "isCover": false 
                },
                {
                    "id": "sam",
                    "name": "Sam",
                    "duration": "04:58",
                    "isCover": false 
                },
                {
                    "id": "akita",
                    "name": "Akita",
                    "duration": "05:29",
                    "isCover": false 
                },
                {
                    "id": "deadendblues",
                    "name": "Dead End Blues",
                    "duration": "05:16", 
                    "isCover": false 
                },
                {
                    "id": "unknow",
                    "name": "Unknow",
                    "duration": "04:58", 
                    "isCover": false 
                },
                {
                    "id": "lighthouse",
                    "name": "Lighthouse",
                    "duration": "06:01", 
                    "isCover": false 
                },
                {
                    "id": "trimmer",
                    "name": "Trimmer",
                    "duration": "03:38", 
                    "isCover": false
                },
                {
                    "id": "therestime",
                    "name": "There's Time",
                    "duration": "04:36", 
                    "isCover": false 
                },
                {
                    "id": "thepot",
                    "name": "The Pot",
                    "duration": "06:21",
                    "isCover": true
                }
            ],
            setlist: [],
            totalTime: null,
            new_song_title: null,
            new_song_duration_mins: null,
            new_song_duration_secs: null,
            new_song_is_cover: false,
        }
    },
    mounted() {
        // check if the songs object is already stored in session
        if(localStorage.getItem('songs')) {
            // populate songs list from the object retrieved from session
            this.songs = JSON.parse(localStorage.getItem('songs'))
        } else {
            // store songs in session
            this.storeSongs()
        }
    },
    methods: {
        toggleSong: function(song) {
            const id = song.id
            const checkbox = document.getElementById(id)
            const label = document.getElementById(`${id}_label`)

            // add song to the setlist array and add "checked" class to its label
            if(!checkbox.checked) {
                this.setlist.push(song)
                label.classList.add('checked')
            // remove song from the array and remove "checked" class from its label
            } else {
                label.classList.remove('checked')
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
                this.totalTime = moment(0, 'mm:ss')

                // sum duration of each song to the base moment object
                this.setlist.forEach(song => {
                    // split string to get minutes and seconds
                    let split_time = song.duration.split(':')
                    let minutes = parseInt(split_time[0])
                    let seconds = parseInt(split_time[1])

                    // add current song duration to the base moment object
                    let tmp_time = moment.duration({ minutes: minutes, seconds: seconds })
                    this.totalTime.add(tmp_time)
                })

                // assign the new total time to the reactive property
                this.totalTime = this.totalTime.format('mm:ss')
            
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
            if(this.new_song_title !== '' && parseInt(this.new_song_duration_mins) && parseInt(this.new_song_duration_secs)) {
                // create new starting moment object
                let songTime = moment(0, 'mm:ss')
                // create duration object to be added to the starting object
                // using the values inserted in the input textboxes
                let duration = moment.duration({
                    minutes: parseInt(this.new_song_duration_mins),
                    seconds: parseInt(this.new_song_duration_secs)
                })
    
                // make new song object
                let newSong = {
                    "id": this.new_song_title.replace(/\s/g, "").toLowerCase(),
                    "name": this.new_song_title,
                    "duration": songTime.add(duration).format('mm:ss'),
                    "isCover": this.new_song_is_cover
                }

                console.log(newSong)
    
                // add new song to the songs array
                this.songs.push(newSong)
                this.storeSongs()
                // clear inputs
                this.clearNewSongInputs()
                
            } else {
                alert('nope! try again')
                this.clearNewSongInputs()
            }
        },
        deleteSong: function() {
            let song = document.getElementById('delete_song_dropdown').value
            this.songs.splice(this.songs.indexOf(song), 1)
            this.storeSongs()
        },
        storeSongs: function() {
            localStorage.setItem('songs', JSON.stringify(this.songs))
        },
        clearNewSongInputs: function() {
            this.new_song_title = null
            this.new_song_duration_mins = null
            this.new_song_duration_secs = null
            this.new_song_is_cover = false
        }
    }
}
</script>