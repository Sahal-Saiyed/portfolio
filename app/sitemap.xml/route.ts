import { projects } from "../data";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const urls = [
    `<url><loc>${origin}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
    ...projects.map(
      (project) =>
        `<url><loc>${origin}/work/${project.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    ),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}

