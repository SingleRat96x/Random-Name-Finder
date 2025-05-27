export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-24 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Welcome to{' '}
          <span className="text-primary">Random Name Finder</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate unique and creative names for all your needs. Whether you&apos;re looking for business names, character names, or any other type of naming inspiration, we&apos;re here to help.
        </p>
        <div className="pt-8">
          <div className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Coming Soon: Name Generation Tools
          </div>
        </div>
      </div>
    </div>
  );
}
