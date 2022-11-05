const models = require('../models');

const encontrarCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ['id', 'nombre'],
      where: { id },
    })
    .then((carrera) => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

const obtenerCarreras = (req, res) => {
  models.carrera
    .findAll({
      attributes: ['id', 'nombre'],
      include: [
        {
          as: 'materias',
          model: models.materia,
          attributes: ['id_carrera', 'nombre'],
        },
      ],
    })
    .then((carreras) => res.send(carreras))
    .catch(() => res.sendStatus(500));
};

const crearCarrera = (req, res) => {
  models.carrera
    .create({ nombre: req.body.nombre })
    .then((carrera) => res.status(201).send({ id: carrera.id }))
    .catch((error) => {
      if (error == 'SequelizeUniqueConstraintError: Validation error') {
        res
          .status(400)
          .send('Bad request: existe otra carrera con el mismo nombre');
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
};

const obtenerYFiltrarCarreras = (req, res) => {
  let offset = parseInt(req.query.pagActual);
  let limit = parseInt(req.query.cantAVer);

  models.carrera
    .findAll({
      offset: offset * limit,
      limit: limit,
    })
    .then((carreras) => res.send(carreras))
    .catch(() => res.sendStatus(500));
};

const obtenerUnaCarrera = (req, res) => {
  encontrarCarrera(req.params.id, {
    onSuccess: (carrera) => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

const actualizarCarrera = (req, res) => {
  const onSuccess = (carrera) =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ['nombre'] })
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == 'SequelizeUniqueConstraintError: Validation error') {
          res
            .status(400)
            .send('Bad request: existe otra carrera con el mismo nombre');
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  encontrarCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

const eliminarCarrera = (req, res) => {
  const onSuccess = (carrera) =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  encontrarCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
};

module.exports = {
  obtenerCarreras,
  obtenerUnaCarrera,
  obtenerYFiltrarCarreras,
  crearCarrera,
  actualizarCarrera,
  eliminarCarrera,
};
