const fs = require('fs');
const axios = require('axios');


class Busquedas{
    historial = [];
    dbPath = './db/dataBase.json';

    constructor () {
        //TODO: leer Db si existe
        this.leerdb();

    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p.charAt(0).toUpperCase() + p.substring(1))
            return palabras.join(' ');
        });
        //lugar.charAt(0).toUpperCase() + lugar.slice(1));
    }

    get paramsMapbox(){
        return {
                'access_token': process.env.MAPBOX_KEY,
                'limit': 5,
                'language': 'es',
            }
        }    

    get paramsWeather(){
        return{
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es',
        }
    }

    async ciudad (lugar = '') {
        //peticion HTTP
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });  

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                        id: lugar.id,
                        nombre: lugar.place_name,
                        lat: lugar.center[1],
                        lng: lugar.center[0]
                   
                }));    
        } catch (error) {
            console.log(error);
            return[];
        }
    }

    async weather (lat,lon) {
        //peticion HTTP
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWeather, lat, lon}

        })
        const resp = await instance.get();
        const {weather, main} = resp.data;
        
        return {
            desc: weather[0].description,
            temp: main.temp,
            min: main.temp_min,
            max: main.temp_max,
        };
        } catch (error) {
            console.log(error);
            return[];
        }
     }

    agregarHistorial(lugar){
        //TODO: prevent duplicates
        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }
        //Mantenemos 6 historiales guardados
        this.historial = this.historial.splice(0,5);
        //Guardamos en el historial
        this.historial.unshift(lugar.toLocaleLowerCase());

        //Grabar Db
        this.guardarDb();
    }


    guardarDb(){
        const payload ={
            historial: this.historial
        }
            fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    };

    leerdb(){

        //Verificamos si existe el archivo
        if(!fs.existsSync(this.dbPath)){
            console.log('No existe el archivo');
            return{
                historial: []
            }
        } 
        const info = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(info);
        this.historial = data.historial;
    }
}
      


module.exports = Busquedas;