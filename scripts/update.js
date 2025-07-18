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
    
    // Check if we should force a fresh import (in CI or if specifically requested)
    const forceFreshImport = process.env.NODE_ENV === 'production' || process.env.FORCE_IMPORT === 'true';
    const filterListPath = './sources/filters/output/filter-list.txt';
    
    let shouldImport = forceFreshImport;
    
    if (!forceFreshImport) {
      try {
        await fs.access(filterListPath);
        console.log('✅ Using existing filter data from previous successful import');
        shouldImport = false;
      } catch (error) {
        console.log('⚠️ No existing filter data found, attempting CLI import...');
        shouldImport = true;
      }
    } else {
      console.log('🔄 Force importing fresh filter data...');
    }
    
    if (shouldImport) {
      
      // Change to sources directory where config is located
      process.chdir('./sources');
      
      // Run Blockingmachine import command
      console.log('📥 Importing filter lists...');
      try {
        const { stdout, stderr } = await execAsync('blockingmachine import');
        console.log('Import output:', stdout);
        if (stderr) console.log('Import warnings:', stderr);
        
        // Append personal filters after successful import
        await appendPersonalFilters();
        
      } catch (error) {
        console.error(`❌ Import failed: ${error.message}`);
        console.log('⚠️ Attempting to continue with export...');
      }

      // Run Blockingmachine export command for different formats
      console.log('📤 Exporting filter lists...');
      try {
        const { stdout, stderr } = await execAsync(`blockingmachine export --output-path ../filters/output`);
        console.log('Export output:', stdout);
        if (stderr) console.log('Export warnings:', stderr);
      } catch (error) {
        console.error(`❌ Export failed: ${error.message}`);
        console.log('⚠️ Will continue with existing data...');
      }

      // Go back to root directory
      process.chdir('..');
    }

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
    
    // Read the source file and update headers
    const content = await fs.readFile(adguardSrcPath, 'utf-8');
    const lines = content.split('\n');
    
    // Count actual blocking rules (excluding metadata)
    const ruleCount = lines.filter(line => 
      line.trim() && !line.startsWith('!') && !line.startsWith('#') && !line.startsWith('[')
    ).length;
    
    // Update headers with current timestamp and rule count
    const updatedLines = lines.map(line => {
      if (line.startsWith('! Last updated:')) {
        return `! Last updated: ${new Date().toISOString()}`;
      }
      if (line.startsWith('! Rules count:')) {
        return `! Rules count: ${ruleCount}`;
      }
      return line;
    });
    
    // Write the updated content to the destination
    await fs.writeFile(adguardDestPath, updatedLines.join('\n'));
    console.log(`✓ Copied filter-list.txt → adguardBrowser.txt (${ruleCount.toLocaleString()} rules)`);
    
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
    hostsRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    hostsRules.push('# License: BSD-3-Clause');
    hostsRules.push('# Made by: Daniel Hipskind aka Greigh');
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
    dnsmasqRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    dnsmasqRules.push('# License: BSD-3-Clause');
    dnsmasqRules.push('# Made by: Daniel Hipskind aka Greigh');
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
    unboundRules.push('# Title: Blockingmachine unbound List');
    unboundRules.push('# Description: Combined filter list optimized for unbound');
    unboundRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    unboundRules.push('# License: BSD-3-Clause');
    unboundRules.push('# Made by: Daniel Hipskind aka Greigh');
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
    namedRules.push('# Title: Blockingmachine BIND List');
    namedRules.push('# Description: Combined filter list optimized for BIND');
    namedRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    namedRules.push('# License: BSD-3-Clause');
    namedRules.push('# Made by: Daniel Hipskind aka Greigh');
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
    privoxyRules.push('# Title: Blockingmachine Privoxy List');
    privoxyRules.push('# Description: Combined filter list optimized for Privoxy');
    privoxyRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    privoxyRules.push('# License: BSD-3-Clause');
    privoxyRules.push('# Made by: Daniel Hipskind aka Greigh');
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
    shadowrocketRules.push('# Title: Blockingmachine Shadowrocket List');
    shadowrocketRules.push('# Description: Combined filter list optimized for Shadowrocket');
    shadowrocketRules.push('# Homepage: https://github.com/greigh/blockingmachine');
    shadowrocketRules.push('# License: BSD-3-Clause');
    shadowrocketRules.push('# Made by: Daniel Hipskind aka Greigh');
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
      });
    
    // Count actual blocking rules (excluding metadata)
    const ruleCount = dnsRules.filter(line => 
      line.trim() && !line.startsWith('!') && !line.startsWith('#') && !line.startsWith('[')
    ).length;
    
    // Update the headers with current timestamp and DNS rule count
    const updatedDnsRules = dnsRules.map(line => {
      if (line.startsWith('! Last updated:')) {
        return `! Last updated: ${new Date().toISOString()}`;
      }
      if (line.startsWith('! Rules count:')) {
        return `! Rules count: ${ruleCount}`;
      }
      return line;
    });
    
    await fs.writeFile(dnsListPath, updatedDnsRules.join('\n'));
    console.log(`✓ Generated DNS-optimized AdGuard list (${ruleCount.toLocaleString()} rules)`);
    
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
        /\| [\d,]+ \| [\d.]+MB? \| \d{4}-\d{2}-\d{2} \|/,
        `| ${formattedCount} | 3.2MB | ${today} |`
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

async function appendPersonalFilters() {
  try {
    // Determine paths based on current working directory
    // Check if we're in sources directory or root directory
    const isInSourcesDir = process.cwd().endsWith('/sources');
    
    const importedRulesPath = isInSourcesDir 
      ? './filters/output/imported-rules.txt'
      : './sources/filters/output/imported-rules.txt';
    
    const personalRulesPath = isInSourcesDir
      ? './blockingmachine-rules.txt' 
      : './sources/blockingmachine-rules.txt';
    
    // Read both files
    const importedContent = await fs.readFile(importedRulesPath, 'utf-8');
    const personalContent = await fs.readFile(personalRulesPath, 'utf-8');
    
    // Append personal rules to imported rules
    const combinedContent = importedContent + '\n! Personal Filters\n' + personalContent;
    
    // Write back to imported rules file
    await fs.writeFile(importedRulesPath, combinedContent);
    console.log('✓ Appended personal filters to imported rules');
    
  } catch (error) {
    console.log(`⚠️ Could not append personal filters: ${error.message}`);
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
