# 🔐 Security Policy

At **Quicksi**, we take the security of our CLI, template ecosystem, and users seriously.

While Quicksi is a developer tool, it interacts with:
- Local file systems  
- Remote template sources  
- External services  

Ensuring safe usage and preventing vulnerabilities is a priority.

---

## 📢 Reporting a Vulnerability

If you discover a security vulnerability, **please do not report it publicly via GitHub issues**.

Instead, report it responsibly through one of the following channels:

### 📧 Email (Preferred)
Send details to:
**quicksidotio@gmail.com**

---

## 🛡️ What to Report

We are particularly interested in vulnerabilities that could impact:

- Malicious template execution  
- Arbitrary file system access or overwrite  
- Command injection via CLI inputs  
- Dependency or installation risks  
- Remote template fetching vulnerabilities  
- Any behavior that could compromise user systems  

---

## 📝 What to Include in Your Report

To help us investigate quickly, please include:

- Description of the vulnerability  
- Steps to reproduce the issue  
- Proof-of-concept (if available)  
- Affected code paths or files  
- Potential impact (what could happen if exploited)  
- Suggested fix (optional, but appreciated)  

---

## ⚠️ Responsible Disclosure

We ask that you:

- Do **not publicly disclose** the issue until it has been addressed  
- Give us reasonable time to investigate and fix  
- Avoid exploiting the vulnerability beyond proof-of-concept  

---

## 🙏 Acknowledgements

We appreciate security researchers and contributors who help improve Quicksi.

Valid reports may be acknowledged publicly (with your permission) in:
- Release notes  
- Security advisories  
- Contributor recognition  

---

## 🚧 Scope

This policy applies to:

- [The Quicksi CLI]() 
- [Official Quicksi templates](https://github.com/Quicksi-CLI/quicksi-templates) 
- Template fetching and caching system  
- Installation scripts
- [Quicksi Docs](https://quicksi.io)

---

## 💡 Notes

Quicksi templates are community-driven. While we review contributions for any security vulnerability, users should always:
- Review template code before execution  
- Avoid running untrusted templates blindly 

---

## 📄 Summary

> Quicksi prioritizes safe project scaffolding.  
> If you find a vulnerability, report it responsibly—we’ll take it seriously.
