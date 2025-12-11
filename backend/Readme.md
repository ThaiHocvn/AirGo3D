# NodeJS BoilerPlate

## Tech stack

- Process manager: PM2
- Web framework: Express
- Language: Typescript
- Container env: Docker
- Package manager: Yarn
- Coding style and Linting: ESlint, editorconfig


## Lib

- General Logger: winston
- HTTP Logger: morgan
- Env: dotenv

## How to start

With local node (>14) env, by do the following command a local pm2 managed cluster will be started. By default the cluster will only have 1 process and it is defined by **ecosystem.config.js**

```bash
yarn install && yarn start
```

If you want to run it with docker, by doing the following command a docker container will be started. It is orchestrated simply by docker-compose which is defined in **docker-compose.yml**

```bash
yarn up
```
