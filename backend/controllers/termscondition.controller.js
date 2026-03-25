const TermsCondition = require("../models/termscondition.model");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.getAllTermConditions = async (req, res) => {
    try {
        const data = await TermsCondition.find();

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTermConditionById = async (req, res) => {
    try {
        const data = await TermsCondition.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Term & Condition not found"
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

exports.saveAllTermConditions = async (req, res) => {
    try {
        const { terms } = req.body;

        if (!Array.isArray(terms)) {
            return res.status(400).json({
                success: false,
                message: "Terms must be an array"
            });
        }

        // 1. Get all existing terms from DB
        const existingTerms = await TermsCondition.find({});
        const existingTermsMap = new Map(existingTerms.map(t => [t._id.toString(), t]));

        // 2. Identify incoming IDs (only valid ObjectIds are considered existing)
        const incomingIds = new Set(
            terms
                .filter(t => t.id || t._id)
                .map(t => (t.id || t._id).toString())
        );

        // 3. Delete terms that are not in the incoming list
        const termsToDelete = existingTerms.filter(t => !incomingIds.has(t._id.toString()));

        for (const term of termsToDelete) {
            // If it's an image, delete from S3
            if (term.type === 'image' && term.description) {
                try {
                    // Extract key from URL
                    // Assuming URL format: ...amazonaws.com/folder/key or similar
                    // We split by .com/ to get the key part
                    const urlParts = term.description.split('.com/');
                    if (urlParts.length > 1) {
                        const key = urlParts[1];
                        await deleteFromS3(key);
                    }
                } catch (err) {
                    console.error("Error deleting image from S3:", err);
                }
            }
            await TermsCondition.findByIdAndDelete(term._id);
        }

        // 4. Update or Create terms
        const savedTerms = [];
        for (const termData of terms) {
            const id = termData.id || termData._id;

            // Check if it's an existing term in DB
            if (id && existingTermsMap.has(id.toString())) {
                const existingTerm = existingTermsMap.get(id.toString());

                // Check if image changed - delete old image if so
                if (existingTerm.type === 'image' && termData.type === 'image' && existingTerm.description !== termData.description) {
                    try {
                        const urlParts = existingTerm.description.split('.com/');
                        if (urlParts.length > 1) {
                            const key = urlParts[1];
                            await deleteFromS3(key);
                        }
                    } catch (err) {
                        console.error("Error deleting old image from S3:", err);
                    }
                }

                const updated = await TermsCondition.findByIdAndUpdate(
                    id,
                    {
                        description: termData.description,
                        type: termData.type
                    },
                    { new: true }
                );
                savedTerms.push(updated);
            } else {
                // Create new term
                const created = await TermsCondition.create({
                    description: termData.description,
                    type: termData.type
                });
                savedTerms.push(created);
            }
        }

        res.status(200).json({
            success: true,
            message: "Terms saved successfull..!",
            data: savedTerms
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadTermImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const result = await uploadToS3(req.file, "terms");

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            url: result.url
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
