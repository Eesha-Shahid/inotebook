const express = require('express');
const Note = require('../models/Note');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using: POST "/api/notes/fetchallnotes", login required.
router.get('/fetchallnotes', fetchuser, async (req,res)=>{

    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes);    

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    
})

// ROUTE 2: Add a new Note using: POST "/api/notes/addnote", login required.
router.post('/addnote', fetchuser,[
        body('title','Enter a valid title').isLength({ min: 3}),
        body('description','Description must be atleast 5 characters').isLength({ min: 5 }),
    ],  async (req,res)=>{

        try {
            const {title, description, tag} = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })

            const savedNote = await note.save()
            res.json(savedNote);

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
})

// ROUTE 3: Add a new Note using: PUT "/api/notes/updatenote", login required.
router.put('/updatenote/:id', fetchuser,async(req, res)=>{
    const {title, description, tag} = req.body;

    try {
        
        // Create a new note object
        const newNote = {};

        // if attribute is part of the request then add to this object
        if (title){ newNote.title = title };
        if (description){ newNote.description = description };
        if (tag){ newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findByIdAndUpdate(req.params.id);

        // if this node does not exist
        if (!note) { res.status(404).send("Not Found"); }

        // if you are accessing and updating other notes from your account
        if (note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json({note});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");    
    }
})

// ROUTE 3: Delete a Note using: DELETE "/api/notes/deletenote", login required.
router.delete('/deletenote/:id', fetchuser,async(req, res)=>{
    
    try {

        // Find the note to be deleted and delete it
        let note = await Note.findByIdAndUpdate(req.params.id);

        // if this node does not exist
        if (!note) { res.status(404).send("Not Found"); }

        // Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note has been deleted.",note:note});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");    
    }

})

module.exports = router