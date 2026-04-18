const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { featured, limit = 10 } = req.query;
        const query = {};
        
        if (featured === 'true') query.featured = true;
        
        const projects = await Project.find(query)
            .sort({ order: 1, createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/projects
// @desc    Create new project (Admin only)
// @access  Private/Admin
router.post('/',
    authenticateToken,
    isAdmin,
    upload.single('image'),
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('shortDesc').trim().notEmpty(),
        body('fullDesc').trim().notEmpty(),
        body('tech').isArray().withMessage('Technologies must be an array')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            const projectData = {
                ...req.body,
                tech: JSON.parse(req.body.tech), // Parse tech array from JSON string
                image: req.file ? `/uploads/${req.file.filename}` : req.body.image
            };
            
            const project = new Project(projectData);
            await project.save();
            
            res.status(201).json({ success: true, project });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

// @route   PUT /api/projects/:id
// @desc    Update project (Admin only)
// @access  Private/Admin
router.put('/:id',
    authenticateToken,
    isAdmin,
    upload.single('image'),
    async (req, res) => {
        try {
            const updateData = { ...req.body };
            
            if (req.file) {
                updateData.image = `/uploads/${req.file.filename}`;
            }
            
            if (req.body.tech) {
                updateData.tech = JSON.parse(req.body.tech);
            }
            
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            
            res.json({ success: true, project });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;