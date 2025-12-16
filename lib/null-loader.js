// Loader personalizado para ignorar archivos .node
// Retorna un módulo vacío para que webpack no intente procesar archivos binarios nativos
module.exports = function nullLoader() {
  return "module.exports = {};";
};


