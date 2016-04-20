var router = require('express').Router();
var Settings = require('../../models/Settings');
var utils = require('../../utils');

router.post('/staff', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        role: /^(Admin|Seller)$/,
        number: /^\d{1,4}$/,
        name: /^.{3,50}$/,
        pin: /^\d{4}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request. Role can be either Admin or Seller. Name must have at least 3 characters. PIN must have 4 digits'});
    } else {
        var query = {userId: req.user._id};
        Settings.findOne(query).select('staff').exec().then(function (settings) {
            var staff = settings.staff;            
            /*var lastMaxStaffNumber = 0;
            for (var i = 0; i < staff.length; i++) {
                var thisNumber = staff[i].number;
                if (lastMaxStaffNumber < thisNumber) {
                    lastMaxStaffNumber = thisNumber;
                }
            }*/
            var employee = null;
            var employeeIndex = -1;
            for (var i = 0; i < staff.length; i++) {
                if (req.body.number === staff[i].number + '') {
                    employee = staff[i];
                    employeeIndex = i;
                    break;
                }
            }
            if (req.body.requestType === 'save') {
                if (!employee) { // add new employee
                    var number = parseInt(req.body.number);
                    if (!number) {
                        res.json({success: false, msg: 'Invalid request'});
                    } else {
                        //if (lastMaxStaffNumber !== number){
                            staff.push({
                                role: req.body.role,
                                number: number,
                                name: req.body.name,
                                pin: req.body.pin
                            });
                        //}
                    }
                } else { // just update the employee that was found
                    employee.role = req.body.role;
                    employee.name = req.body.name;
                    employee.pin = req.body.pin;
                }
                settings.save().then(function (s) {
                    res.json({success: true, msg: s.staff});
                }).catch(function (err) {
                    res.json({success: false, msg: err});
                });
            } else if (req.body.requestType === 'remove') {
                if(employeeIndex !== -1){
                    staff.splice(employeeIndex, 1);
                    settings.save().then(function (s) {
                        res.json({success: true, msg: s.staff});
                    }).catch(function (err) {
                        res.json({success: false, msg: err});
                    });
                } else {
                    res.json({success: false, msg: "Invalid request. Employee number not found"});                    
                }
            }
        });
    }
});

module.exports = router;
