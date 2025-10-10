/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiThrottle from "../aiThrottle.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as companies from "../companies.js";
import type * as publicDomains from "../publicDomains.js";
import type * as roles from "../roles.js";
import type * as rooms from "../rooms.js";
import type * as themes from "../themes.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiThrottle: typeof aiThrottle;
  auth: typeof auth;
  bookings: typeof bookings;
  companies: typeof companies;
  publicDomains: typeof publicDomains;
  roles: typeof roles;
  rooms: typeof rooms;
  themes: typeof themes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
