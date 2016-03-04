var router = require('express').Router();

router.post('/isAuthenticated', function (req, res) {
    res.json({isAuthenticated: req.isAuthenticated()});
});

module.exports = router;