// PackageController.js
import Package from '../models/PackageModel.js';
import fs from 'fs';
import path from 'path';

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single package
export const getPackage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const packageData = await Package.findByPk(id);
    
    if (!packageData) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json(packageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new package
export const createPackage = async (req, res) => {
  try {
    const { name, route, description, price } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const image_url = `/uploads/${req.file.filename}`;
    
    // Create package
    const packageData = await Package.create({
      name,
      route,
      description,
      image_url,
      price
    });
    
    res.status(201).json(packageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, route, description, price } = req.body;
    
    const packageData = await Package.findByPk(id);
    if (!packageData) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    let image_url = packageData.image_url;
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image if it exists
      if (packageData.image_url) {
        const oldImagePath = path.join(process.cwd(), 'public', packageData.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image URL
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Update package
    await packageData.update({
      name: name || packageData.name,
      route: route || packageData.route,
      description: description !== undefined ? description : packageData.description,
      image_url,
      price: price || packageData.price
    });
    
    res.json(packageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const packageData = await Package.findByPk(id);
    if (!packageData) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Delete image file if it exists
    if (packageData.image_url) {
      const imagePath = path.join(process.cwd(), 'public', packageData.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete package from database
    await packageData.destroy();
    
    res.json({ message: 'Package deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};