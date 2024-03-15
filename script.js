/**Links Evento  */
// Agrega un evento de clic a todos los enlaces
document.querySelectorAll('.link').forEach(item => {
    item.addEventListener('click', event => {
        // Quita la clase 'clicked' de todos los enlaces
        document.querySelectorAll('.link').forEach(link => {
            link.classList.remove('clicked');
        });
        // Agrega la clase 'clicked' al enlace clicado
        event.target.classList.add('clicked');
    });
});

let statusPage = 0;
let maxPage;
document.addEventListener("DOMContentLoaded", function () {
    generarPag();
    leerApi(1);
});

function generarPag() {
    let apiUrl = "https://rickandmortyapi.com/api/character";
    let charactersA;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Error de solicitud :(")
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(data => {
            if (data.results === null) {
                console.log("No se encontraron resultados.");
                return;
            }
            let pages = data.info.pages;
            maxPage = pages;
            let divPag = document.getElementById("pages");
            divPag.innerHTML = "";
            let startPage = statusPage * 10;
            let endPage = Math.min(startPage + 10, pages);
            for (let index = startPage; index < endPage; index++) {
                let li = document.createElement('li');
                li.innerHTML = '<a href="#" class="link" onclick="leerApi(' + (index + 1) + ')">' + (index + 1) + '</a>';
                divPag.appendChild(li);
            }
        })
        .catch(error => {
            console.log("Error de solicitud :(" + error);
        })
}


function prevPagIndice() {
    if (statusPage == 0) return;
    statusPage--;
    generarPag();
}
function nextPagIndice() {
    if (statusPage == Math.floor(maxPage / 10)) return;
    statusPage++;
    generarPag();
}

//Consultas API RICK AND MORTY
function agregarCharacterDiv(character) {
    let nuevoDiv = document.createElement("div");
    nuevoDiv.classList.add("col-md-3", "mb-3");
    nuevoDiv.innerHTML = `
        <div class="card h-100 d-flex align-items-center justify-content-center">
                <h5 class="card-title">ID: ${character.id}</h5>
                <p class="card-text">Nombre: ${character.nombre}</p>
                <p class="card-text">Estado: ${character.estado}</p>
                <p class="card-text">Especie: ${character.especie}</p>
                <p class="card-text">Género: ${character.genero}</p>
                <p class="card-text">Origen: ${character.origen}</p>
                <p class="card-text">Ubicación: ${character.ubicacion}</p>
                ${character.apiLocal ? "" : `<div id="btnImg${character.id}" class="contBtn"><input type="file" accept="image/*" name="image" accept="image/*" id="image${character.id}"></div>
                                        <div id="btnA${character.id}"><button class="btn btn-success" onclick="enviarDatosPersona(${character.id})">Añadir Server Node</button></div>`
        }
                
        </div>
    `;

    let contenedor = document.getElementById("container");
    contenedor.appendChild(nuevoDiv);
    nuevoDiv.addEventListener("click", function () {
        leerMiApi(character);
    });
}

function leerApi(pag) {
    /**URL API */
    let apiUrl = "https://rickandmortyapi.com/api/character/?page=" + pag;
    let charactersA;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Error de solicitud :(")
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(data => {
            if (data.results === null) {
                console.log("No se encontraron resultados.");
                return;
            }

            let characters = data.results.map(character => ({
                id: character.id,
                nombre: character.name,
                estado: character.status,
                especie: character.species !== "" ? character.species : "Desconocido",
                genero: character.gender !== "" ? character.gender : "Desconocido",
                origen: character.origin !== null ? character.origin.name : "Desconocido",
                ubicacion: character.location.name !== "" ? character.location.name : "Desconocido",
            }));
            console.log(characters);
            charactersA = characters;
            document.getElementById("container").innerHTML = "";

            let promises = characters.map(element => {
                return comprobarExistPersona(element.id)
                    .then(personaExist => {
                        if (personaExist) {
                            element.apiLocal = true;
                        }
                    });
            });

            return Promise.all(promises)
                .then(() => {
                    document.getElementById("container").innerHTML = "";
                    characters.forEach(element => {
                        agregarCharacterDiv(element);
                    });
                });

        })
        .catch(error => {
            console.log("Error de solicitud :(" + error);
        })
}




//Funciones Relacionadas con mi API
function serchById(id) {
    let apiUrl = "https://rickandmortyapi.com/api/character/" + id;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Error de solicitud :(")
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(character => {
            let persona = {
                id: character.id,
                nombre: character.name,
                estado: character.status,
                especie: character.species !== "" ? character.species : "Desconocido",
                genero: character.gender !== "" ? character.gender : "Desconocido",
                origen: character.origin !== null ? character.origin.name : "Desconocido",
                ubicacion: character.location.name !== "" ? character.location.name : "Desconocido"
            };
            return persona;
        })
        .catch(error => {
            console.log("Error de solicitud :(" + error);
            return null;
        });
}

function comprobarExistPersona(id) {
    let apiUrl = "http://localhost:8085";
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Error de solicitud :(")
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                console.log("No se encontraron resultados.");
                return false;
            }
            const personaEncontrada = data.find(persona => persona.id === id);
            return personaEncontrada !== undefined;
        })
        .catch(error => {
            console.log("Error de solicitud :(" + error);
            return false;
        });
}

function subirImagen(id) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(`image${id}`);
        const file = fileInput.files[0];

        if (!file) {
            console.log('No se ha seleccionado ningún archivo.');
            reject('No se ha seleccionado ningún archivo.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        fetch('http://localhost:8085/upload/' + id, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ocurrió un error al subir la imagen.');
                }
                leerApi(1);
                console.log('Imagen subida exitosamente.');
                resolve(); 
            })
            .catch(error => {
                console.error('Error al subir la imagen:', error);
                reject(error);
            });
    });
}


