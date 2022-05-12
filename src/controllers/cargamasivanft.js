const { CONFIG } = require('../network/api')
const nearAPI = require("near-api-js");
const { Contract, keyStores, KeyPair , Near, Account } = nearAPI;
const fs = require('fs');
path = require('path')

File = require('web3.storage').File
Web3Storage = require('web3.storage').Web3Storage

const dir_log = path.join(__dirname, '../logs/');

function cargarLog(log, texto) {
    fs.appendFileSync(dir_log + log, texto, (err) => {
        if (err) { console.log('Error al escribir en el log - ' + err)};
    });
}

async function callbackFunction (arg, res) {

    cargarLog('log_error.txt', '\n[log '+ new Date() +']');
    cargarLog('log.txt', '');
    //Near conection
    //C:\Users\hrpal\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu20.04onWindows_79rhkp1fndgsc\LocalState\rootfs\root\.near-credentials\testnet
    const homedir = require("os").homedir();
    const CREDENTIALS_DIR = "AppData\\Local\Packages\\CanonicalGroupLimited.Ubuntu20.04onWindows_79rhkp1fndgsc\\LocalState\\rootfs\\root\\.near-credentials";
    const credentialsPath = require("path").join(homedir, CREDENTIALS_DIR);
    const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
    //Connect to network
    const config = CONFIG(keyStore, 'testnet');
    const CONTRACT_NAME = 'nft2.freehorses.testnet';
    const SIGNER_ID = 'nft2.freehorses.testnet';
    const SIGNER_PRIVATEKEY = 'ed25519:5uNoT6QRbUbsBKd32QpBSk2umHfAGpXmPe9iy6rhSSCXP4jz3X1PD9ioxWs1kBuhFx9myjUhr6bNjz5MDEs24LtB';
    const NETWORK = 'testnet';
    const keyPair = KeyPair.fromString(SIGNER_PRIVATEKEY);
    
    keyStore.setKey(NETWORK, SIGNER_ID, keyPair);
    const near = new Near(config);
    const account = new Account(near.connection, SIGNER_ID);
    const response = null;
    //Contract call buy or sell
    const contract = new Contract(account, CONTRACT_NAME, {
        //viewMethods: ["get_order_sell","get_order_buy"],
        changeMethods: ["nft_series"],
        sender: account
    })
    
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEQyMzU0QTViZkU4RTREQkNFYjZmYjYzNThlNDAzM0NiMzUxOTNlNGEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTIxOTY1Njc4NTYsIm5hbWUiOiJmcmVlX2hvcnNlcyJ9.OA8aoNBwLQA0WV8drtL3reEgDk2e8nJEYGO9UC3YdzM";
    const storage = new Web3Storage({ token })

    var dir_img = path.join(__dirname, '../storage/free_horses/images/')
    var dir = fs.readdirSync(dir_img);
        
    
    const edicionesCargadas = [];
    var array = fs.readFileSync(dir_log + 'log.txt').toString().split("\n"); 
    for(i in array) { 
        if(array[i] != "") {
            edicionesCargadas.push(array[i]);
        }
    }

    for(var i = 0; i < dir.length; i++) {
        let rawdata = fs.readFileSync(path.join(__dirname, '../storage/free_horses/metadata.json'));
        let metadata = JSON.parse(rawdata);
        let objeto = metadata[metadata.findIndex((item) => item.edition.toString() == dir[i].split('.')[0])];
        if(objeto) {
            if(!edicionesCargadas.includes(objeto.edition.toString())) {
                
                const stream = fs.createReadStream(dir_img + dir[i])
                const cid = await storage.put([{ name: dir[i], stream: () => stream }])
                            .then(async (res) => {
                                if(res) {
                                    const token_metadata = {
                                        title: objeto.name, 
                                        description: objeto.description, 
                                        media: "https://" + res + ".ipfs.dweb.link/" + dir[i], 
                                        reference: res, 
                                        copies: 300,
                                        extra: JSON.stringify({atributos: objeto.attributes}),
                                    };
                                    //////////////////////// inicio creacion serie /////////////////////////
                                    this.response = await contract.nft_series({ 
                                        callbackUrl: '',
                                        meta: '',
                                        args: {
                                            token_metadata: token_metadata,
                                            price: "100000000000000000000000"
                                        },
                                        gas: '300000000000000',
                                        amount: '15200000000000000000000',
                                    }).then((res) => {
                                        if(res) {
                                            cargarLog('log.txt', '\n' + objeto.edition);
                                        }
                                    })
                                    .catch((err) => {
                                        cargarLog('log_error.txt', '\nError al cargar la serie: ' + objeto.edition + ' - ' + objeto.name + ' - Error: ' + err); 
                                    });
                                    ///////////////////////// fin creacion serie //////////////////////////
                                    
                                } else {
                                    cargarLog('log_error.txt', '\nError respuesta web3.storage al cargar imagen: ' + dir[i]); 
                                }
                            })
                            .catch((err) => {
                                cargarLog('log_error.txt', '\nError web3.storage al cargar imagen: ' + dir[i] + ' - Error: ' + err);
                        })
            }
        } else {
            cargarLog('log_error.txt', '\nError la imagen "' + dir[i] + '" en el directorio, no tiene metadata en el archivo JSON');
        }
    }

}


const cargaMasivaNft = async (req, res) => {
    callbackFunction(), res;
    res.json(200);
}

module.exports = { cargaMasivaNft }