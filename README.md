# Techno Web Forum App - API

This project is the backend for the Techno Web Forum App.
It is designed to work with the [frontend implemented using ReactJS](https://github.com/HayaMamlouk/TechnoWebReact).

## How to install?

```shell
git clone https://github.com/touficbatache/TechnoWebAPI.git
cd TechnoWebAPI
npm install
```

## Start the database

We're using **MongoDB v7.0.8** for this API. After installing it, you should
be able to get it up and running using the following command:

```shell
mongod --dbpath=DB_PATH
```

## Configure the correct environment

Now make sure to set the correct environment variable values in `.env`.
The `example.env` file lays out the template needed for the API to function.

You should provide:

- Database config: NAME and URL:PORT
- Server config: URL, PORT and SESSION SECRET (needed for express session to work correctly)

## Start the backend service

After making sure the database is started and the correct environment variables are set,
you should be able to start the backend without any problems, using the following command:

```shell
npm run serve
```

If everything went smoothly, the terminal should show:

```
Express: URL:PORT
MongoDB: connected
```

## API description

`http://URL:PORT/api/`

### ==== Create an account ====

**Needed authorization:**

`NONE`

**Request:**

`PUT /user/`

```
{
    "login": "USERNAME",
    "password": "PASSWORD",
    "firstname": "FIRST_NAME",
    "lastname": "LAST_NAME"
}
```

**Response:**

```http request
HTTP/1.1 201 Created
content-type: application/json

{
    "id": "USERID"
}
```

### ==== Get user details ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`GET /user/USERID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "_id": "USERID",
    "login": "USERNAME",
    "firstname": "FIRST_NAME",
    "lastname": "LAST_NAME",
    "role": "admin|member"
}
```

### ==== Get all users' details ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`GET /users/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

[
    {
        "_id": "USERID",
        "login": "USERNAME",
        "firstname": "FIRST_NAME",
        "lastname": "LAST_NAME",
        "role": "admin|member"
    },
    {
        "_id": "USERID",
        "login": "USERNAME",
        "firstname": "FIRST_NAME",
        "lastname": "LAST_NAME",
        "role": "admin|member"
    }
]
```

### ==== Delete user ====

**Needed authorization:**

`ADMIN`

**Request:**

`DELETE /user/USERID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

### ==== Login ====

**Needed authorization:**

`NONE`

**Request:**

`PUT /auth/`

```
{
    "login": "USERNAME",
    "password": "PASSWORD"
}
```

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

### ==== Logout ====

**Needed authorization:**

`NONE`

**Request:**

`DELETE /auth/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

### ==== Get all account validation requests ====

**Needed authorization:**

`ADMIN`

**Request:**

`GET /demands/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

[
    {
        "_id": "DEMANDID",
        "requestedDate": DATE,
        "userDetails": {
            "_id": "USERID",
            "login": "USERNAME"
            "firstname": "FIRST_NAME",,
            "lastname": "LAST_NAME",
            "role": "admin|member",
            "validated": boolean
        }
    }
]
```

### ==== Get an account validation request ====

**Needed authorization:**

`ADMIN`

**Request:**

`GET /demand/DEMANDID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "_id": "DEMANDID",
    "requestedDate": DATE,
    "userDetails": {
        "_id": "USERID",
        "login": "USERNAME"
        "firstname": "FIRST_NAME",,
        "lastname": "LAST_NAME",
        "role": "admin|member",
        "validated": boolean
    }
}
```

### ==== Authorize an account validation request ====

**Needed authorization:**

`ADMIN`

**Request:**

`POST /demand/DEMANDID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

### ==== Delete an account validation request ====

**Needed authorization:**

`ADMIN`

**Request:**

`DELETE /demand/DEMANDID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

### ==== Post a message ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`PUT /message/`

```
{
    "type": "public|private",
    "content": "CONTENT"
}
```

**Response:**

```http request
HTTP/1.1 201 Created
content-type: application/json

{
    "id": "MESSAGEID"
}
```

### ==== Reply to a message ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`PUT /message/`

```
{
    "type": "public|private",
    "content": "CONTENT",
    "replyTo": "MESSAGEID"
}
```

**Response:**

```http request
HTTP/1.1 201 Created
content-type: application/json

{
    "id": "MESSAGEID"
}
```

### ==== Get public messages ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`GET /messages/public/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

[
    {
        "_id": "MESSAGEID1",
        "type": "public",
        "userId": "USERID",
        "content": "CONTENT",
        "date": DATE,
        "replyTo": "MESSAGEID0"|null,
        "replies": [
            {
                "_id": "MESSAGEID2",
                "type": "public",
                "userId": "USERID",
                "content": "CONTENT",
                "date": DATE,
                "replyTo": "MESSAGEID1"
            }
        ]
    }
]
```

### ==== Get private messages ====

**Needed authorization:**

`ADMIN`

**Request:**

`GET /messages/private/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

[
    {
        "_id": "MESSAGEID1",
        "type": "private",
        "userId": "USERID",
        "content": "CONTENT",
        "date": DATE,
        "replyTo": "MESSAGEID0"|null,
        "replies": [
            {
                "_id": "MESSAGEID2",
                "type": "private",
                "userId": "USERID",
                "content": "CONTENT",
                "date": DATE,
                "replyTo": "MESSAGEID1"
            }
        ]
    }
]
```

### ==== Get message ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`GET /message/MESSAGEID/`

**Response:**

ONLY public if not admin, otherwise public and private.

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "_id": "MESSAGEID1",
    "type": "public|private",
    "userId": "USERID",
    "content": "CONTENT",
    "date": DATE,
    "replyTo": "MESSAGEID0"|null,
    "replies": [
        {
            "_id": "MESSAGEID2",
            "type": "public|private",
            "userId": "USERID",
            "content": "CONTENT",
            "date": DATE,
            "replyTo": "MESSAGEID1"
        }
    ]
}
```

### ==== Search messages ====

**Needed authorization:**

`AUTHENTICATED`

**Request:**

`POST /messages/search/`

```
{
    "query": "QUERY"
}
```

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

[
    {
        "_id": "MESSAGEID1",
        "type": "public|private",
        "userId": "USERID",
        "content": "CONTENT",
        "date": DATE,
        "replyTo": "MESSAGEID0"|null
    }
]
```

### ==== Delete message ====

**Needed authorization:**

`ADMIN`

**Request:**

`DELETE /message/MESSAGEID/`

**Response:**

```http request
HTTP/1.1 200 OK
content-type: application/json

{
    "success": boolean
}
```

## Creators

- [BATACHE Toufic](https://github.com/touficbatache/)
- [MAMLOUK Haya](https://github.com/HayaMamlouk/)
