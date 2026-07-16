import siteConfigRaw from "@/data/site.config.json";

export interface AboutSection {
  heading: string;
  body: string;
}

export interface AboutConfig {
  title: string;
  sections: AboutSection[];
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  city: string;
  categories: string[];
  baseUrl: string;
  about: AboutConfig;
}

const siteConfig = siteConfigRaw as unknown as SiteConfig;
export default siteConfig;