const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const glob = require('glob');
const Application = require('../models/Application');

const execAsync = promisify(exec);

class ApplicationService {
  constructor() {
    this.desktopPaths = [
      '/usr/share/applications',
      '/usr/local/share/applications',
      path.join(process.env.HOME || '/home/' + process.env.USER, '.local/share/applications')
    ];
  }

  // Parse .desktop file content
  parseDesktopFile(content) {
    const lines = content.split('\n');
    const app = {};
    let inDesktopEntry = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '[Desktop Entry]') {
        inDesktopEntry = true;
        continue;
      }
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed !== '[Desktop Entry]') {
        inDesktopEntry = false;
        continue;
      }
      
      if (!inDesktopEntry || !trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      switch (key) {
        case 'Name':
          app.name = value;
          break;
        case 'Comment':
        case 'GenericName':
          if (!app.description) app.description = value;
          break;
        case 'Exec':
          app.command = value.replace(/%[fFuU]/g, '').trim();
          break;
        case 'Icon':
          app.icon = value;
          break;
        case 'Categories':
          app.categories = value.split(';').filter(cat => cat.trim());
          break;
        case 'Hidden':
        case 'NoDisplay':
          app.hidden = value.toLowerCase() === 'true';
          break;
        case 'Type':
          app.type = value;
          break;
      }
    }
    
    return app;
  }

  // Scan system for desktop files
  async scanDesktopFiles() {
    console.log('Starting desktop file scan...');
    const desktopFiles = [];
    
    for (const desktopPath of this.desktopPaths) {
      try {
        await fs.access(desktopPath);
        const pattern = path.join(desktopPath, '*.desktop');
        const files = await promisify(glob)(pattern);
        desktopFiles.push(...files);
        console.log(`Found ${files.length} desktop files in ${desktopPath}`);
      } catch (error) {
        console.log(`Skipping ${desktopPath}: ${error.message}`);
      }
    }
    
    console.log(`Total desktop files found: ${desktopFiles.length}`);
    return desktopFiles;
  }

  // Update applications database from system scan
  async updateApplicationsFromSystem() {
    try {
      console.log('Updating applications database from system scan...');
      const desktopFiles = await this.scanDesktopFiles();
      const applications = [];
      
      for (const filePath of desktopFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const app = this.parseDesktopFile(content);
          
          // Skip if essential fields are missing or app is hidden
          if (!app.name || !app.command || app.hidden || app.type !== 'Application') {
            continue;
          }
          
          // Check if application already exists
          const existingApp = await Application.findOne({ desktopFile: filePath });
          
          const appData = {
            name: app.name,
            description: app.description || '',
            icon: app.icon || app.name.charAt(0).toUpperCase(),
            command: app.command,
            categories: app.categories || [],
            desktopFile: filePath
          };
          
          if (existingApp) {
            // Update existing application
            await Application.findByIdAndUpdate(existingApp._id, appData);
            applications.push({ ...appData, _id: existingApp._id, isRecent: existingApp.isRecent });
          } else {
            // Create new application
            const newApp = new Application(appData);
            await newApp.save();
            applications.push({ ...appData, _id: newApp._id, isRecent: false });
          }
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error.message);
        }
      }
      
      console.log(`Successfully processed ${applications.length} applications`);
      return applications;
    } catch (error) {
      console.error('Error updating applications from system:', error);
      throw error;
    }
  }

  // Get all applications
  async getAllApplications() {
    try {
      // Update from system first (this could be optimized to run periodically)
      await this.updateApplicationsFromSystem();
      
      // Get applications sorted by recent usage and name
      const applications = await Application.find({})
        .sort({ lastLaunched: -1, name: 1 })
        .lean();
      
      // Mark recent applications (launched in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const applicationsWithRecent = applications.map(app => ({
        ...app,
        isRecent: app.lastLaunched && app.lastLaunched > sevenDaysAgo
      }));
      
      console.log(`Retrieved ${applications.length} applications from database`);
      return applicationsWithRecent;
    } catch (error) {
      console.error('Error getting applications:', error);
      throw error;
    }
  }

  // Launch application by ID
  async launchApplication(applicationId) {
    try {
      console.log(`Attempting to launch application with ID: ${applicationId}`);
      
      const application = await Application.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }
      
      console.log(`Launching application: ${application.name} with command: ${application.command}`);
      
      // Clean up the command (remove field codes and extra spaces)
      let command = application.command
        .replace(/%[fFuUdDnNickvm]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Split command into executable and arguments
      const parts = command.split(' ');
      const executable = parts[0];
      const args = parts.slice(1);
      
      // Spawn the process in detached mode so it continues after our process ends
      const child = spawn(executable, args, {
        detached: true,
        stdio: 'ignore'
      });
      
      // Unref so the parent process can exit
      child.unref();
      
      // Update application launch statistics
      await Application.findByIdAndUpdate(applicationId, {
        lastLaunched: new Date(),
        $inc: { launchCount: 1 }
      });
      
      console.log(`Successfully launched ${application.name} with PID: ${child.pid}`);
      
      return {
        success: true,
        message: `${application.name} launched successfully`,
        processId: child.pid
      };
    } catch (error) {
      console.error('Error launching application:', error);
      throw error;
    }
  }
}

module.exports = new ApplicationService();