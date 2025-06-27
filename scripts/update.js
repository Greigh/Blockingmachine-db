#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const today = new Date().toISOString().split('T')[0];

async function updateFilters() {
  try {
    console.log('🚀 Starting Blockingmachine filter update...');
    
    // Ensure output directory exists
    await fs.mkdir('./filters/output', { recursive: true });
    
    // Change to sources directory where config is located
    process.chdir('./sources');
    
    // Run Blockingmachine import command
    console.log('📥 Importing filter lists...');
    try {
      const { stdout, stderr } = await execAsync('blockingmachine import');
      console.log('Import output:', stdout);
      if (stderr) console.log('Import warnings:', stderr);
    } catch (error) {
      console.error(`❌ Import failed: ${error.message}`);
      // Continue with export even if some imports failed
      console.log('⚠️ Attempting to continue with export...');
    }

    // Run Blockingmachine export command for different formats
    console.log('📤 Exporting filter lists...');
    try {
      const { stdout, stderr } = await execAsync(`blockingmachine export --output-path ./filters/output`);
      console.log('Export output:', stdout);
      if (stderr) console.log('Export warnings:', stderr);
    } catch (error) {
      console.error(`❌ Export failed: ${error.message}`);
      throw error;
    }

    // Go back to root directory
    process.chdir('..');

    // Copy and rename files
    console.log('📁 Organizing output files...');
    await copyAndRenameFiles();

    // Generate DNS-specific AdGuard list
    console.log('🔧 Generating DNS-optimized AdGuard list...');
    await generateDNSAdGuardList();

    // Update README with current date and statistics
    console.log('📝 Updating README...');
    await updateReadme();

    console.log('✅ Filter lists updated successfully!');
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      date: today
    };
    
  } catch (error) {
    console.error('💥 Error updating filters:', error);
    throw error;
  }
}

async function copyAndRenameFiles() {
  // First, copy the main filter file
  const adguardSrcPath = path.join('./sources/filters/output', 'filter-list.txt');
  const adguardDestPath = path.join('./filters', 'adguardBrowser.txt');
  
  try {
    await fs.access(adguardSrcPath);
    await fs.copyFile(adguardSrcPath, adguardDestPath);
    console.log(`✓ Copied filter-list.txt → adguardBrowser.txt`);
    
    // Generate other formats from the AdGuard format
    console.log('🔄 Generating additional formats from AdGuard list...');
    await generateAdditionalFormats(adguardDestPath);
    
  } catch (error) {
    console.log(`⚠️ Could not copy main filter list: ${error.message}`);
  }
}

async function generateAdditionalFormats(adguardFilePath) {
  try {
    const content = await fs.readFile(adguardFilePath, 'utf-8');
    const lines = content.split('\n');
    
    // Generate hosts format
    const hostsRules = [];
    hostsRules.push('# Title: Blockingmachine AdGuard List');
    hostsRules.push('# Description: Combined filter list optimized for AdGuard');
    hostsRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    hostsRules.push('# License: BSD-3-Clause');
    hostsRules.push('# Made by: Daniel Hipskind');
    hostsRules.push('# Version: 3.0.0');
    hostsRules.push(`# Last Updated: ${new Date().toISOString()}`);
    hostsRules.push('# Expires: 1 day');
    hostsRules.push('');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          hostsRules.push(`0.0.0.0 ${domain}`);
        }
      }
    });
    
    await fs.writeFile('./filters/hosts.txt', hostsRules.join('\n'));
    console.log('✓ Generated hosts.txt format');
    
    // Generate basic dnsmasq format
    const dnsmasqRules = [];
    dnsmasqRules.push('# Title: Blockingmachine AdGuard List');
    dnsmasqRules.push('# Description: Combined filter list optimized for AdGuard');
    dnsmasqRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    dnsmasqRules.push('# License: BSD-3-Clause');
    dnsmasqRules.push('# Made by: Daniel Hipskind');
    dnsmasqRules.push('# Version: 3.0.0');
    dnsmasqRules.push(`# Last Updated: ${new Date().toISOString()}`);
    dnsmasqRules.push('# Expires: 1 day');
    dnsmasqRules.push('');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          dnsmasqRules.push(`address=/${domain}/0.0.0.0`);
        }
      }
    });
    
    await fs.writeFile('./filters/dnsmasq.conf', dnsmasqRules.join('\n'));
    console.log('✓ Generated dnsmasq.conf format');
    
    // Generate unbound format
    const unboundRules = [];
    unboundRules.push('# Title: Blockingmachine AdGuard List');
    unboundRules.push('# Description: Combined filter list optimized for AdGuard');
    unboundRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    unboundRules.push('# License: BSD-3-Clause');
    unboundRules.push('# Made by: Daniel Hipskind');
    unboundRules.push('# Version: 3.0.0');
    unboundRules.push(`# Last Updated: ${new Date().toISOString()}`);
    unboundRules.push('# Expires: 1 day');
    unboundRules.push('');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          unboundRules.push(`local-zone: "${domain}" redirect`);
          unboundRules.push(`local-data: "${domain} A 0.0.0.0"`);
        }
      }
    });
    
    await fs.writeFile('./filters/unbound.conf', unboundRules.join('\n'));
    console.log('✓ Generated unbound.conf format');
    
    // Generate BIND named.conf format
    const namedRules = [];
    namedRules.push('# Title: Blockingmachine AdGuard List');
    namedRules.push('# Description: Combined filter list optimized for AdGuard');
    namedRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    namedRules.push('# License: BSD-3-Clause');
    namedRules.push('# Made by: Daniel Hipskind');
    namedRules.push('# Version: 3.0.0');
    namedRules.push(`# Last Updated: ${new Date().toISOString()}`);
    namedRules.push('# Expires: 1 day');
    namedRules.push('');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          namedRules.push(`zone "${domain}" { type master; file "/dev/null"; };`);
        }
      }
    });
    
    await fs.writeFile('./filters/named.conf', namedRules.join('\n'));
    console.log('✓ Generated named.conf format');
    
    // Generate Privoxy format
    const privoxyRules = [];
    privoxyRules.push('# Title: Blockingmachine AdGuard List');
    privoxyRules.push('# Description: Combined filter list optimized for AdGuard');
    privoxyRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    privoxyRules.push('# License: BSD-3-Clause');
    privoxyRules.push('# Made by: Daniel Hipskind');
    privoxyRules.push('# Version: 3.0.0');
    privoxyRules.push(`# Last Updated: ${new Date().toISOString()}`);
    privoxyRules.push('# Expires: 1 day');
    privoxyRules.push('');
    privoxyRules.push('{+block{Blockingmachine Blocklist}}');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          privoxyRules.push(`.${domain}`);
        }
      }
    });
    
    await fs.writeFile('./filters/privoxy.action', privoxyRules.join('\n'));
    console.log('✓ Generated privoxy.action format');
    
    // Generate Shadowrocket format
    const shadowrocketRules = [];
    shadowrocketRules.push('# Title: Blockingmachine AdGuard List');
    shadowrocketRules.push('# Description: Combined filter list optimized for AdGuard');
    shadowrocketRules.push('# Homepage: https://github.com/danielhipskind/blockingmachine');
    shadowrocketRules.push('# License: BSD-3-Clause');
    shadowrocketRules.push('# Made by: Daniel Hipskind');
    shadowrocketRules.push('# Version: 3.0.0');
    shadowrocketRules.push(`# Last Updated: ${new Date().toISOString()}`);
    shadowrocketRules.push('# Expires: 1 day');
    shadowrocketRules.push('');
    shadowrocketRules.push('[Rule]');
    
    lines.forEach(line => {
      if (line.match(/^\|\|([^\/\^$]+)\^$/)) {
        const domain = line.replace(/^\|\|/, '').replace(/\^$/, '');
        if (domain && !domain.includes('*') && !domain.includes('$')) {
          shadowrocketRules.push(`DOMAIN-SUFFIX,${domain},REJECT`);
        }
      }
    });
    
    await fs.writeFile('./filters/shadowrocket.conf', shadowrocketRules.join('\n'));
    console.log('✓ Generated shadowrocket.conf format');
    
  } catch (error) {
    console.log(`⚠️ Could not generate additional formats: ${error.message}`);
  }
}

