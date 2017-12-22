var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var userDB = db.collection('user');

    post('/post/v1/listTutor', function (req, res) {
        userDB.find({
            position: {
                $in: ['tutor', 'admin', 'dev']
            }
        }).toArray().then(result => {
            for (let i = 0; i < result.length; i++) {
                result[i].tutorID = result[i]._id;
                delete result[i]._id;
                delete result[i].password;
                delete result[i].firstnameEn;
                delete result[i].lastnameEn;
                delete result[i].nicknameEn;
                delete result[i].phone;
                delete result[i].tutor;
            }
            res.status(200).send(result);
        });
    });

    post('/post/v1/changePassword', function (req, res) {
        if (!(req.body.userID && req.body.password)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        userDB.updateOne({
            _id: parseInt(req.body.userID)
        }, {
            $set: {
                password: req.body.password
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: 0,
                    msg: err
                });
            }
            res.status(200).send('OK');
        });
    });
}