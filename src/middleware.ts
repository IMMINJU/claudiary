import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default intlMiddleware;
export const middleware = intlMiddleware;

export const config = {
  matcher: ["/", "/(ko|en)/:path*"],
};
