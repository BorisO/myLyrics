# My Lyrics

## What it does

This web app will display a list of songs from a music provider. Currently it is only integrated with spotify but can be easily integrated with other providers. Just need to write up an API for it similar to the spotify one.
The songs displayed will be recently played and currently playing. Clicking one one will populate a text area with the lyrics. The lyrics are fetched via the lyric API which is using the genius.com api in the backend for the actual lyrics.

## Design

Database: MongoDB
Backend: Node.js and the express framework for routing.
Frontend: React.js and react-router-dom for routing.

To use the app, you must register. This is to make it easier to link backend keys required for spotify and others to each user.

## Setup

If you want to use the app yourself, you will need a few things. First, for the database, you need mongoDB. To run the frontend and backend, you need node.

Prerequisites:
In the the backend config files, you will need to fill out the following:

- "jwtPrivateKey": ""
- "spotify_client": ""
- "spotify_secret": ""
- "genius_client": ""
- "genius_secret": ""
- "genius_access_token": ""

To get the tokens, you will need to register on spotify and genius developer pages.

To run:

- Startup mongodb
- Startup the backend. On initial startup, run `npm i` to install the packages required.
- Startup the frontend. Similarly, need to initially run `npm i` to get the required packages.

Once you get the app running, register for an account. Once you register, you will be asked to pick a music provider (currently only spotify), you will login to spotify, and then you will get to the main app page. If done correctly, it will look like this:

![](https://i.imgur.com/hGxinh4.png)
