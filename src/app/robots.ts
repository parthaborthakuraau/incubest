import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/incubator/", "/startup/", "/chat", "/settings"],
      },
    ],
    sitemap: "https://incubest.com/sitemap.xml",
  };
}
