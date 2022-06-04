require('dotenv').config()
const { default: axios } = require("axios");
const colors = require('colors');
const { leerInput, listarLugares, inquirerMenu, pausa } = require("./helpers/inquirer");

const Busquedas = require("./models/busquedas");

const main = async () => {

    let opt = '';
    const busqueda = new Busquedas();
    const historia = busqueda.leerdb();
   
    if(historia){
        busqueda.historial = historia;
    }
    do{ 
    opt = await inquirerMenu();
    switch (opt) {
        case 1:
            //Mostar mensaje
            const termino = await leerInput('¿Ciudad que desea Bucar?');
            //Buscar los lugares
            const lugares = await busqueda.ciudad(termino)
            //Seleccionar el lugar
            const idx = await listarLugares(lugares);

            //Si el cliente ha seleccionado 0, vuelve al menu
            if(idx==='0')continue;
            
            //Con esto seleccionamos el lugar que hemos seleccionado con nuestro idx
            const lugarsel = lugares.find(l => l.id === idx);           
            
            //Guardar en historial
            busqueda.agregarHistorial(lugarsel.nombre)
            
            //Datos del clima
            const clima = await busqueda.weather(lugarsel.lat, lugarsel.lng);

            //Mostrar Resultados
            console.clear();
            console.log('\nInformacion de la Ciudad\n'.green);
            console.log('Ciudad: '+ colors.yellow(lugarsel.nombre));
            console.log('Latitud: '+ colors.yellow(lugarsel.lat));
            console.log('Longitud: '+ colors.yellow(lugarsel.lng));
            console.log('Temperatura: '+ colors.yellow(clima.temp +'°C'));
            console.log('Minima: '+ colors.yellow(clima.min +'°C'));
            console.log('Maxima: ' + colors.yellow(clima.max +'°C'));
            console.log('Cielo: ' + colors.yellow(clima.desc));
            break;
        case 2:
            //Mostar historial
            console.clear();
            
            
            busqueda.historialCapitalizado.forEach((lugar, i) => {
                const idx = `${i + 1}. `.green;
                console.log(idx + lugar);
            });
            break;
    }
    await pausa();
    }
    while(opt!==0){
        console.clear();
    }
}
 

main();