//console.log("hello mitro")

let currentSong = new Audio();
let songs;
let currFolder;

function secondsTominSec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)

    let response = await a.text();
    // //console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // //console.log(as);
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push((element.href.split(`/songs/${folder}/`)[1]))
            // //console.log((element.href.split(`/songs/${folder}/`)[1]))
        }
    }


    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        const diplayname = song.replaceAll("%5BSPOTIFY-DOWNLOADER.COM%5D%20","").replaceAll("%2C", ",").replaceAll("%20", " ")
        songUL.innerHTML = songUL.innerHTML + `<li data-filename="${song}">
                            <img class="invert" src="./svg/music.svg" alt="">
                            <div class="info">
                                <div> ${diplayname}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="./svg/play.svg" alt="" srcset="">
                            </div>
                        </li>`;
    }

    //play song
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata",()=>{
    //     //console.log(audio.duration, audio.currentTime , audio.currentSrc)
    // });


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // //console.log(e.querySelector(".info").firstElementChild.innerHTML)
            // //console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
            const p = e.dataset.filename;
            ////console.log(p,songs.length)

            playMusic(p)
        })
    })

}


const playMusic = (track, pause = false) => {
    //console.log(track)
    currentSong.src = `/songs/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "./svg/pause.svg";

    }
    const songInfo = document.querySelector(".songinfo");
    if (songInfo) {
        songInfo.innerHTML = `${track.replaceAll("%5BSPOTIFY-DOWNLOADER.COM%5D%20","").replaceAll("%2C", ",").replaceAll("%20", " ")}`;
    }

    const songTime = document.querySelector(".songtime");
    if (songTime) {
        songTime.innerHTML = "00.00/00.00";
    }
}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)

    let response = await a.text();
    // //console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    //console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")
//     if (!cardContainer) {
//     // //console.error("Element with class `.cardContainer` not found!");
//     return;
// }

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //meta data of folder
            //console.log(folder)
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            //console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <img src="./svg/play.svg" alt="" srcset="">
                        </div>
                        <img src="./songs/${folder}/cover.jpeg" alt=">">
                        <h2>
                            ${response.title}
                        </h2>
                        <p>${response.description}
                        </p>

                    </div>`;
        }
    }
    //load playlist song
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        //console.log(e)
        e.addEventListener("click", async item => {
            // console.log(e)
            // console.log(item,item.currentTarget.dataset)
            await getSongs(`${item.currentTarget.dataset.folder}`)
            // //console.log(songs)
            if(item.target.src.includes("play.svg"))
            {
                playMusic(songs[0])
            }
        })

        
        

        
    })

}





async function main() {
    await getSongs("NEW")
    // //console.log(songs)
    playMusic(songs[0], true);

    //display all album
    displayAlbums()


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./svg/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "./svg/play.svg";
        }
    })

    //TIME UPADTE
    currentSong.addEventListener("timeupdate", () => {
        // //console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsTominSec(currentSong.currentTime)} / ${secondsTominSec(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";


        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        })

    })

    //add hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%"
    })

    //previous and next
    prev.addEventListener("click", () => {
        // //console.log("prev");
        // //console.log(currentSong.src.split("/").slice(-1)[0])
        // //console.log(songs)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // //console.log(index,songs.length)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            //console.log(songs[index-1])
        }
        else {
            playMusic(songs[songs.length - 1])

        }

    })

    next.addEventListener("click", () => {
        // //console.log(currentSong.src.split("/").slice(-1)[0])
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // //console.log(index,songs.length)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])

        }

    })

    //volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        //console.log(e.target.value)
        if (e.target.value == 0) {
            vol.src = "./svg/mute.svg"

        }
        else {
            vol.src = "./svg/volume.svg"
        }
    })

    vol.addEventListener("click", () => {
        if (document.querySelector(".range").getElementsByTagName("input")[0].value != 0) {
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
            vol.src = "./svg/mute.svg"
        }
        else {
            document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
            currentSong.volume = 0.4;
            vol.src = "./svg/volume.svg"
        }
    })







}

main()
