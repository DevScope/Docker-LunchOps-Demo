# React application with a NodeJS backend and a MySQL database

## Pre-requisites

- [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=msi-powershell)

## 1. Build docker image backend
First we will build our docker image that will be our **NodeJS backend**.

[_Dockerfile_](.\backend\Dockerfile)

```
docker build -f .\backend\Dockerfile -t nodejs-backend --target=development .\backend\
```

## 2. Build docker image frontend
Now we will build our docker image that will be our **React frontend**.

[_Dockerfile_](.\frontend\Dockerfile)

```
docker build -f .\frontend\Dockerfile -t react-frontend --target=development .\frontend\
```

## 3. Let's run our containers!
*Note: We dont need to build the DB container because we will use a public MariaDB docker image*

We will now execute this command to start our containers we builded earlier.

[_compose-local.yaml_](.\compose-local.yaml)

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

![page](./images/output.png)


The backend service container has the port 80 mapped to 80 on the host.
```
$ curl localhost:80
{"message":"Hello from MySQL 8.0.19"}
```

To stop the containers and remove them we just have to execute this command.

```
docker-compose -f .\compose-local.yaml down
```

# Deploy your app to Azure Container Apps

Now we will use **Azure CLI** to create and deploy to an **Azure Container App (ACA)** using our compose specification.

## 1. Push docker images do ACR

First we must push our docker images to an **Azure Container Registry (ACR)**, because it needs to be there for the ACA to be able to pull those docker images.

You need to login to your azure account and set the subscription you wil be using.

```
az login
az account set --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Create your resource group and ACR to where you will push your docker images.

```
az group create --location westeurope --name DockerLunchOpsDemo
az acr create --name dockerlunchopsacr --resource-group DockerLunchOpsDemo --sku Basic --admin-enabled true
```

Now to be able to push it to our ACR we need to tag our images with the ACR login server. When you create the ACR it outputs a JSON with all the info and there you can check the login server (also you can view it via Azure Portal).

In my case the login server is `dockerlunchopsacr.azurecr.io`.

```
docker tag nodejs-backend:latest dockerlunchopsacr.azurecr.io/nodejs-backend:latest
docker tag react-frontend:latest dockerlunchopsacr.azurecr.io/react-frontend:latest
```

Time to push them to the ACR (beware you have to login to the ACR).

```
az acr login -n dockerlunchopsacr
docker push dockerlunchopsacr.azurecr.io/nodejs-backend:latest
docker push dockerlunchopsacr.azurecr.io/react-frontend:latest
```

We won't need t push the MariaDB docker image because it is public.

## 2. Use the compose to deploy to ACA

With the following commands we create an environment for our ACA.

[_compose-aca.yaml_](.\compose-aca.yaml)

```
az containerapp env create --name DockerLunchOpsEnv --resource-group DockerLunchOpsDemo --location westeurope
```

We need to get the ACR credentials for the ACA to be able to authenticate to our private registry (unfortunately *az containerapp compose* does not support *managed identity* yet).

```
az acr credential show --name dockerlunchopsacr
```

After creating the environment and having the credentials now we can deploy using our compose.

```
az containerapp compose create --resource-group DockerLunchOpsDemo --environment DockerLunchOpsEnv --registry-server dockerlunchopsacr.azurecr.io --registry-username <username> --registry-password <password> --compose-file-path .\compose-aca.yaml
```