const Contact = require('../models/contact.model');

const createContact = async (req, res) => {
    try {
        const { name, email, phone, comment } = req.body;
        if (!name || !email || !comment) {
            return res.status(400).json({ success: false, message: 'Name, email, and comment are required.' });
        }
        const newContact = await Contact.create({ name, email, phone, comment });
        res.status(201).json({ success: true, message: 'Contact details submitted successfully', data: newContact });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting contact details', error: error.message });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching contact details', error: error.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact details not found' });
        }
        res.status(200).json({ success: true, message: 'Contact details deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting contact details', error: error.message });
    }
};

module.exports = { createContact, getAllContacts, deleteContact };
