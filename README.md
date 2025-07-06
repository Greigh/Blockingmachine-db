# Blockingmachine Database

[![Auto Update](https://github.com/greigh/blockingmachine-db/actions/workflows/update-filters.yml/badge.svg)](https://github.com/greigh/blockingmachine-db/actions/workflows/update-filters.yml)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](LICENSE)

Automatically updated collection of filter lists for ad-blocking, privacy protection, and security, powered by [Blockingmachine CLI](https://github.com/greigh/blockingmachine-cli).

## 🔗 Related Projects

- **[Blockingmachine CLI](https://github.com/greigh/blockingmachine-cli)** - Command-line tool for filter list management
- **[Blockingmachine App](https://github.com/greigh/blockingmachine)** - Desktop application with GUI
- **[Blockingmachine Core](https://github.com/greigh/blockingmachine-core)** - Core library and rule processing engine

**Last updated:** 2025-07-06 | **Next update:** Daily at 2:00 PM EST

## 🚀 Quick Start

### Direct Download

Download any filter list directly from the [filters directory](./filters/).

### Subscribe URLs

Use these raw GitHub URLs in your ad blocker:

| Format | Use Case | Subscribe URL |
|--------|----------|---------------|
| **AdGuard Browser** | Browser extensions (uBlock Origin, AdGuard) | [`adguardBrowser.txt`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/adguardBrowser.txt) |
| **AdGuard DNS** | AdGuard Home, AdGuard DNS | [`adguardDns.txt`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/adguardDns.txt) |
| **Hosts** | Pi-hole, system hosts file | [`hosts.txt`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/hosts.txt) |
| **DNSMasq** | DNSMasq DNS server | [`dnsmasq.conf`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/dnsmasq.conf) |
| **Unbound** | Unbound DNS resolver | [`unbound.conf`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/unbound.conf) |
| **BIND** | BIND DNS server | [`named.conf`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/named.conf) |
| **Privoxy** | Privoxy proxy server | [`privoxy.action`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/privoxy.action) |
| **Shadowrocket** | Shadowrocket iOS app | [`shadowrocket.conf`](https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/shadowrocket.conf) |

## 📊 Statistics

| Category | Rules | Size | Last Updated |
|----------|-------|------|--------------|
| **Complete** | 387,530 | 3.2MB | 2025-07-06 |
| Advertising | 68,245 | 1.7MB | 2025-07-06 |
| Privacy | 42,183 | 1.0MB | 2025-07-06 |
| Security | 12,762 | 308KB | 2025-04-29 |
| Social | 8,421 | 204KB | 2025-04-29 |
| Malware | 5,738 | 139KB | 2025-04-29 |
| Cryptomining | 3,291 | 80KB | 2025-04-29 |

> Statistics automatically updated daily

## 🔄 Automation

This repository uses GitHub Actions to automatically:

1. **Import** rules from trusted sources daily at 2:00 PM EST
2. **Process** and deduplicate rules using Blockingmachine CLI  
3. **Export** optimized lists in multiple formats
4. **Update** statistics and documentation
5. **Commit** changes automatically

### Manual Update

Trigger a manual update using the GitHub Actions interface or:

```bash
# Install dependencies
npm install

# Run update script
npm start
```

## 📋 Sources

Filter lists are aggregated from these trusted sources:

### 🎯 Advertising & Tracking

- **EasyList** - Most subscribed filter list
- **AdGuard Base** - Comprehensive ad blocking
- **uBlock Origin Filters** - Advanced blocking rules
- **GetAdmiral Domains** - Anti-adblock bypass

### 🔒 Privacy Protection

- **EasyPrivacy** - Tracking protection
- **Anti-Facebook List** - Social media tracking
- **Fanboy Annoyance** - Cookie notices, popups

### 📱 Mobile & Gaming

- **AdGuard Mobile** - Mobile-specific rules
- **AWAvenue Ads** - Mobile ad networks
- **AdAway Default** - Android ad blocking
- **Game Console Adblock** - Gaming platforms

### 🛡️ DNS & Security

- **AdGuard DNS Filter** - DNS-level blocking
- **Custom Blockingmachine Rules** - Curated additions

## 🛠️ Integration Examples

### Pi-hole

```bash
# Add to Pi-hole blocklists
echo "https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/hosts.txt" | sudo tee -a /etc/pihole/adlists.list

# Update gravity
pihole -g
```

### AdGuard Home

1. Open AdGuard Home admin panel
2. Go to **Filters** → **DNS blocklists**  
3. Click **Add blocklist**
4. Enter URL: `https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/adguardDns.txt`
5. Click **Add**

### uBlock Origin

1. Open uBlock Origin dashboard
2. Go to **Filter lists** tab
3. Scroll to **Custom** section
4. Click **Import** and add: `https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/adguardBrowser.txt`

### System Hosts File

```bash
# Backup existing hosts file
sudo cp /etc/hosts /etc/hosts.backup

# Download and append our hosts list
curl -o /tmp/blocklist.txt https://raw.githubusercontent.com/greigh/blockingmachine-db/main/filters/hosts.txt
sudo cat /tmp/blocklist.txt >> /etc/hosts
```

## 🔧 Advanced Configuration

### Custom Rules

To add custom blocking rules, modify [`sources/blockingmachine-rules.txt`](./sources/blockingmachine-rules.txt) and the update will include them in the next cycle.

### Filter Source Management

Sources are configured in [`sources/.blockingmachinerc.json`](./sources/.blockingmachinerc.json). Each source includes:

- **URL** - Source location
- **Category** - Rule classification  
- **Enabled** - Whether to include in builds

### Allowlist Management

Blockingmachine includes carefully curated allowlist rules to prevent false positives with:

- Banking and financial services
- E-commerce platforms  
- Streaming media functionality
- Essential web services

## 📈 Performance

- **Deduplication**: Removes duplicate rules across sources
- **Optimization**: Merges compatible rules for better performance  
- **Validation**: Ensures rule syntax correctness
- **Categorization**: Organizes rules by purpose and effectiveness

## 🤝 Contributing

1. **Report Issues**: Found a false positive? [Open an issue](https://github.com/greigh/blockingmachine-db/issues)
2. **Suggest Sources**: Know a quality filter list? Let us know!
3. **Improve Automation**: Submit PRs to enhance the update process

## 📜 License

BSD-3-Clause License - see [LICENSE](LICENSE) file for details.

---

**⚡ Powered by [Blockingmachine CLI](https://github.com/greigh/blockingmachine-cli)** | **🤖 Auto-updated daily**
