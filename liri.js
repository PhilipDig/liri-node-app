require("dotenv").config()

let keys = require("./keys")
let request = require("request")
let fs = require("fs")

let Twitter = require("twitter")
let Spotify = require("node-spotify-api")

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

function main(arg1, arg2) {
    switch (arg1) {
        case "my-tweets":
            getMyTweets()
            break
        case "spotify-this-song":
            searchSong(arg2)
            break
        case "movie-this":
            searchMovie(arg2)
            break
        case "do-what-it-says":
            doIt()
            break
        default:
            console.log("Sorry, liri does not understand you\nPlease try again")
    }
}

function getMyTweets() {

    // Don't really use twitter, so thought it would be cool to retrieve Android dev tweets
    var params = { screen_name: 'AndroidDev' };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        tweets.forEach(function (tweet) {
            console.log(`
    On ${tweet.created_at} tweeted:
    ${tweet.text}
    `)
        })
    });
}

function searchSong(song) {

    if (!song) {

        console.log(`
        Song: The Sign
        Artist(s): Ace of Base
        Album: The Light
        Preview: https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE
                `)
    } else {

        spotify.search({ type: 'track', query: song, limit: 1 }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err)
            }
            let song = data.tracks.items[0]
            let artists = []
            song.artists.forEach(function (artist) {
                artists.push(artist.name)
            })
            artists.join(`, `)

            console.log(`
    Song: ${song.name}
    Artist(s): ${artists}
    Album: ${song.album.name}
    Preview: ${song.external_urls.spotify}    
            `)
        });
    }


}

function searchMovie(movie) {

    if (!movie) {
        movie = "Mr. Nobody"
    }

    movie.replace(" ", "+")

    let url = `http://www.omdbapi.com/?apikey=trilogy&type=movie&r=json&t=${movie}`

    request(url, function (err, response, body) {

        if (err) {
            return console.log('Error occurred: ' + err)
        }

        let data = JSON.parse(body)

        // Retrieve the rotten tomatoes rating from the array of returned ratings
        let ratings = data.Ratings
        let rottenTomato = ratings[ratings.findIndex(function (value) {
            return value.Source == "Rotten Tomatoes"
        })].Value

        console.log(`
    Title: ${data.Title}
    Year:  ${data.Year}
    IMDB Rating: ${data.imdbRating}
    Rotten Tomatoes Rating: ${rottenTomato}
    Country: ${data.Country}
    Language: ${data.Language}
    Plot: ${data.Plot}
    Actors: ${data.Actors}    
`)
    })
}

function doIt() {

    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log("Error reading random.txt: " + err)
        }

        let commands = data.split(',')
        main(commands[0], commands[1])
    })
}

main(process.argv[2], process.argv[3])
