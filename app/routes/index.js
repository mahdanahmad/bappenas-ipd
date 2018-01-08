const express	= require('express');
const router	= express.Router();

const component	= require('../controllers/component');

/* index. */
router.get('/', (req, res, next) => { res.json(); });

router.get('/api/categories', (req, res, next) => {
	component.categories((result) => { res.status(result.status_code).json(result); });
});
router.get('/api/filters/:category_name/:location?', (req, res, next) => {
	component.filters(req.params.category_name, req.params.location, (result) => { res.status(result.status_code).json(result); });
});
router.get('/api/kementerian', (req, res, next) => {
	component.kementerian((result) => { res.status(result.status_code).json(result); });
});
router.get('/api/location', (req, res, next) => {
	component.location((result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
