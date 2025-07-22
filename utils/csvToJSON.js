const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

// Construir rutas absolutas desde la raíz del proyecto
const inputFile = path.resolve(__dirname, "./catalogs/c_ClaveProdServ.csv");
const outputFile = path.resolve(__dirname, "./catalogs/c_ClaveProdServ.json");

csv()
  .fromFile(inputFile)
  .then((jsonObj) => {
    fs.writeFileSync(outputFile, JSON.stringify(jsonObj, null, 2), "utf8");
    console.log("✅ Conversión completada. Archivo guardado en:", outputFile);
  })
  .catch((err) => {
    console.error("❌ Error al convertir:", err);
  });