function enviarDatosPersona(id) {
    comprobarExistPersona(id)
        .then(existingPersona => {
            if (existingPersona) {
                console.log('Personaje ya existente');
                return;
            } else {
                return serchById(id)
                    .then(persona => {
                        if (persona) {
                            const fileInput = document.getElementById(`image${id}`);
                            const file = fileInput.files[0];
                            if (!file) {
                                console.log('No se ha seleccionado ningún archivo.');
                                return guardarDatosSinImagen(persona);
                            } else {
                                return subirImagen(id)
                                    .then(() => {
                                        return guardarDatosConImagen(persona);
                                    });
                            }
                        } else {
                            console.log('No se encontró un personaje con el ID proporcionado.');
                        }
                    })
                    .then(data => {
                        console.log('Respuesta del servidor:', data);
                    })
                    .catch(error => {
                        console.log('Error al buscar el personaje:', error);
                    });
            }
        });
}

function guardarDatosSinImagen(persona) {
    const jsonData = persona;
    jsonData.img = "";
    const newPersona = JSON.stringify(jsonData, null, 2);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: newPersona
    };

    const url = 'http://localhost:8085/persona';
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ocurrió un error al enviar los datos.');
            }
            leerApi(1);
            return response.json();
        })
        .then(data => {
            return data;
        });
}


function guardarDatosConImagen(persona) {
    const jsonData = persona;
    jsonData.img = "http://localhost:8085/image/" + jsonData.id + ".jpg";
    const newPersona = JSON.stringify(jsonData, null, 2);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: newPersona
    };

    const url = 'http://localhost:8085/persona';
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ocurrió un error al enviar los datos.');
            }
            leerApi(1);
            return response.json();
        });
}


