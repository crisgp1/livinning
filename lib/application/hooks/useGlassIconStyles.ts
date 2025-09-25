import { UIStyles } from '@/lib/domain/value-objects/UIStyles';
import { OverlayStyles } from '@/lib/domain/value-objects/OverlayStyles';

export const useGlassIconStyles = () => {
  const getContainerClasses = (): string => {
    return UIStyles.getGlassIconContainerClasses();
  };

  const getHeadingClasses = (): string => {
    return UIStyles.getGlassIconContainerHeadingClasses();
  };

  const getTextClasses = (): string => {
    return UIStyles.getGlassIconContainerTextClasses();
  };

  const getContainerInlineStyles = (): React.CSSProperties => {
    return UIStyles.getGlassIconContainerInlineStyles();
  };

  const getHeadingInlineStyles = (): React.CSSProperties => {
    return UIStyles.getGlassIconContainerHeadingInlineStyles();
  };

  const getTextInlineStyles = (): React.CSSProperties => {
    return UIStyles.getGlassIconContainerTextInlineStyles();
  };

  const generateCSS = (): string => {
    return UIStyles.generateGlassIconContainerCSS();
  };

  // Overlay styles
  const getGlassmorphismOverlayClasses = (): string => {
    return OverlayStyles.getGlassmorphismOverlayClasses();
  };

  const getDarkOverlayClasses = (): string => {
    return OverlayStyles.getDarkOverlayClasses();
  };

  const getGlassmorphismOverlayInlineStyles = (): React.CSSProperties => {
    return OverlayStyles.getGlassmorphismOverlayInlineStyles();
  };

  const getDarkOverlayInlineStyles = (): React.CSSProperties => {
    return OverlayStyles.getDarkOverlayInlineStyles();
  };

  const generateOverlayCSS = (): string => {
    return OverlayStyles.generateAllOverlayCSS();
  };

  const generateAllCSS = (): string => {
    return UIStyles.generateAllUICSS();
  };

  return {
    // Glass icon container
    getContainerClasses,
    getHeadingClasses,
    getTextClasses,
    getContainerInlineStyles,
    getHeadingInlineStyles,
    getTextInlineStyles,
    generateCSS,
    
    // Overlay styles
    getGlassmorphismOverlayClasses,
    getDarkOverlayClasses,
    getGlassmorphismOverlayInlineStyles,
    getDarkOverlayInlineStyles,
    generateOverlayCSS,
    generateAllCSS
  };
};