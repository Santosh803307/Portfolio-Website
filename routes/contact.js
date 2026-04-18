const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');
const { sendContactEmail, sendProjectInquiryEmail } = require('../utils/email');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for contact form
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { success: false, message: 'Too many messages. Please try again later.' }
});

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/',
    contactLimiter,
    [
        body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
    ],
    async (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        try {
            const { name, email, message } = req.body;
            
            // Get IP and User Agent
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            // Save to database
            const contact = new Contact({
                name,
                email,
                message,
                ipAddress,
                userAgent
            });
            
            await contact.save();
            
            // Send email notification
            await sendContactEmail({ name, email, message });
            
            res.status(201).json({
                success: true,
                message: 'Message sent successfully! I will get back to you soon.'
            });
        } catch (error) {
            console.error('Contact form error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.'
            });
        }
    }
);

// @route   GET /api/contact/messages
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get('/messages', authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        
        const query = {};
        if (status) query.status = status;
        
        const messages = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/contact/:id/status
// @desc    Update message status (Admin only)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete message (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);
        
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/contact/project-inquiry
// @desc    Submit project inquiry
// @access  Public
router.post('/project-inquiry',
    contactLimiter,
    [
        body('name').trim().isLength({ min: 2 }),
        body('email').isEmail(),
        body('projectType').notEmpty(),
        body('message').trim().isLength({ min: 10 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            await sendProjectInquiryEmail(req.body);
            res.json({ success: true, message: 'Inquiry sent successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);

module.exports = router;