function leerMiApi(character) {
    const apiUrl = `http://localhost:8085/persona/${character.id}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(personaje => {
            if (personaje.nombre !== undefined) {
                let modalContent = `
                    <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Información del Personaje ${personaje.id}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body modelP">
                                    <p><strong>Nombre:</strong> ${personaje.nombre}</p>
                                    <p><strong>Estado:</strong> ${personaje.estado}</p>
                                    <p><strong>Especie:</strong> ${personaje.especie}</p>
                                    <p><strong>Género:</strong> ${personaje.genero}</p>
                                    <p><strong>Origen:</strong> ${personaje.origen}</p>
                                    <p><strong>Ubicación:</strong> ${personaje.ubicacion}</p>
                                    <div style="text-align: center;"><img style="width: 300px;" src="${personaje.img}"></div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                // Mostrar el contenido del modal si se encontró el personaje
                let modalContainer = document.getElementById('modalContainer');
                modalContainer.innerHTML = modalContent;
                let myModal = new bootstrap.Modal(document.getElementById('modalContainer').querySelector('.modal'));
                myModal.show();
            }
        })
        .catch(error => {
            console.error('Error al buscar el personaje:', error);
        });
}


//STARWARDLE
let array = [];
let personaWardle ;
function buscarPersonajes() {
    let nom = document.getElementById("guessInput").value;
    nom = nom.toUpperCase();
    document.getElementById('result').innerHTML ="";
    array.forEach(element => {
        let nomP = element.nombre;
        nomP = nomP.toUpperCase();
        if (nomP.startsWith(nom) && nom != "") {
            document.getElementById('result').innerHTML += "<div class='respP' onclick='selectPersonaje("+element.id+")'><p style='display:inline-block;'>" + element.nombre + "</p><img style='width:50px; display:inline-block;' src=" + element.img + "></img></div>";
        }
    });
}
function startWardle() {
    document.getElementById('guessInput').value ="";
    document.getElementById('result').innerHTML = "";
    /**URL API */
    let apiUrl = "http://localhost:8085";
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Error de solicitud :(")
                throw new Error('Error en la solicitud.');
            }
            return response.json();
        })
        .then(data => {
            if (data === null) {
                console.log("No se encontraron resultados.");
                return;
            }

            array = data;
            let indiceAleatorio = Math.floor(Math.random() * array.length);
            personaWardle = array[indiceAleatorio];
            console.log("Respuesta StartWardle");
            console.log(personaWardle);

        })
        .catch(error => {
            console.log("Error de solicitud :(" + error);
        })

}
function selectPersonaje(id){
    array.forEach(element => {
        if(element.id == id)document.getElementById('guessInput').value = element.nombre;
    });
}
function checkPersona(){
    let nombreP = document.getElementById('guessInput').value;
    let persona = array.find(persona => persona.nombre === nombreP);
    if(persona == null) document.getElementById('result').innerHTML = "<p class='fail'>Personaje no encontrado</p> ";
    else{
        document.getElementById('result').innerHTML = "";
        persona.id === personaWardle.id ?  document.getElementById('result').innerHTML +="<p>Personaje encontrado!!</p> ": document.getElementById('result').innerHTML +="<p class='fail'>Personaje encontrado</p> ";
        persona.nombre === personaWardle.nombre ? document.getElementById('result').innerHTML +="<p>Nombre:" +persona.nombre +"</p> ":document.getElementById('result').innerHTML +="<p class='fail'>Nombre:" +persona.nombre +"</p>";
        persona.estado === personaWardle.estado? document.getElementById('result').innerHTML +="<p>Estado:" + persona.estado+"</p> ":  document.getElementById('result').innerHTML +="<p class='fail'>Estado:" + persona.estado+"</p>";
        persona.especie === personaWardle.especie? document.getElementById('result').innerHTML +="<p>Especie:" +persona.especie+"</p> ":document.getElementById('result').innerHTML +="<p class='fail'>Especie:" +persona.especie+"</p>";
        persona.genero === personaWardle.genero? document.getElementById('result').innerHTML +="<p>Genero:" +persona.genero+"</p> ": document.getElementById('result').innerHTML +="<p class='fail'>Genero:" +persona.genero+"</p>";
        persona.ubicacion === personaWardle.ubicacion? document.getElementById('result').innerHTML +="<p>Ubicación:"+persona.ubicacion+"</p> ": document.getElementById('result').innerHTML +="<p class='fail'>Ubicación:"+persona.ubicacion+"</p>";
    }
}