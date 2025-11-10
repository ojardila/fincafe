export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fincafe',
    },
    { status: 200 }
  );
}
