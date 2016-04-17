var router = require('express').Router();

router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
