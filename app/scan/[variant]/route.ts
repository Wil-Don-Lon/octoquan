import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!
const DESTINATION_URL = process.env.DESTINATION_URL!

export async function GET(
  request: NextRequest,
  { params }: { params: { variant: string } }
) {
  const variant = params.variant

  // Fire-and-forget — log to Google Sheets via Apps Script.
  // We don't await this so the redirect is instant.
  fetch(`${APPS_SCRIPT_URL}?variant=${variant}`)
    .catch(() => {
      // silently ignore logging errors — don't break the redirect
    })

  // Hard redirect from our domain to the ticketing page.
  // Users see octoquan.com/scan/poster1_on_campus in the bar
  // for a split second, then land on Stubs. Clean.
  return NextResponse.redirect(DESTINATION_URL, { status: 302 })
}
