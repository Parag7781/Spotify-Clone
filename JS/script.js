console.log("lets write javascript")
let songs ; 
let currentSong = new Audio();
let currentIndex = 0;
let currFolder ; 

function secondstominutes_seconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "INVALID INPUT";
  }
  const minutes = Math.floor(seconds / 60);
  const remaining_seconds = Math.floor(seconds % 60);
  //padstart : - adds characters to the beginning of a string so that the string becomes a certain length.
  // string.padStart(targetLength, padCharacter)
  // targetLength: The total length you want your string to be
  // padCharacter: The character you want to add at the start (usually '0')
  const formatted_min = String(minutes).padStart(2, '0');
  const formatted_sec = String(remaining_seconds).padStart(2, '0');

  return `${formatted_min}:${formatted_sec}`;
}

async function getSongs(folder){
  currFolder = folder;

  try{
    
 let a  = await fetch(`/${folder}/`)
  let response = await a.text()
  console.log(response)

  let div = document.createElement("div")
  div.innerHTML = response;
 let as = div.getElementsByTagName("a")
 songs =[] ;

 for (let index = 0; index < as.length; index++) {
  const element = as[index];
  if(element.href.endsWith(".mp3") || element.href.endsWith(".m4a")){
let url = new URL(element.href)
let pathname = url.pathname , songname =decodeURIComponent(url.pathname.split("/").pop().replace(/\.(mp3|m4a)$/i,"")); 

songs.push({name:songname , path:pathname});
  }

 }
    
//show all the songs in the playlist 
  
let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0] ;
songUL.innerHTML="" ;

songs.forEach((song)=>{
songUL.innerHTML +=  `<li>
<img class="invert" src="img/music.svg" style="width:40px" alt="">  
<div class="info">
<div>${song.name}</div>
</div>
<div class="play-now">
<span>Play Now</span>
<img class="invert icon" src="img/playnow.svg" style="width:40px" alt="">
</div>
</li>`
})

// attach event listener to each song  

 Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e,index)=>{

e.addEventListener("click",()=>{
  currentIndex=index
const selected_song = songs[index].path;
 console.log("Now Playing:", songs[index].name);
playmusic(selected_song)
})
 })

return songs
} 
  catch(error){
console.log("Error:",error)
return [];
  }
}

 

function playmusic(track){
  
  // let audio = new Audio(track) - becoz when we click ek naya object banata hai isiliye ek hi object banana hai
  // track is pathname 
  const gaana = decodeURIComponent(track.split("/").pop().replace(/\.(mp3|m4a)$/i,""))
currentSong.src = track
console.log("Now Playing:", gaana);
currentSong.play()
play.src = "img/pause.svg"
 document.querySelector(".song-info").innerHTML = gaana
  document.querySelector(".song-time").innerHTML = "00:00/00:00"

}
 
async function displayALBUMS(){
   console.log(`Displaying Albums`)
   

  let a  = await fetch(`/songs/`)
  let response = await a.text()
 
  let div = document.createElement("div")
 
  div.innerHTML = response;
 let anchors = div.getElementsByTagName("a")
 let cardcontainer = document.querySelector(".cardcontainer")

 let array = Array.from(anchors) 
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
  if(e.href.includes("/songs") && !(e.href.endsWith("/songs") ) && !(e.href.includes("Thumbs.db"))){
    let folder = e.href.split("/").slice(-1)[0]
   // Get the metadata of the folder

   let a  = await fetch(`/songs/${folder}/pcp.json`)
   let meta = await a.json()
  cardcontainer.innerHTML+=`<div data-folder="${folder}"  class="card ">
                        <div class="play-button">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50" fill="#1ED760" />
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${meta.title} </h2>
                        <p>${meta.description}</p>
                    </div>`
  }
    
  }
  // LOAD THE PLAYLIST WHEN CLICKED 
 Array.from(document.getElementsByClassName("card")).forEach(e=>{
  e.addEventListener("click", async item=>{
 console.log(`fetching the songs `)
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
  })
 })
} 

// as getsongs function return promise we need to make function 

async function main(){

  //geting the lsit of the first song 
 await getSongs("songs/Instrumental")
//playmusic(songs[0].path)

await displayALBUMS()

// add event listener to play , next , previous

play.addEventListener("click",()=>{
if(currentSong.paused){
  currentSong.play()
  play.src= "img/pause.svg"
}
else{
  currentSong.pause()
  play.src = "img/play.svg"
}
})

previous.addEventListener("click",()=>{
  console.log(`pre is clicked`)
  if(currentIndex>0){
    currentIndex-- ; 
    playmusic(songs[currentIndex].path)
  }
})

next.addEventListener("click",()=>{
if(currentIndex<songs.length-1){
    currentIndex++ ; 
    playmusic(songs[currentIndex].path)
}
})

// adding event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  const seekbar = e.currentTarget; // Always target .seekbar
  const seekbar_width = seekbar.getBoundingClientRect().width;
  const clickX = e.offsetX; // Relative to .seekbar
  const percentage = (clickX / seekbar_width) * 100;
  document.querySelector(".circle").style.left = `${percentage}%`;
  currentSong.currentTime = (percentage / 100) * currentSong.duration;
  
});

  //time update event
currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".song-time").innerHTML = `${secondstominutes_seconds(currentSong.currentTime)}/${secondstominutes_seconds(currentSong.duration)}`

    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  //add event listener to volume

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
console.log(`the value clicked is ${e.target.value}/100`)

currentSong.volume = parseInt(e.target.value)/100;
if(currentSong.volume>0){
  document.querySelector(".volume>img").src =   document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg")
}

  })
//add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click",(e)=>{
  console.log(e.target)
  if(e.target.src.includes("volume.svg")){
    e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
    currentSong.volume = 0 
     document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

  }
  else{
e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
currentSong.volume = 0.10 ;
  document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
  }
})

//hamburger

document.querySelector(".hamburger").addEventListener("click",()=>{
  console.log(`hamburger is clicked`)
  document.querySelector(".left").style.left="0px"
})


// close
document.querySelector(".close").addEventListener("click",()=>{
console.log(`close is clicked`)
  document.querySelector(".left").style.left="-120%"
})

// add event listner to search
document.querySelector(".home li:nth-child(2").addEventListener("click",()=>{
const song_name = prompt("Enter the song name")
if(!song_name){
  return ; 
}
const lowercase_song_name = song_name.toLowerCase()
const filter_song = songs.filter(song=>song.name.toLowerCase().includes(lowercase_song_name))

if(filter_song.length==0){
  alert("No songs")
}

let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
songUl.innerHTML=""

filter_song.forEach((song)=>{
  
songUl.innerHTML +=  `<li>
<img class="invert" src="img/music.svg" style="width:40px" alt="">  
<div class="info">
<div>${song.name}</div>
</div>
<div class="play-now">
<span>Play Now</span>
<img class="invert icon" src="img/playnow.svg" style="width:40px" alt="">
</div>
</li>`

})

// add event listneer to play the song
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e,index)=>{
  e.addEventListener("click",()=>{
    currentIndex = index 
    const select_song = filter_song[currentIndex].path

    const selected_song_name = filter_song[currentIndex].name
    playmusic(select_song)
  })
})



})

// add event listener to login 
document.querySelector(".login-btn").addEventListener("click",()=>{
  const user_name = prompt("Enter the username")
  const password =  prompt("Enter the password") 

  
  if(user_name && password){
const user={
    name : user_name , pass : password
  };
    localStorage.setItem("user" , JSON.stringify(user) )
    alert("Logged in!")
  }
   
})

}

main()


