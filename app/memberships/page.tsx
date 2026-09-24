import { currentUser } from "@/lib/server/auth";
import { Memberships } from "../live-client";
import { env } from "cloudflare:workers";
import { getPlans } from "@/lib/server/entitlements";
export const dynamic="force-dynamic";
export default async function Page(){return <Memberships signedIn={Boolean(await currentUser())} initial={{plans:await getPlans(),checkoutReady:Boolean(env.RAZORPAY_KEY_ID&&env.RAZORPAY_KEY_SECRET&&env.RAZORPAY_WEBHOOK_SECRET),testMode:env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")??false}}/>;}
