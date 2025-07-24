export interface GlassmorphismOverlayConfig {
  background: string;
  backdropFilter: string;
  webkitBackdropFilter: string;
}

export class OverlayStyles {
  private static readonly GLASSMORPHISM_OVERLAY_CONFIG: GlassmorphismOverlayConfig = {
    background: `linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1) 100%
    )`,
    backdropFilter: 'blur(12px) saturate(1.5)',
    webkitBackdropFilter: 'blur(12px) saturate(1.5)'
  };

  private static readonly DARK_OVERLAY_CONFIG = {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'none',
    webkitBackdropFilter: 'none'
  };

  static getGlassmorphismOverlayConfig(): GlassmorphismOverlayConfig {
    return this.GLASSMORPHISM_OVERLAY_CONFIG;
  }

  static getDarkOverlayConfig() {
    return this.DARK_OVERLAY_CONFIG;
  }

  static getGlassmorphismOverlayClasses(): string {
    return 'fixed inset-0 glassmorphism-overlay';
  }

  static getDarkOverlayClasses(): string {
    return 'fixed inset-0 bg-black bg-opacity-50';
  }

  static getGlassmorphismOverlayInlineStyles(): React.CSSProperties {
    const config = this.getGlassmorphismOverlayConfig();
    return {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: config.background,
      backdropFilter: config.backdropFilter,
      WebkitBackdropFilter: config.webkitBackdropFilter,
      zIndex: 40
    };
  }

  static getDarkOverlayInlineStyles(): React.CSSProperties {
    const config = this.getDarkOverlayConfig();
    return {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: config.background,
      backdropFilter: config.backdropFilter,
      WebkitBackdropFilter: config.webkitBackdropFilter,
      zIndex: 40
    };
  }

  static generateGlassmorphismOverlayCSS(): string {
    const config = this.getGlassmorphismOverlayConfig();
    return `
      .glassmorphism-overlay {
        background: ${config.background} !important;
        backdrop-filter: ${config.backdropFilter} !important;
        -webkit-backdrop-filter: ${config.webkitBackdropFilter} !important;
      }
      
      .fixed.inset-0.bg-black.bg-opacity-50 {
        background: ${config.background} !important;
        backdrop-filter: ${config.backdropFilter} !important;
        -webkit-backdrop-filter: ${config.webkitBackdropFilter} !important;
      }
    `;
  }

  static generateAllOverlayCSS(): string {
    return `
      ${this.generateGlassmorphismOverlayCSS()}
      
      .dark-overlay {
        background: ${this.DARK_OVERLAY_CONFIG.background} !important;
        backdrop-filter: ${this.DARK_OVERLAY_CONFIG.backdropFilter} !important;
        -webkit-backdrop-filter: ${this.DARK_OVERLAY_CONFIG.webkitBackdropFilter} !important;
      }
    `;
  }
}