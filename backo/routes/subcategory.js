const express = require('express');
const SubCategory = require('../models/subcategory');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subcategories
 *   description: Subcategory management
 */

/**
 * @swagger
 * /api/subcategories:
 *   post:
 *     summary: Create a subcategory
 *     tags: [Subcategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory created
 */

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { categoryId, name } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const subcategory = await SubCategory.create({
            name,
            category: categoryId,
            image: req.file.path
        });

        res.json(subcategory);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [Subcategories]
 *     responses:
 *       200:
 *         description: List of subcategories
 */

// GET all subcategories
router.get('/', async (req, res) => {
    try {
        const subcategories = await SubCategory.find()
            .populate('category', 'name image');

        res.json(subcategories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/subcategories/{categoryId}:
 *   get:
 *     summary: Get subcategories by category ID
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subcategories for a category
 */


router.get('/:categoryId', async (req, res) => {
    const subs = await SubCategory.find({ category: req.params.categoryId });
    res.json(subs);
});

/**
 * @swagger
 * /api/subcategories/{id}:
 *   put:
 *     summary: Update a subcategory
 *     tags: [Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory updated
 */

router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        if (req.body.name) {
            subcategory.name = req.body.name;
        }

        if (req.body.categoryId) {
            const category = await Category.findById(req.body.categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            subcategory.category = req.body.categoryId;
        }

        if (req.file) {
            subcategory.image = req.file.path;
        }

        await subcategory.save();

        res.json({
            message: 'Subcategory updated successfully',
            subcategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * @swagger
 * /api/subcategories/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Subcategory deleted
 */


router.delete('/:id', auth, async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        await subcategory.deleteOne();

        res.json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
