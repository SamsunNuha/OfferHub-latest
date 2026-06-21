import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ViewportDetails {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  gridColumns: number;
  contentWidth: number;
  padding: number;
}

export function useDimensions(): ViewportDetails {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = dimensions;
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  let gridColumns = 2;
  if (isTablet) {
    gridColumns = 3;
  } else if (isDesktop) {
    gridColumns = 4;
  }

  // Max out screen width on desktop web to maintain an elegant layout
  const contentWidth = isDesktop ? 1200 : width;
  const padding = isMobile ? 16 : isTablet ? 24 : 32;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    gridColumns,
    contentWidth,
    padding
  };
}
export default useDimensions;
