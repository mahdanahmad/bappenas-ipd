const express	= require('express');
const router	= express.Router();

const component	= require('../controllers/component');

/* index. */
router.get('/', (req, res, next) => { res.json(); });

router.get('/api/categories', (req, res, next) => {
	component.categories((result) => { res.status(result.status_code).json(result); });
});
router.get('/api/filters/:category_name', (req, res, next) => {
	component.filters(req.query, req.params.category_name, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/maps/:category_name', (req, res, next) => {
	component.maps(req.query, req.params.category_name, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/detil/:category_name', (req, res, next) => {
	component.detillocation(req.query, req.params.category_name, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/output/:category_name/:provinsi/:kabupaten?', (req, res, next) => {
	component.getOutput(req.query, req.params.category_name, req.params.provinsi, req.params.kabupaten, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/kementerian/:category_name', (req, res, next) => {
	component.kementerian(req.query, req.params.category_name, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/location/:category_name', (req, res, next) => {
	component.location(req.query, req.params.category_name, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
