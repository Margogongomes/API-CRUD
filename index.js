import express from "express"; //Importando a biblioteca express
import winston from "winston";
import accountsRouter from "./routes/accounts.js" //O arquivo account.js está sendo usado no index
import {promises as fs} from "fs"; 
import cors from "cors";
import swaggerUi from "swagger-ui-express"; //Biblioteca utilizada para fazer a documentção inclusive das rotas
import {swaggerDocument} from "./doc.js"

const { readFile, writeFile} = fs; 

global.fileName = "accounts.json";//Atribuiu o arquivo accounts.json a variável fileName

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: "my-bank-api.log" })
    ],
    format: combine(
        label({ label: "my-bank-api"}),
        timestamp(),
        myFormat
    )
});

const app = express(); //A variável app mostra quais 
app.use(express.json()); //Liberando o aplicativo para todo servidor, de todas as rotas independente das portas
app.use(cors());
app.use(express.static("public")); //Fazer liberação de arquivos estáticos, css, imagem
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/account", accountsRouter); //Rota principal/Arquivo principal
app.listen(3000, async () => {    //Abrir a porta do servidor
    try {
        await readFile(global.fileName);
        logger.info("API Started!");
    } catch (err) {
        const initialJson = {
            nextId: 1,
            accounts: []
        }        
        writeFile(global.fileName, JSON.stringify(initialJson)).then(() => {
            logger.info("API Started and File Created!");
        }).catch(err => {
            logger.error(err);
        });
    }
});