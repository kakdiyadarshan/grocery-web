const User = require("../models/user.model");

// Add a new address
exports.addAddress = async (req, res) => {
    try {
        const { firstname, lastname, address, city, state, zip, country, phone, email, isDefault } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // If this address is default, unset all others
        if (isDefault) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
        }

        // First address is always default
        const finalIsDefault = user.addresses.length === 0 ? true : !!isDefault;

        const newAddress = {
            firstname,
            lastname,
            address,
            city,
            state,
            zip,
            country,
            phone,
            email,
            isDefault: finalIsDefault
        };

        user.addresses.unshift(newAddress);
        await user.save();

        const saved = user.addresses[0];
        res.status(201).json({ success: true, message: "Address added successfully", data: saved });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("addresses");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Sort: default first
        const sorted = [...user.addresses].sort((a, b) => b.isDefault - a.isDefault);
        res.status(200).json({ success: true, data: sorted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { firstname, lastname, address, city, state, zip, country, phone, email, isDefault } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const addr = user.addresses.id(addressId);
        if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

        if (isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        addr.firstname = firstname;
        addr.lastname = lastname;
        addr.address = address;
        addr.city = city;
        addr.state = state;
        addr.zip = zip;
        addr.country = country;
        addr.phone = phone;
        addr.email = email;
        addr.isDefault = !!isDefault;

        await user.save();
        res.status(200).json({ success: true, message: "Address updated successfully", data: addr });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const addr = user.addresses.id(addressId);
        if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

        const wasDefault = addr.isDefault;
        addr.deleteOne();

        // If deleted was default, promote next
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const addr = user.addresses.id(addressId);
        if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

        user.addresses.forEach(a => { a.isDefault = false; });
        addr.isDefault = true;

        await user.save();
        res.status(200).json({ success: true, message: "Default address updated", data: addr });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
