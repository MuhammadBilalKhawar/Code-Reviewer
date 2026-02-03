import React from 'react';
import { Container, Flex, Grid } from './ui/Layout';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'License', href: '#' },
  ],
};

export const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-copper/10 bg-carbon py-12 ${className}`}>
      <Container>
        <Grid columns={4} gap={8} className="mb-12">
          {/* Brand */}
          <div className="col-span-4 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-copper flex items-center justify-center text-carbon text-sm font-bold">
                CR
              </div>
              <h3 className="text-lg font-bold text-copper">CodeReview</h3>
            </div>
            <p className="text-xs text-neon-muted">
              Premium AI-powered code analysis for modern developers.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-copper mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-neon-muted hover:text-copper transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Grid>

        {/* Divider */}
        <div className="border-t border-copper/10 pt-8">
          <Flex justify="between" align="center" className="flex-col sm:flex-row gap-4">
            <p className="text-xs text-neon-muted">
              © {currentYear} CodeReview. All rights reserved.
            </p>
            <Flex gap="4">
              <a href="#" className="text-xs text-neon-muted hover:text-copper transition-colors">
                GitHub
              </a>
              <a href="#" className="text-xs text-neon-muted hover:text-copper transition-colors">
                Twitter
              </a>
              <a href="#" className="text-xs text-neon-muted hover:text-copper transition-colors">
                Discord
              </a>
            </Flex>
          </Flex>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
