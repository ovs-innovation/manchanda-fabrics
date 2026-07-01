import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const metaTitle = "Manchanda Fabrics — Premium Sarees, Suits & Fabrics";
    const metaDescription =
      "Discover premium ethnic fashion at Manchanda Fabrics. Timeless Banarasi, Silk, and Cotton Sarees, Designer Suits, and curated Fabrics.";
    const favicon = "/logo/logo.png";

    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#FAF7F5" />
          <meta name="color-scheme" content="light" />
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={metaDescription} />
          <meta name="description" content={metaDescription} />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                html, body {
                  margin: 0;
                  padding: 0;
                  background: #FAF7F5;
                  color: #3B2A25;
                  min-height: 100%;
                }
                #__next { min-height: 100vh; background: #FAF7F5; }
              `,
            }}
          />
        </Head>
        <body className="bg-[#FAF7F5] text-[#3B2A25] antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
