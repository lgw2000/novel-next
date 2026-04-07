import type {Metadata, Viewport} from "next";
import Script from "next/script";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";
import {Providers} from "./providers";
import StyledComponentsRegistry from "@/lib/registry";
import {globalSettingsService} from "@/lib/services/global-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await globalSettingsService.get();
  const faviconPath = process.env.NEXT_PUBLIC_FAVICON_PATH || "/favicon.ico";
  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
    icons: {
      icon: `${faviconPath}?v=2`,
      shortcut: `${faviconPath}?v=2`,
      apple: `${faviconPath}?v=2`,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const settings = await globalSettingsService.get();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&display=swap"
        />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_FAVICON_PATH || "/favicon.ico"}?v=2`} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <NextIntlClientProvider messages={messages}>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </StyledComponentsRegistry>
        {settings.gaTrackingId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaTrackingId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaTrackingId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
