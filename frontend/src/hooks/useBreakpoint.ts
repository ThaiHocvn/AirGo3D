import { Grid } from "antd";

export const useBreakpoint = () => {
  const screens = Grid.useBreakpoint();
  const width = window.innerWidth;

  const isMobile = width <= 420;
  const isSmallMobile = width <= 390;
  const isTablet = width > 420 && width < 768;

  const isDesktop = width >= 768;

  const current = isSmallMobile
    ? "small-mobile"
    : isMobile
    ? "mobile"
    : isTablet
    ? "tablet"
    : "desktop";

  return { screens, isMobile, isSmallMobile, isTablet, isDesktop, current };
};
