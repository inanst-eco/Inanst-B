const express = require('express');
const router = express.Router();
const { getSchools, addSchool, deleteSchool } = require('../controllers/schoolController');


router.route('/')
    .get(getSchools)   
    .post(addSchool);  


router.route('/:id')
    .delete(deleteSchool); 

module.exports = router;