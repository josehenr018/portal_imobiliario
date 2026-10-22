const express = require('express');
const favoritoService = require('../services/FavoritoService');
const asyncHandler = require('../middlewares/asyncHandler');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { PERFIS } = require('../config/constants');

const router = express.Router();

router.use(requireAuth, requireRole(PERFIS.CLIENTE));

/** RF14 */
router.post('/', asyncHandler(async (req, res) => {
  const favorito = favoritoService.adicionar(req.session.usuarioId, req.body.imovelId);
  res.status(201).json(favorito);
}));

/** RF11 (favoritos) */
router.get('/', asyncHandler(async (req, res) => {
  res.json(favoritoService.listarPorCliente(req.session.usuarioId));
}));

/** RF15 */
router.delete('/:id', asyncHandler(async (req, res) => {
  favoritoService.remover(req.session.usuarioId, req.params.id);
  res.status(204).end();
}));

module.exports = router;
