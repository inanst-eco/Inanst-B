const express = require('express');
const router = express.Router();
const { 
    getInternships, 
    applyForInternship, 
    updateStatus,
    endInternship 
} = require('../controllers/internshipController');


router.route('/')
    .get(getInternships)  
    .post(applyForInternship); 

// Route for Accept/Denied
router.route('/:id')
    .patch(updateStatus);  

// Route for ending the internship

router.route('/end/:id')
    .patch(endInternship);

module.exports = router;