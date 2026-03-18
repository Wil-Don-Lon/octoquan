import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!
const DESTINATION_URL = process.env.DESTINATION_URL!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variant: string }> }
) {
  const { variant } = await params

  fetch(`${APPS_SCRIPT_URL}?variant=${variant}`)
    .catch(() => {})

  return NextResponse.redirect(DESTINATION_URL, { status: 302 })
}
