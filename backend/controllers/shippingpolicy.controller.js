const ShippingPolicy = require("../models/shippingpolicy.model");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.getAllShippingPolicies = async (req, res) => {
    try {
        const data = await ShippingPolicy.find();

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getShippingPolicyById = async (req, res) => {
    try {
        const data = await ShippingPolicy.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Shipping Policy not found"
            });
        }

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.saveAllShippingPolicies = async (req, res) => {
    try {
        const { shipping } = req.body;

        if (!Array.isArray(shipping)) {
            return res.status(400).json({
                success: false,
                message: "Shipping policies must be an array"
            });
        }

        // 1. Get all existing shipping policies from DB
        const existingPolicies = await ShippingPolicy.find({});
        const existingPoliciesMap = new Map(existingPolicies.map(p => [p._id.toString(), p]));

        // 2. Identify incoming IDs (only valid ObjectIds are considered existing)
        const incomingIds = new Set(
            shipping
                .filter(p => p.id || p._id)
                .map(p => (p.id || p._id).toString())
        );

        // 3. Delete policies that are not in the incoming list
        const policiesToDelete = existingPolicies.filter(p => !incomingIds.has(p._id.toString()));

        for (const policy of policiesToDelete) {
            // If it's an image, delete from S3
            if (policy.type === 'image' && policy.description) {
                try {
                    const urlParts = policy.description.split('.com/');
                    if (urlParts.length > 1) {
                        const key = urlParts[1];
                        await deleteFromS3(key);
                    }
                } catch (err) {
                    console.error("Error deleting image from S3:", err);
                }
            }
            await ShippingPolicy.findByIdAndDelete(policy._id);
        }

        // 4. Update or Create policies
        const savedPolicies = [];
        for (const policyData of shipping) {
            const id = policyData.id || policyData._id;

            // Check if it's an existing policy in DB
            if (id && existingPoliciesMap.has(id.toString())) {
                const existingPolicy = existingPoliciesMap.get(id.toString());

                // Check if image changed - delete old image if so
                if (existingPolicy.type === 'image' && policyData.type === 'image' && existingPolicy.description !== policyData.description) {
                    try {
                        const urlParts = existingPolicy.description.split('.com/');
                        if (urlParts.length > 1) {
                            const key = urlParts[1];
                            await deleteFromS3(key);
                        }
                    } catch (err) {
                        console.error("Error deleting old image from S3:", err);
                    }
                }

                const updated = await ShippingPolicy.findByIdAndUpdate(
                    id,
                    {
                        description: policyData.description,
                        type: policyData.type
                    },
                    { new: true }
                );
                savedPolicies.push(updated);
            } else {
                // Create new policy
                const created = await ShippingPolicy.create({
                    description: policyData.description,
                    type: policyData.type
                });
                savedPolicies.push(created);
            }
        }

        res.status(200).json({
            success: true,
            message: "Shipping policies saved successfully..!",
            data: savedPolicies
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadShippingImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const uploadResult = await uploadToS3(req.file, "shipping");

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            url: uploadResult.url
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
