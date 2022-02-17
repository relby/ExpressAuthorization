# ExpressAuthorization
Authorization using [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) (JSON Web Token), [Express framework](https://expressjs.com) and [MongoDB](https://mongodb.com)
## Start
To start you'll need to download MongoDB [here](https://www.mongodb.com/try/download/community)
or download it as [docker](https://www.docker.com/) container like this
```console
$ docker run --name mongodb -p 27017:27017 -d mongo:latest
$ docker start mongodb
```
Then start the application
```console
$ npm install .
$ node app.js
```
Go to <http://localhost:3000> to login/register