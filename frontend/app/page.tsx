import { Button } from "@/components/ui/button"

// 1. Create a safe fetching function
async function getBackendStatus() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/status', { 
      cache: 'no-store' 
    });

    // If Django returns a 404 or 500 HTML page, catch it before it crashes JSON.parse
    if (!res.ok) {
      return { status: "error", message: `Backend responded with HTTP ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    // If the Django server is turned off entirely
    return { status: "offline", message: "Cannot connect to Django server" };
  }
}

export default async function Home() {
  // 2. Await the safe fetch function
  const data = await getBackendStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="flex flex-col items-center space-y-6 bg-card p-10 rounded-2xl shadow-sm border border-border w-full max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Osworld</h1>
        <p className="text-muted-foreground">Premium apparel and inventory</p>
        
        <div className="bg-secondary p-4 rounded-lg w-full text-sm font-mono text-secondary-foreground border border-border">
          API Status: {data.message}
        </div>

        <Button className="w-full font-semibold">
          Shop the Collection
        </Button>
      </div>
    </main>
  );
}