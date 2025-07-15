# React application with a NodeJS backend and a MySQL database

## 1. Build docker image backend
First we will build our docker image that will be our NodeJS backend.

```
docker build -f .\backend\Dockerfile -t nodejs-backend --target=development .\backend\
```

## 2. Build docker image frontend
Now we will build our docker image that will be our React frontend.

```
docker build -f .\frontend\Dockerfile -t react-frontend --target=development .\frontend\
```

## 3. Let's run our containers!
*Note: We dont need to build the DB container because we will use a public MariaDB docker image*

We will now execute this command to start our containers we builded earlier.

```
docker-compose -f .\compose-local.yaml up -d
```

Listing containers must show containers running and the port mapping as below:
```
$ docker ps
CONTAINER ID   IMAGE                   COMMAND                  CREATED         STATUS                            PORTS                                                                                              NAMES
a9b23f2d4bc8   react-frontend:latest   "docker-entrypoint.s…"   8 seconds ago   Up 2 seconds                      0.0.0.0:3000->3000/tcp, :::3000->3000/tcp                                                          react-frontend      
587bbf4880ae   nodejs-backend:latest   "docker-entrypoint.s…"   8 seconds ago   Up 3 seconds (health: starting)   0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:9229-9230->9229-9230/tcp, :::9229-9230->9229-9230/tcp   nodejs-backend      
f5c5a88ec2c6   mariadb:10.6.4-focal    "docker-entrypoint.s…"   8 seconds ago   Up 4 seconds                      3306/tcp                                                                                           maria-db
```

After the application starts, navigate to `http://localhost:3000` in your web browser.

![page](./output.png)


The backend service container has the port 80 mapped to 80 on the host.
```
$ curl localhost:80
{"message":"Hello from MySQL 8.0.19"}
```

To stop the containers and remove them we just have to execute this command.

```
docker-compose -f .\compose-local.yaml down
```

## Project structure

```
.
├── backend
│   ├── Dockerfile
│   ...
├── db
│   └── password.txt
├── compose.yaml
├── frontend
│   ├── ...
│   └── Dockerfile
└── README.md
```

[_compose-local.yaml_](compose-local.yaml)
```
services:
  backend:
    build: backend
    ports:
      - 80:80
      - 9229:9229
      - 9230:9230
    ...
  db:
    # We use a mariadb image which supports both amd64 & arm64 architecture
    image: mariadb:10.6.4-focal
    # If you really want to use MySQL, uncomment the following line
    #image: mysql:8.0.27
    ...
  frontend:
    build: frontend
    ports:
    - 3000:3000
    ...
```
The compose file defines an application with three services `frontend`, `backend` and `db`.
When deploying the application, docker compose maps port 3000 of the frontend service container to port 3000 of the host as specified in the file.
Make sure port 3000 on the host is not already being in use.

> ℹ️ **_INFO_**  
> For compatibility purpose between `AMD64` and `ARM64` architecture, we use a MariaDB as database instead of MySQL.  
> You still can use the MySQL image by uncommenting the following line in the Compose file   
> `#image: mysql:8.0.27`
