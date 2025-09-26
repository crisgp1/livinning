import { OverlayStyles } from './OverlayStyles';

export interface GlassIconContainerConfig {
  background: string;
  color: string;
  border: string;
  headingColor: string;
  textColor: string;
}

export class UIStyles {
  private static readonly GLASS_ICON_CONTAINER_CONFIG: GlassIconContainerConfig = {
    background: 'white',
    color: '#1e293b',
    border: '1px solid #e5e7eb',
    headingColor: '#1e293b',
    textColor: '#64748b'
  };

  static getGlassIconContainerStyles(): GlassIconContainerConfig {
    return this.GLASS_ICON_CONTAINER_CONFIG;
  }

  static getGlassIconContainerClasses(): string {
    return 'bg-white text-slate-800 border border-gray-200';
  }

  static getGlassIconContainerHeadingClasses(): string {
    return 'text-slate-800';
  }

  static getGlassIconContainerTextClasses(): string {
    return 'text-slate-600';
  }

  static getGlassIconContainerInlineStyles(): React.CSSProperties {
    const config = this.getGlassIconContainerStyles();
    return {
      background: `${config.background} !important`,
      color: `${config.color} !important`,
      border: config.border
    };
  }

  static getGlassIconContainerHeadingInlineStyles(): React.CSSProperties {
    return {
      color: `${this.GLASS_ICON_CONTAINER_CONFIG.headingColor} !important`
    };
  }

  static getGlassIconContainerTextInlineStyles(): React.CSSProperties {
    return {
      color: `${this.GLASS_ICON_CONTAINER_CONFIG.textColor} !important`
    };
  }

  static generateGlassIconContainerCSS(): string {
    const config = this.getGlassIconContainerStyles();
    return `
      .glass-icon-container {
        background: ${config.background} !important;
        color: ${config.color} !important;
        border: ${config.border} !important;
      }
      
      .glass-icon-container h3 {
        color: ${config.headingColor} !important;
      }
      
      .glass-icon-container p {
        color: ${config.textColor} !important;
      }
    `;
  }

  // Overlay styles integration
  static getGlassmorphismOverlayClasses(): string {
    return OverlayStyles.getGlassmorphismOverlayClasses();
  }

  static getDarkOverlayClasses(): string {
    return OverlayStyles.getDarkOverlayClasses();
  }

  static getGlassmorphismOverlayInlineStyles(): React.CSSProperties {
    return OverlayStyles.getGlassmorphismOverlayInlineStyles();
  }

  static getDarkOverlayInlineStyles(): React.CSSProperties {
    return OverlayStyles.getDarkOverlayInlineStyles();
  }

  static generateAllUICSS(): string {
    return `
      ${this.generateGlassIconContainerCSS()}
      ${OverlayStyles.generateAllOverlayCSS()}
    `;
  }
}