async function generateDNSAdGuardList() {
  try {
    const browserListPath = './filters/adguardBrowser.txt';
    const dnsListPath = './filters/adguardDns.txt';
    
    const content = await fs.readFile(browserListPath, 'utf-8');
    
    // Filter out browser-specific rules, keep only DNS-compatible ones
    const dnsRules = content
      .split('\n')
      .filter(line => {
        // Keep comments and metadata
        if (line.startsWith('!') || line.startsWith('#') || line.trim() === '') {
          return true;
        }
        
        // Keep basic domain blocking rules
        if (line.match(/^\|\|[^$]*\^$/)) {
          return true;
        }
        
        // Keep whitelisting rules  
        if (line.match(/^@@\|\|[^$]*\^$/)) {
          return true;
        }
        
        // Remove browser-specific rules with modifiers
        return false;
      })
      .join('\n');
    
    await fs.writeFile(dnsListPath, dnsRules);
    console.log('✓ Generated DNS-optimized AdGuard list');
    
  } catch (error) {
    console.log(`⚠️ Could not generate DNS AdGuard list: ${error.message}`);
  }
}

async function updateReadme() {
  try {
    let readme = await fs.readFile('./README.md', 'utf-8');
    
    // Update last updated date
    readme = readme.replace(/\*\*Last updated:\*\* \d{4}-\d{2}-\d{2}/, `**Last updated:** ${today}`);
    
    // Update statistics if files exist
    try {
      const adguardPath = './filters/adguardBrowser.txt';
      const adguardContent = await fs.readFile(adguardPath, 'utf-8');
      const totalRules = adguardContent.split('\n').filter(line => 
        line.trim() && !line.startsWith('!') && !line.startsWith('#') && !line.startsWith('[')
      ).length;
      
      const formattedCount = totalRules.toLocaleString();
      readme = readme.replace(
        /\| \*\*Complete\*\* \| [\d,]+ \|/,
        `| **Complete** | ${formattedCount} |`
      );
      
      // Also update the "Last Updated" dates in the table
      readme = readme.replace(
        /(\| [\w\*\* ]+\| [\d,]+ \| [\w.]+MB? \|) \d{4}-\d{2}-\d{2}/g,
        `$1 ${today}`
      );
      
      console.log(`✓ Updated statistics: ${formattedCount} rules`);
    } catch (error) {
      console.log(`⚠️ Could not update statistics: ${error.message}`);
    }
    
    await fs.writeFile('./README.md', readme);
    console.log('✓ Updated README.md');
    
  } catch (error) {
    console.log(`⚠️ Could not update README: ${error.message}`);
  }
}

// Run the update if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateFilters()
    .then(result => {
      console.log('🎉 Update completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Update failed:', error);
      process.exit(1);
    });
}

export { updateFilters };
