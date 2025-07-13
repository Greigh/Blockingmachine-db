
# Blockingmachine Database

<div align="center">
  <img src="./assets/Blockingmachine.png" width="120" alt="Blockingmachine Logo" />
</div>

[![Auto Update](https://github.com/greigh/blockingmachine-db/actions/workflows/update-filters.yml/badge.svg)](https://github.com/greigh/blockingmachine-db/actions/workflows/update-filters.yml)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/greigh/blockingmachine-db)](https://github.com/greigh/blockingmachine-db/commits/main)

> **Blockingmachine Database** is a fully automated, production-grade collection of filter lists for ad-blocking, privacy, and security. Powered by [Blockingmachine CLI](https://github.com/greigh/blockingmachine-cli), it aggregates, deduplicates, and exports rules from the best sources—plus your own custom rules—into every major format, updated daily.

---

## 🔗 Ecosystem

- [Blockingmachine CLI](https://github.com/greigh/blockingmachine-cli): Command-line tool for filter list management
- [Blockingmachine App](https://github.com/greigh/blockingmachine): Desktop GUI for easy management
- [Blockingmachine Core](https://github.com/greigh/blockingmachine-core): Core engine and rule processing

**Last updated:** 2025-07-13<br>**Next update:** Daily at 2:00 PM EST

---

## 🚀 Quick Start

**Direct Download:**

Download any filter list from the [filters directory](./filters/).

**Subscribe URLs:**

Use these raw GitHub URLs in your ad blocker or DNS tool:

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

| Rules | Size | Last Updated |
|----------|-------|------|--------------|
| 281,877 | 3.2MB | 2025-07-13 |

> Statistics automatically updated daily

## 🔄 Automation & Manual Update

This repository uses GitHub Actions to:

1. **Import** rules from all sources (including your custom rules) every day at 2:00 PM EST
2. **Process** and deduplicate with Blockingmachine CLI
3. **Export** to all supported formats
4. **Update** statistics and documentation
5. **Commit & push** changes automatically

**Manual update:**

```bash
# Install dependencies
npm install

# Run update script
npm start
```

## 📋 Sources

Filter lists are aggregated from these trusted sources:

### 🎯 Advertising & Tracking

- EasyList — Most subscribed filter list
- AdGuard Base — Comprehensive ad blocking
- uBlock Origin Filters — Advanced blocking rules
- GetAdmiral Domains — Anti-adblock bypass

### 🔒 Privacy Protection

- EasyPrivacy — Tracking protection
- Anti-Facebook List — Social media tracking
- Fanboy Annoyance — Cookie notices, popups

### 📱 Mobile & Gaming

- AdGuard Mobile — Mobile-specific rules
- AWAvenue Ads — Mobile ad networks
- AdAway Default — Android ad blocking
- Game Console Adblock — Gaming platforms

### 🛡️ DNS & Security

- AdGuard DNS Filter — DNS-level blocking
- Custom Blockingmachine Rules — Curated additions

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

Add your own blocking or allowlist rules in [`sources/blockingmachine-rules.txt`](./sources/blockingmachine-rules.txt). They’ll be included in the next automated update.

### Filter Source Management

Sources are managed in [`sources/.blockingmachinerc.json`](./sources/.blockingmachinerc.json). Each source includes:

- **URL** — Source location
- **Category** — Rule classification
- **Enabled** — Whether to include in builds

### Allowlist Management

Blockingmachine includes carefully curated allowlist rules to prevent false positives for:

- Banking and financial services
- E-commerce platforms
- Streaming media functionality
- Essential web services

## 📈 Performance

- **Deduplication:** Removes duplicate rules across all sources
- **Optimization:** Merges compatible rules for better performance
- **Validation:** Ensures rule syntax correctness
- **Categorization:** Organizes rules by purpose and effectiveness

## 🤝 Contributing

1. **Report Issues:** Found a false positive? [Open an issue](https://github.com/greigh/blockingmachine-db/issues)
2. **Suggest Sources:** Know a quality filter list? Let us know!
3. **Improve Automation:** Submit PRs to enhance the update process

## 📜 License

BSD-3-Clause License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>⚡ Powered by <a href="https://github.com/greigh/blockingmachine-cli">Blockingmachine CLI</a> | 🤖 Auto-updated daily</strong>
</div>
