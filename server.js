const express = require('express');
const fs = require('fs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const sharp = require('sharp');

const app = express();
app.use(cors());
const PORT = 8085  ;

app.use(express.json());

app.get('/', (req, res) =>{
    fs.readFile('persona.json', 'utf8', (err, data) =>{
        if(err){
            res.status(500).send('Error al leer JSON');
            return;
        }
        res.json(JSON.parse(data));
    })
});

app.get('/persona/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile('persona.json', 'utf8', (err, data) => {
        if(err){
            res.status(500).send('Error al leer JSON');
            return;
        }
        const personas = JSON.parse(data);
        const persona = personas.find(p => p.id === id);
        if (!persona) {
            res.json({ message: 'Personaje no encontrado' });
            return;
        }
        res.json(persona);
    });
});

app.post('/persona', (req, res) =>{
    const newData = req.body;

    // Verificar si se proporcionaron datos válidos
    if (!newData || Object.keys(newData).length === 0) {
        return res.status(400).send('Los datos proporcionados no son válidos.');
    }

    // Leer el archivo JSON
    fs.readFile('persona.json', 'utf8', (err, data) =>{
        if(err){
            console.log('Error al leer el archivo JSON:', err);
            return res.status(500).send('Error interno del servidor al leer el archivo JSON.');
        }
        
        // Parsear los datos JSON
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.log('Error al parsear el archivo JSON:', parseError);
            return res.status(500).send('Error interno del servidor al parsear el archivo JSON.');
        }

        // Agregar los nuevos datos
        jsonData.push(newData);

        // Escribir en el archivo JSON
        fs.writeFile('persona.json', JSON.stringify(jsonData, null, 2), (writeErr) =>{
            if(writeErr){
                console.log('Error al escribir en JSON:', writeErr);
                return res.status(500).send('Error interno del servidor al escribir en el archivo JSON.');
            }
            console.log('Datos guardados correctamente:', newData);
            return res.status(200).send('Datos de la persona guardados correctamente.');
        });
    });
});





app.use(fileUpload());

// Ruta para subir una imagen
app.post('/upload/:id', (req, res) => {
  const id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }

  // Obtener archivo subido
  const image = req.files.image;
  sharp(image.data)
    .jpeg({ quality: 80 })
    .toFile(path.join(__dirname, '/uploads/', id + '.jpg'), (err, info) => {
      if (err) {
        console.error('Error al procesar la imagen:', err);
        return res.status(500).send(err);
      }

      res.send('Imagen subida correctamente.');
    });
});


// Ruta para acceder a la imagen utilizando el identificador
app.get('/image/:id', (req, res) => {
  const id = req.params.id;
  const imagePath = path.join(__dirname, '/uploads/') + id; 

  // Mostrar la imagen
  res.sendFile(imagePath);
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});



